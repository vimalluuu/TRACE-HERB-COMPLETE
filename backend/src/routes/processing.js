/**
 * Processing Routes - API endpoints for herb processing events
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
 * /api/processing/events:
 *   post:
 *     summary: Record a processing event and update provenance
 *     tags: [Processing]
 */
router.post('/events', async (req, res) => {
  try {
    const { originalQrCode, processingId, processor, processing, quality, timestamp, status } = req.body;

    // Debug logging
    console.log('Processing event received:', { originalQrCode, processingId, processor: processor?.name });

    // Get original batch data
    const originalBatch = await blockchainService.getProvenanceByQR(originalQrCode);
    if (!originalBatch) {
      return res.status(404).json({
        success: false,
        error: 'Original batch not found'
      });
    }

    // Validate workflow - check if processor can process this batch
    const validation = workflowService.validateBatchSubmission(originalBatch, 'processor', req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.reason,
        currentStatus: originalBatch.status || 'collected',
        workflowInfo: workflowService.getWorkflowStatus(originalBatch)
      });
    }

    // Create processing event
    const processingEvent = {
      id: `EVENT_${Date.now()}_PROC`,
      type: 'Processing',
      timestamp: timestamp,
      location: {
        coordinates: [0, 0], // Processor location would be added here
        address: processor.location || 'Processing Facility',
        altitude: 0,
        accuracy: 10
      },
      performer: {
        id: processor.facilityId || `PROC_${Date.now()}`,
        name: processor.name,
        role: 'Processor',
        contact: processor.contact || 'Not provided',
        certification: processor.certification || 'GMP',
        license: processor.license || 'Not provided'
      },
      details: {
        method: processing.method,
        equipment: processing.equipment,
        temperature: processing.temperature ? `${processing.temperature}°C` : 'Not specified',
        duration: processing.duration ? `${processing.duration} hours` : 'Not specified',
        humidity: processing.humidity ? `${processing.humidity}%` : 'Not specified',
        batchSize: processing.batchSize ? `${processing.batchSize} kg` : 'Not specified',
        yield: processing.yield ? `${processing.yield}%` : 'Not specified',
        notes: processing.notes || 'No additional notes'
      },
      quality: {
        moisture: quality.moisture ? `${quality.moisture}%` : 'Not tested',
        color: quality.color,
        texture: quality.texture,
        aroma: quality.aroma,
        contamination: quality.contamination,
        packaging: quality.packaging,
        storageConditions: quality.storageConditions,
        notes: quality.notes || 'No quality notes'
      }
    };

    // Update the original batch with processing event
    const updatedProvenance = {
      ...originalBatch,
      events: [...(originalBatch.events || []), processingEvent],
      status: validation.nextStatus, // Use workflow-determined status
      lastUpdated: timestamp
    };

    // Generate new QR code for processed batch
    const processedQrCode = `QR_PROC_${processingId}`;

    // Store updated provenance with new QR code
    await blockchainService.storeCollectionEvent(processedQrCode, updatedProvenance);

    // Also update the original QR code with processing info
    await blockchainService.storeCollectionEvent(originalQrCode, updatedProvenance);

    logger.info(`Processing event recorded: ${processingId} for batch: ${originalQrCode}`);

    res.status(201).json({
      success: true,
      message: 'Processing event recorded successfully',
      data: {
        processingId: processingId,
        originalQrCode: originalQrCode,
        processedQrCode: processedQrCode,
        blockchainId: `TX_${Date.now()}_${uuidv4().substr(0, 8)}`,
        provenance: updatedProvenance
      }
    });

  } catch (error) {
    logger.error('Error recording processing event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record processing event',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/processing:
 *   post:
 *     summary: Record a processing event
 *     tags: [Processing]
 */
router.post('/', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Processing event recorded',
      data: req.body
    });
  } catch (error) {
    logger.error('Processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/processing/{id}:
 *   get:
 *     summary: Get processing event by ID
 *     tags: [Processing]
 */
router.get('/:id', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.params.id,
        type: 'processing',
        status: 'completed'
      }
    });
  } catch (error) {
    logger.error('Processing retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
