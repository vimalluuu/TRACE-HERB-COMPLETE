const express = require('express');
const router = express.Router();
const workflowService = require('../services/workflowService');
const blockchainService = require('../services/blockchainService');

/**
 * Get batches accessible to a specific portal
 */
router.get('/batches/:portalType', async (req, res) => {
  try {
    const { portalType } = req.params;
    const { accessType = 'view' } = req.query;

    // Get all batches from blockchain service
    const allBatches = await blockchainService.getAllBatches();
    
    // Filter batches based on portal permissions
    const accessibleBatches = workflowService.filterBatchesForPortal(allBatches, portalType, accessType);

    // Add workflow status to each batch
    const batchesWithWorkflow = accessibleBatches.map(batch => ({
      ...batch,
      workflowStatus: workflowService.getWorkflowStatus(batch),
      hasBeenProcessed: workflowService.hasBeenProcessedBy(batch, portalType),
      canEdit: workflowService.canPortalAccessBatch(portalType, batch.status || 'collected', 'edit').allowed
    }));

    res.json({
      success: true,
      data: {
        portalType,
        accessType,
        totalBatches: batchesWithWorkflow.length,
        batches: batchesWithWorkflow,
        portalPermissions: workflowService.getPortalAccessSummary(portalType)
      }
    });

  } catch (error) {
    console.error('Error fetching workflow batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches for portal',
      error: error.message
    });
  }
});

/**
 * Check if a portal can access a specific batch
 */
router.get('/access/:portalType/:qrCode', async (req, res) => {
  try {
    const { portalType, qrCode } = req.params;
    const { accessType = 'view' } = req.query;

    // Get batch data
    const batchData = await blockchainService.getProvenanceByQR(qrCode);
    if (!batchData) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    const currentStatus = batchData.status || 'collected';
    
    // Check access permissions
    const accessCheck = workflowService.canPortalAccessBatch(portalType, currentStatus, accessType);
    const hasBeenProcessed = workflowService.hasBeenProcessedBy(batchData, portalType);
    const workflowStatus = workflowService.getWorkflowStatus(batchData);

    res.json({
      success: true,
      data: {
        qrCode,
        portalType,
        accessType,
        currentStatus,
        accessAllowed: accessCheck.allowed,
        reason: accessCheck.reason,
        hasBeenProcessed,
        canEdit: accessCheck.allowed && !hasBeenProcessed && accessType === 'edit',
        workflowStatus,
        batch: accessCheck.allowed ? batchData : null
      }
    });

  } catch (error) {
    console.error('Error checking batch access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check batch access',
      error: error.message
    });
  }
});

/**
 * Validate batch submission for a portal
 */
router.post('/validate/:portalType/:qrCode', async (req, res) => {
  try {
    const { portalType, qrCode } = req.params;
    const submissionData = req.body;

    // Get batch data
    const batchData = await blockchainService.getProvenanceByQR(qrCode);
    if (!batchData) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Validate submission
    const validation = workflowService.validateBatchSubmission(batchData, portalType, submissionData);

    res.json({
      success: validation.valid,
      data: {
        qrCode,
        portalType,
        currentStatus: batchData.status || 'collected',
        nextStatus: validation.nextStatus,
        canSubmit: validation.valid,
        reason: validation.reason,
        workflowStatus: workflowService.getWorkflowStatus(batchData)
      }
    });

  } catch (error) {
    console.error('Error validating batch submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate batch submission',
      error: error.message
    });
  }
});

/**
 * Get workflow summary for all portals
 */
router.get('/summary', async (req, res) => {
  try {
    const allBatches = await blockchainService.getAllBatches();
    
    // Count batches by status
    const statusCounts = allBatches.reduce((counts, batch) => {
      const status = batch.status || 'collected';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});

    // Get portal summaries
    const portalSummaries = {};
    const portalTypes = ['farmer', 'processor', 'lab', 'regulator', 'consumer', 'management'];
    
    for (const portalType of portalTypes) {
      const accessibleBatches = workflowService.filterBatchesForPortal(allBatches, portalType, 'view');
      const editableBatches = workflowService.filterBatchesForPortal(allBatches, portalType, 'edit');
      
      portalSummaries[portalType] = {
        totalAccessible: accessibleBatches.length,
        totalEditable: editableBatches.length,
        permissions: workflowService.getPortalAccessSummary(portalType)
      };
    }

    res.json({
      success: true,
      data: {
        totalBatches: allBatches.length,
        statusCounts,
        portalSummaries,
        workflowStages: workflowService.workflowStages
      }
    });

  } catch (error) {
    console.error('Error getting workflow summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workflow summary',
      error: error.message
    });
  }
});

// ===== ENHANCED ROUTES FOR AMAZON-STYLE TRACKING =====

/**
 * Create new batch with enhanced tracking (Farmer only)
 */
router.post('/batches/create', async (req, res) => {
  try {
    const { farmerId, farmerName, herbType, quantity, harvestDate, farmLocation } = req.body;

    if (!farmerId || !farmerName || !herbType || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: farmerId, farmerName, herbType, quantity'
      });
    }

    const batchData = {
      farmerName,
      herbType,
      quantity,
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      farmLocation: farmLocation || 'Unknown Location'
    };

    const batch = workflowService.createBatch(farmerId, batchData);

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: { batch }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get batches for specific portal with enhanced filtering
 */
router.get('/portal/:portalType/batches', async (req, res) => {
  try {
    const { portalType } = req.params;
    const { userId } = req.query;

    const batches = workflowService.getBatchesForPortal(portalType, userId ? parseInt(userId) : null);

    res.json({
      success: true,
      data: {
        batches,
        count: batches.length,
        portal: portalType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update batch state with automatic transitions
 */
router.put('/batches/:batchId/state', async (req, res) => {
  try {
    const { newState, actor, notes, location } = req.body;

    if (!newState || !actor) {
      return res.status(400).json({
        success: false,
        message: 'newState and actor are required'
      });
    }

    const batch = workflowService.updateBatchState(
      req.params.batchId,
      newState,
      actor,
      notes || '',
      location || ''
    );

    res.json({
      success: true,
      message: 'Batch state updated successfully',
      data: { batch }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get batch timeline for Amazon-style tracking
 */
router.get('/track/:identifier', async (req, res) => {
  try {
    const timeline = workflowService.getBatchTimeline(req.params.identifier);

    res.json({
      success: true,
      data: { timeline }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get notifications for user
 */
router.get('/notifications/:userId/:portal', async (req, res) => {
  try {
    const { userId, portal } = req.params;
    const notifications = workflowService.getNotifications(parseInt(userId), portal);

    res.json({
      success: true,
      data: {
        notifications,
        count: notifications.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Quick actions for different portals
 */
router.post('/batches/:batchId/actions/:action', async (req, res) => {
  try {
    const { batchId, action } = req.params;
    const { actor, notes, location } = req.body;

    let newState;
    let message;

    switch (action) {
      case 'harvest':
        newState = workflowService.BATCH_STATES.HARVESTED;
        message = 'Batch harvested successfully';
        break;
      case 'accept-processing':
        newState = workflowService.BATCH_STATES.RECEIVED_BY_PROCESSOR;
        message = 'Batch accepted for processing';
        break;
      case 'start-processing':
        newState = workflowService.BATCH_STATES.PROCESSING;
        message = 'Processing started';
        break;
      case 'complete-processing':
        newState = workflowService.BATCH_STATES.PROCESSED;
        message = 'Processing completed';
        break;
      case 'accept-testing':
        newState = workflowService.BATCH_STATES.RECEIVED_BY_LAB;
        message = 'Batch accepted for testing';
        break;
      case 'start-testing':
        newState = workflowService.BATCH_STATES.TESTING;
        message = 'Testing started';
        break;
      case 'complete-testing':
        newState = workflowService.BATCH_STATES.TESTED;
        message = 'Testing completed';
        break;
      case 'accept-review':
        newState = workflowService.BATCH_STATES.RECEIVED_BY_REGULATOR;
        message = 'Batch accepted for regulatory review';
        break;
      case 'start-review':
        newState = workflowService.BATCH_STATES.COMPLIANCE_REVIEW;
        message = 'Compliance review started';
        break;
      case 'approve':
        newState = workflowService.BATCH_STATES.APPROVED;
        message = 'Batch approved';
        break;
      case 'reject':
        newState = workflowService.BATCH_STATES.REJECTED;
        message = 'Batch rejected';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const batch = workflowService.updateBatchState(
      batchId,
      newState,
      actor || 'Unknown User',
      notes || `${action} performed`,
      location || 'Unknown Location'
    );

    res.json({
      success: true,
      message,
      data: { batch }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get available states for portal
 */
router.get('/portal/:portalType/states', async (req, res) => {
  try {
    const { portalType } = req.params;
    const availableStates = workflowService.portalStates[portalType] || [];

    res.json({
      success: true,
      data: {
        states: availableStates,
        portal: portalType,
        allStates: workflowService.BATCH_STATES
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
