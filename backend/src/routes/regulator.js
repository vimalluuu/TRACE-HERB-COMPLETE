/**
 * Regulator Routes - API endpoints for regulatory review and approval
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
 * /api/regulator/review:
 *   post:
 *     summary: Submit regulatory review decision (approve/reject)
 *     tags: [Regulator]
 */
router.post('/review', async (req, res) => {
  try {
    const { qrCode, decision, reviewerId, reviewer, reason, timestamp } = req.body;
    
    // Debug logging
    console.log('Regulatory review received:', { qrCode, decision, reviewer: reviewer?.name });
    
    // Get original batch data
    const originalBatch = await blockchainService.getProvenanceByQR(qrCode);
    if (!originalBatch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    // Validate workflow - check if regulator can review this batch
    const validation = workflowService.validateBatchSubmission(originalBatch, 'regulator', req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.reason,
        currentStatus: originalBatch.status || 'collected',
        workflowInfo: workflowService.getWorkflowStatus(originalBatch)
      });
    }

    // Create regulatory review event
    const regulatoryEvent = {
      id: `EVENT_${Date.now()}_REG`,
      type: 'Regulatory Review',
      timestamp: timestamp,
      location: {
        coordinates: [0, 0], // Regulator location would be added here
        address: reviewer.location || 'Regulatory Authority',
        altitude: 0,
        accuracy: 10
      },
      performer: {
        id: reviewer.regulatorId || `REG_${Date.now()}`,
        name: reviewer.name,
        role: 'Regulator',
        contact: reviewer.contact || 'Not provided',
        certification: reviewer.certification || 'Regulatory Authority',
        license: reviewer.license || 'Not provided'
      },
      details: {
        reviewId: reviewerId,
        decision: decision, // 'approved' or 'rejected'
        reason: reason || 'No reason provided',
        reviewDate: timestamp,
        notes: `Regulatory decision: ${decision}. ${reason || ''}`
      },
      regulatory: {
        decision: decision,
        reason: reason,
        reviewDate: timestamp,
        reviewerId: reviewerId,
        authority: reviewer.name
      }
    };

    // Determine final status based on decision
    const finalStatus = decision === 'approved' ? 'approved' : 'rejected';

    // Update the original batch with regulatory review event
    const updatedProvenance = {
      ...originalBatch,
      events: [...(originalBatch.events || []), regulatoryEvent],
      status: finalStatus,
      lastUpdated: timestamp,
      regulatory: regulatoryEvent.regulatory
    };

    // Store updated provenance
    await blockchainService.storeCollectionEvent(qrCode, updatedProvenance);
    
    logger.info(`Regulatory review recorded: ${reviewerId} for batch: ${qrCode} - Decision: ${decision}`);

    res.status(201).json({
      success: true,
      message: `Batch ${decision} successfully`,
      data: {
        reviewId: reviewerId,
        qrCode: qrCode,
        decision: decision,
        finalStatus: finalStatus,
        blockchainId: `TX_${Date.now()}_${uuidv4().substr(0, 8)}`,
        provenance: updatedProvenance
      }
    });

  } catch (error) {
    logger.error('Error recording regulatory review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record regulatory review',
      details: error.message
    });
  }
});

/**
 * Get batches pending regulatory review
 */
router.get('/pending', async (req, res) => {
  try {
    // Get all batches accessible to regulator
    const allBatches = await blockchainService.getAllBatches();
    const pendingBatches = workflowService.filterBatchesForPortal(allBatches, 'regulator', 'edit');

    // Filter out already approved or rejected batches
    const trulyPendingBatches = pendingBatches.filter(batch => {
      const hasRegulatoryReview = batch.events?.some(event =>
        event.type === 'Regulatory' || event.type === 'Regulatory Review'
      );
      const isApprovedOrRejected = batch.status === 'approved' || batch.status === 'rejected';

      // Exclude if already reviewed OR if has regulatory event
      return !isApprovedOrRejected && !hasRegulatoryReview;
    });

    // Add workflow status to each batch
    const batchesWithWorkflow = trulyPendingBatches.map(batch => ({
      ...batch,
      workflowStatus: workflowService.getWorkflowStatus(batch),
      hasBeenProcessed: workflowService.hasBeenProcessedBy(batch, 'regulator'),
      canEdit: workflowService.canPortalAccessBatch('regulator', batch.status || 'collected', 'edit').allowed
    }));

    res.json({
      success: true,
      data: {
        totalPending: batchesWithWorkflow.length,
        batches: batchesWithWorkflow
      }
    });

  } catch (error) {
    logger.error('Error fetching pending batches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending batches',
      details: error.message
    });
  }
});

/**
 * Get regulatory review history
 */
router.get('/history', async (req, res) => {
  try {
    const allBatches = await blockchainService.getAllBatches();
    
    // Filter batches that have been reviewed (approved or rejected)
    const reviewedBatches = allBatches.filter(batch => 
      batch.status === 'approved' || batch.status === 'rejected'
    );

    // Add workflow status to each batch
    const batchesWithWorkflow = reviewedBatches.map(batch => ({
      ...batch,
      workflowStatus: workflowService.getWorkflowStatus(batch),
      hasBeenProcessed: workflowService.hasBeenProcessedBy(batch, 'regulator')
    }));

    res.json({
      success: true,
      data: {
        totalReviewed: batchesWithWorkflow.length,
        approved: batchesWithWorkflow.filter(b => b.status === 'approved').length,
        rejected: batchesWithWorkflow.filter(b => b.status === 'rejected').length,
        batches: batchesWithWorkflow
      }
    });

  } catch (error) {
    logger.error('Error fetching review history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch review history',
      details: error.message
    });
  }
});

module.exports = router;
