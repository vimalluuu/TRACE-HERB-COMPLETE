/**
 * Lab Routes - API endpoints for laboratory testing events
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { protect: auth } = require('../middleware/auth');
const blockchainService = require('../services/blockchainService');
const workflowService = require('../services/workflowService');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/lab/events:
 *   post:
 *     summary: Record a lab testing event and generate certificate
 *     tags: [Laboratory]
 */
router.post('/events', async (req, res) => {
  try {
    const { originalQrCode, testId, lab, tests, certificate, timestamp, status } = req.body;
    
    // Debug logging
    console.log('Lab testing event received:', { originalQrCode, testId, lab: lab?.name });
    
    // Get original batch data
    const originalBatch = await blockchainService.getProvenanceByQR(originalQrCode);
    if (!originalBatch) {
      return res.status(404).json({
        success: false,
        error: 'Original batch not found'
      });
    }

    // Validate workflow - check if lab can test this batch
    const validation = workflowService.validateBatchSubmission(originalBatch, 'lab', req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.reason,
        currentStatus: originalBatch.status || 'collected',
        workflowInfo: workflowService.getWorkflowStatus(originalBatch)
      });
    }

    // Create lab testing event
    const labEvent = {
      id: `EVENT_${Date.now()}_LAB`,
      type: 'Laboratory Testing',
      timestamp: timestamp,
      location: {
        coordinates: [0, 0], // Lab location would be added here
        address: lab.location || 'Laboratory Facility',
        altitude: 0,
        accuracy: 10
      },
      performer: {
        id: lab.labId || `LAB_${Date.now()}`,
        name: lab.name,
        role: 'Laboratory',
        contact: lab.contact || 'Not provided',
        certification: lab.accreditation || 'ISO/IEC 17025',
        technician: lab.technician || 'Not specified'
      },
      details: {
        testId: testId,
        moisture: tests.moisture ? `${tests.moisture}%` : 'Not tested',
        pesticides: tests.pesticides,
        heavyMetals: tests.heavyMetals,
        microbial: tests.microbial,
        dnaAuthenticity: tests.dnaAuthenticity,
        activeCompounds: tests.activeCompounds ? `${tests.activeCompounds}%` : 'Not tested',
        purity: tests.purity ? `${tests.purity}%` : 'Not tested',
        contamination: tests.contamination,
        notes: tests.notes || 'No additional test notes'
      },
      certificate: {
        certificateId: certificate.certificateId,
        testDate: certificate.testDate,
        expiryDate: certificate.expiryDate,
        overallGrade: certificate.overallGrade,
        compliance: certificate.compliance,
        recommendations: certificate.recommendations || 'No recommendations',
        notes: certificate.notes || 'No certificate notes',
        issued: timestamp,
        issuedBy: lab.name
      }
    };

    // Update the original batch with lab testing event
    const updatedProvenance = {
      ...originalBatch,
      events: [...(originalBatch.events || []), labEvent],
      status: validation.nextStatus, // Use workflow-determined status
      lastUpdated: timestamp,
      certificate: labEvent.certificate
    };

    // Generate new QR code for tested batch
    const testedQrCode = `QR_LAB_${testId}`;
    
    // Store updated provenance with new QR code
    await blockchainService.storeCollectionEvent(testedQrCode, updatedProvenance);
    
    // Also update the original QR code with lab testing info
    await blockchainService.storeCollectionEvent(originalQrCode, updatedProvenance);
    
    logger.info(`Lab testing event recorded: ${testId} for batch: ${originalQrCode}`);

    res.status(201).json({
      success: true,
      message: 'Lab testing event recorded successfully',
      data: {
        testId: testId,
        originalQrCode: originalQrCode,
        testedQrCode: testedQrCode,
        certificateId: certificate.certificateId,
        blockchainId: `TX_${Date.now()}_${uuidv4().substr(0, 8)}`,
        provenance: updatedProvenance
      }
    });

  } catch (error) {
    logger.error('Error recording lab testing event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record lab testing event',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/lab/certificates/{certificateId}:
 *   get:
 *     summary: Get certificate by ID
 *     tags: [Laboratory]
 */
router.get('/certificates/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    // This would typically query a certificate database
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      message: 'Certificate retrieved',
      data: {
        certificateId: certificateId,
        status: 'Valid',
        downloadUrl: `/api/lab/certificates/${certificateId}/download`
      }
    });
  } catch (error) {
    logger.error('Certificate retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
