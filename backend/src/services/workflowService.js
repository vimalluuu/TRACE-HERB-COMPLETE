/**
 * Enhanced Workflow Service - Amazon-style Batch Tracking
 * Handles automatic batch flow between portals with real-time status updates
 */

const { v4: uuidv4 } = require('uuid');

class WorkflowService {
  constructor() {
    // Enhanced batch status definitions
    this.BATCH_STATES = {
      CREATED: 'CREATED',
      HARVESTED: 'HARVESTED',
      IN_TRANSIT_TO_PROCESSOR: 'IN_TRANSIT_TO_PROCESSOR',
      RECEIVED_BY_PROCESSOR: 'RECEIVED_BY_PROCESSOR',
      PROCESSING: 'PROCESSING',
      PROCESSED: 'PROCESSED',
      IN_TRANSIT_TO_LAB: 'IN_TRANSIT_TO_LAB',
      RECEIVED_BY_LAB: 'RECEIVED_BY_LAB',
      TESTING: 'TESTING',
      TESTED: 'TESTED',
      IN_TRANSIT_TO_REGULATOR: 'IN_TRANSIT_TO_REGULATOR',
      RECEIVED_BY_REGULATOR: 'RECEIVED_BY_REGULATOR',
      COMPLIANCE_REVIEW: 'COMPLIANCE_REVIEW',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      READY_FOR_MARKET: 'READY_FOR_MARKET'
    };

    // Enhanced workflow state machine
    this.stateTransitions = {
      [this.BATCH_STATES.CREATED]: [this.BATCH_STATES.HARVESTED],
      [this.BATCH_STATES.HARVESTED]: [this.BATCH_STATES.IN_TRANSIT_TO_PROCESSOR],
      [this.BATCH_STATES.IN_TRANSIT_TO_PROCESSOR]: [this.BATCH_STATES.RECEIVED_BY_PROCESSOR],
      [this.BATCH_STATES.RECEIVED_BY_PROCESSOR]: [this.BATCH_STATES.PROCESSING],
      [this.BATCH_STATES.PROCESSING]: [this.BATCH_STATES.PROCESSED],
      [this.BATCH_STATES.PROCESSED]: [this.BATCH_STATES.IN_TRANSIT_TO_LAB],
      [this.BATCH_STATES.IN_TRANSIT_TO_LAB]: [this.BATCH_STATES.RECEIVED_BY_LAB],
      [this.BATCH_STATES.RECEIVED_BY_LAB]: [this.BATCH_STATES.TESTING],
      [this.BATCH_STATES.TESTING]: [this.BATCH_STATES.TESTED],
      [this.BATCH_STATES.TESTED]: [this.BATCH_STATES.IN_TRANSIT_TO_REGULATOR],
      [this.BATCH_STATES.IN_TRANSIT_TO_REGULATOR]: [this.BATCH_STATES.RECEIVED_BY_REGULATOR],
      [this.BATCH_STATES.RECEIVED_BY_REGULATOR]: [this.BATCH_STATES.COMPLIANCE_REVIEW],
      [this.BATCH_STATES.COMPLIANCE_REVIEW]: [this.BATCH_STATES.APPROVED, this.BATCH_STATES.REJECTED],
      [this.BATCH_STATES.APPROVED]: [this.BATCH_STATES.READY_FOR_MARKET],
      [this.BATCH_STATES.REJECTED]: [], // Terminal state
      [this.BATCH_STATES.READY_FOR_MARKET]: [] // Terminal state
    };

    // Portal responsibilities
    this.portalStates = {
      farmer: [this.BATCH_STATES.CREATED, this.BATCH_STATES.HARVESTED],
      processor: [
        this.BATCH_STATES.RECEIVED_BY_PROCESSOR,
        this.BATCH_STATES.PROCESSING,
        this.BATCH_STATES.PROCESSED
      ],
      lab: [
        this.BATCH_STATES.RECEIVED_BY_LAB,
        this.BATCH_STATES.TESTING,
        this.BATCH_STATES.TESTED
      ],
      regulator: [
        this.BATCH_STATES.RECEIVED_BY_REGULATOR,
        this.BATCH_STATES.COMPLIANCE_REVIEW,
        this.BATCH_STATES.APPROVED,
        this.BATCH_STATES.REJECTED
      ]
    };

    // Legacy compatibility - map old stages to new states
    this.workflowStages = {
      'collected': {
        nextStage: 'processed',
        allowedPortals: ['processor'],
        description: 'Ready for processing',
        newState: this.BATCH_STATES.HARVESTED
      },
      'processed': {
        nextStage: 'tested',
        allowedPortals: ['lab'],
        description: 'Ready for laboratory testing',
        newState: this.BATCH_STATES.PROCESSED
      },
      'tested': {
        nextStage: 'approved',
        allowedPortals: ['regulator'],
        description: 'Ready for regulatory review',
        newState: this.BATCH_STATES.TESTED
      },
      'approved': {
        nextStage: null,
        allowedPortals: ['consumer'],
        description: 'Approved for consumer access',
        newState: this.BATCH_STATES.APPROVED
      },
      'rejected': {
        nextStage: null,
        allowedPortals: [],
        description: 'Rejected by regulator',
        newState: this.BATCH_STATES.REJECTED
      }
    };

    // Portal access permissions
    this.portalPermissions = {
      'farmer': {
        canCreate: true,
        canView: ['collected', 'processed', 'tested', 'approved', 'rejected'],
        canEdit: ['collected'], // Can only edit their own collected batches
        description: 'Can create and edit collected batches'
      },
      'processor': {
        canCreate: false,
        canView: ['collected', 'processed', 'tested', 'approved', 'rejected'],
        canEdit: ['collected'], // Can process collected batches
        description: 'Can process collected batches'
      },
      'lab': {
        canCreate: false,
        canView: ['collected', 'processed', 'tested', 'approved', 'rejected'],
        canEdit: ['processed'], // Can test processed batches
        description: 'Can test processed batches'
      },
      'regulator': {
        canCreate: false,
        canView: ['tested', 'approved', 'rejected'],
        canEdit: ['tested'], // Can only review tested batches
        description: 'Can review tested batches'
      },
      'consumer': {
        canCreate: false,
        canView: ['approved'], // Can only see approved batches
        canEdit: [],
        description: 'Can view approved batches only'
      },
      'management': {
        canCreate: false,
        canView: ['collected', 'processed', 'tested', 'approved', 'rejected'],
        canEdit: [], // Management can view all but not edit
        description: 'Can view all batches for monitoring'
      }
    };
  }

  /**
   * Check if a portal can access a batch in its current status
   */
  canPortalAccessBatch(portalType, batchStatus, accessType = 'view') {
    const permissions = this.portalPermissions[portalType];
    if (!permissions) {
      return { allowed: false, reason: 'Invalid portal type' };
    }

    if (accessType === 'view') {
      const canView = permissions.canView.includes(batchStatus);
      return {
        allowed: canView,
        reason: canView ? 'Access granted' : `${portalType} portal cannot view batches with status: ${batchStatus}`
      };
    }

    if (accessType === 'edit') {
      const canEdit = permissions.canEdit.includes(batchStatus);
      return {
        allowed: canEdit,
        reason: canEdit ? 'Edit access granted' : `${portalType} portal cannot edit batches with status: ${batchStatus}`
      };
    }

    return { allowed: false, reason: 'Invalid access type' };
  }

  /**
   * Get batches that a portal can access
   */
  filterBatchesForPortal(batches, portalType, accessType = 'view') {
    const permissions = this.portalPermissions[portalType];
    if (!permissions) return [];

    const allowedStatuses = accessType === 'edit' ? permissions.canEdit : permissions.canView;

    // Remove duplicates based on QR code first
    const uniqueBatches = batches.reduce((acc, batch) => {
      const qrCode = batch.target?.qrCode || batch.id;
      if (!acc.find(b => (b.target?.qrCode || b.id) === qrCode)) {
        acc.push(batch);
      }
      return acc;
    }, []);

    return uniqueBatches.filter(batch => {
      // Determine actual batch status from events
      const actualStatus = this.getBatchCurrentStatus(batch);

      // For dashboard view, only show batches that are ready for this portal's work
      if (accessType === 'view') {
        // Processor: only show 'collected' batches (not yet processed)
        if (portalType === 'processor') {
          return actualStatus === 'collected';
        }
        // Lab: only show 'processed' batches (not yet tested)
        if (portalType === 'lab') {
          return actualStatus === 'processed';
        }
        // Regulator: only show 'tested' batches (not yet approved/rejected)
        if (portalType === 'regulator') {
          return actualStatus === 'tested';
        }
      }

      // For edit access, use the original logic
      return allowedStatuses.includes(actualStatus);
    });
  }

  /**
   * Get the current status of a batch based on its events
   */
  getBatchCurrentStatus(batch) {
    if (!batch.events || !Array.isArray(batch.events)) {
      return 'collected'; // Default status
    }

    // Sort events by timestamp to get the latest event
    const sortedEvents = batch.events.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.effectiveDateTime || 0).getTime();
      const timeB = new Date(b.timestamp || b.effectiveDateTime || 0).getTime();
      return timeB - timeA; // Latest first
    });

    // Check the most recent event type
    for (const event of sortedEvents) {
      const eventType = event.type || event.code?.text || '';

      // Check for approval/rejection (final states)
      if (eventType.includes('Approval') || eventType.includes('Compliance Approved')) {
        return 'approved';
      }
      if (eventType.includes('Rejection') || eventType.includes('Compliance Rejected')) {
        return 'rejected';
      }

      // Check for testing completion
      if (eventType.includes('Testing') || eventType.includes('Laboratory Testing') ||
          eventType.includes('Quality Test') || eventType.includes('Lab Test')) {
        return 'tested';
      }

      // Check for processing completion
      if (eventType.includes('Processing') || eventType.includes('Processed')) {
        return 'processed';
      }

      // Check for collection
      if (eventType.includes('Collection') || eventType.includes('Collected')) {
        return 'collected';
      }
    }

    return 'collected'; // Default fallback
  }

  /**
   * Validate workflow transition
   */
  canTransitionToNextStage(currentStatus, portalType) {
    const stage = this.workflowStages[currentStatus];
    if (!stage) {
      return { allowed: false, reason: 'Invalid current status' };
    }

    if (!stage.allowedPortals.includes(portalType)) {
      return { 
        allowed: false, 
        reason: `Only ${stage.allowedPortals.join(', ')} portals can process batches with status: ${currentStatus}` 
      };
    }

    return { 
      allowed: true, 
      nextStatus: stage.nextStage,
      reason: 'Transition allowed' 
    };
  }

  /**
   * Get workflow status for a batch
   */
  getWorkflowStatus(batch) {
    const status = batch.status || 'collected';
    const stage = this.workflowStages[status];
    
    return {
      currentStage: status,
      description: stage ? stage.description : 'Unknown stage',
      nextStage: stage ? stage.nextStage : null,
      allowedPortals: stage ? stage.allowedPortals : [],
      isComplete: status === 'approved' || status === 'rejected'
    };
  }

  /**
   * Check if a batch has been processed by a specific portal
   */
  hasBeenProcessedBy(batch, portalType) {
    if (!batch.events) return false;

    const portalEventTypes = {
      'farmer': 'Collection',
      'processor': 'Processing',
      'lab': 'Laboratory Testing',
      'regulator': 'Regulatory Review'
    };

    const eventType = portalEventTypes[portalType];
    if (!eventType) return false;

    return batch.events.some(event => event.type === eventType);
  }

  /**
   * Get portal access summary
   */
  getPortalAccessSummary(portalType) {
    const permissions = this.portalPermissions[portalType];
    if (!permissions) return null;

    return {
      portalType,
      description: permissions.description,
      canCreate: permissions.canCreate,
      canView: permissions.canView,
      canEdit: permissions.canEdit,
      workflowStages: this.workflowStages
    };
  }

  /**
   * Validate batch submission for a portal
   */
  validateBatchSubmission(batch, portalType, submissionData) {
    const currentStatus = batch.status || 'collected';
    
    // Check if portal can edit this batch
    const editAccess = this.canPortalAccessBatch(portalType, currentStatus, 'edit');
    if (!editAccess.allowed) {
      return { valid: false, reason: editAccess.reason };
    }

    // Check if batch has already been processed by this portal
    if (this.hasBeenProcessedBy(batch, portalType)) {
      return { 
        valid: false, 
        reason: `This batch has already been processed by the ${portalType} portal. Only view access is allowed.` 
      };
    }

    // Validate workflow transition
    const transition = this.canTransitionToNextStage(currentStatus, portalType);
    if (!transition.allowed) {
      return { valid: false, reason: transition.reason };
    }

    return { 
      valid: true, 
      nextStatus: transition.nextStatus,
      reason: 'Submission valid' 
    };
  }

  // ===== ENHANCED METHODS FOR AMAZON-STYLE TRACKING =====

  /**
   * Create new batch with enhanced tracking
   */
  createBatch(farmerId, batchData) {
    const batchId = `TH-2024-${String(this.nextBatchId++).padStart(3, '0')}`;

    const newBatch = {
      id: batchId,
      farmerId: farmerId,
      farmerName: batchData.farmerName,
      herbType: batchData.herbType,
      quantity: batchData.quantity,
      harvestDate: batchData.harvestDate,
      currentState: this.BATCH_STATES.CREATED,
      currentLocation: batchData.farmLocation,
      estimatedCompletion: this.calculateEstimatedCompletion(),
      qrCode: `https://traceherbdemo.com/track/${batchId}`,
      timeline: [
        {
          state: this.BATCH_STATES.CREATED,
          timestamp: new Date().toISOString(),
          location: batchData.farmLocation,
          actor: batchData.farmerName,
          notes: `Batch created for ${batchData.herbType}`
        }
      ],
      assignedProcessor: this.autoAssignProcessor(batchData.herbType),
      assignedLab: this.autoAssignLab(),
      assignedRegulator: this.autoAssignRegulator()
    };

    this.batches.push(newBatch);
    this.createNotification('batch_created', newBatch);

    return newBatch;
  }

  /**
   * Update batch state with automatic transitions
   */
  updateBatchState(batchId, newState, actor, notes = '', location = '') {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    // Validate state transition
    const allowedTransitions = this.stateTransitions[batch.currentState];
    if (!allowedTransitions.includes(newState)) {
      throw new Error(`Invalid state transition from ${batch.currentState} to ${newState}`);
    }

    // Update batch
    batch.currentState = newState;
    batch.currentLocation = location || batch.currentLocation;

    // Add to timeline
    batch.timeline.push({
      state: newState,
      timestamp: new Date().toISOString(),
      location: location || batch.currentLocation,
      actor: actor,
      notes: notes
    });

    // Handle automatic transitions
    this.handleAutomaticTransitions(batch);

    // Create notification
    this.createNotification('state_changed', batch, newState);

    return batch;
  }

  /**
   * Get batches for specific portal with enhanced filtering
   */
  getBatchesForPortal(portal, userId = null) {
    const relevantStates = this.portalStates[portal] || [];

    return this.batches.filter(batch => {
      // Check if batch is in relevant state for this portal
      const isRelevantState = relevantStates.includes(batch.currentState);

      // Additional filtering based on portal
      switch (portal) {
        case 'farmer':
          return batch.farmerId === userId;
        case 'processor':
          return isRelevantState && batch.assignedProcessor?.id === userId;
        case 'lab':
          return isRelevantState && batch.assignedLab?.id === userId;
        case 'regulator':
          return isRelevantState && batch.assignedRegulator?.id === userId;
        default:
          return isRelevantState;
      }
    });
  }

  /**
   * Get batch timeline for Amazon-style tracking
   */
  getBatchTimeline(batchId) {
    const batch = this.batches.find(b => b.id === batchId || b.qrCode.includes(batchId));
    if (!batch) {
      throw new Error('Batch not found');
    }

    return {
      batchId: batch.id,
      herbType: batch.herbType,
      quantity: batch.quantity,
      currentState: batch.currentState,
      currentLocation: batch.currentLocation,
      estimatedCompletion: batch.estimatedCompletion,
      timeline: batch.timeline,
      progress: this.calculateProgress(batch.currentState)
    };
  }

  /**
   * Calculate progress percentage
   */
  calculateProgress(currentState) {
    const stateOrder = Object.values(this.BATCH_STATES);
    const currentIndex = stateOrder.indexOf(currentState);
    return Math.round((currentIndex / (stateOrder.length - 1)) * 100);
  }

  /**
   * Handle automatic state transitions
   */
  handleAutomaticTransitions(batch) {
    const autoTransitions = {
      [this.BATCH_STATES.HARVESTED]: this.BATCH_STATES.IN_TRANSIT_TO_PROCESSOR,
      [this.BATCH_STATES.PROCESSED]: this.BATCH_STATES.IN_TRANSIT_TO_LAB,
      [this.BATCH_STATES.TESTED]: this.BATCH_STATES.IN_TRANSIT_TO_REGULATOR,
      [this.BATCH_STATES.APPROVED]: this.BATCH_STATES.READY_FOR_MARKET
    };

    const nextState = autoTransitions[batch.currentState];
    if (nextState) {
      setTimeout(() => {
        this.updateBatchState(
          batch.id,
          nextState,
          'System',
          'Automatic transition',
          this.getTransitLocation(nextState)
        );
      }, 2000); // 2 second delay for demo
    }
  }

  /**
   * Auto-assign processor, lab, regulator
   */
  autoAssignProcessor(herbType) {
    return { id: 2, name: 'Amit Patel', company: 'Herbal Processing Industries Ltd.' };
  }

  autoAssignLab() {
    return { id: 3, name: 'Dr. Priya Sharma', lab: 'Advanced Herbal Testing Laboratory' };
  }

  autoAssignRegulator() {
    return { id: 4, name: 'Dr. Meera Singh', department: 'FSSAI' };
  }

  /**
   * Calculate estimated completion date
   */
  calculateEstimatedCompletion() {
    const now = new Date();
    const estimatedDays = 15; // Average processing time
    const completion = new Date(now.getTime() + (estimatedDays * 24 * 60 * 60 * 1000));
    return completion.toISOString().split('T')[0];
  }

  /**
   * Get transit location for state
   */
  getTransitLocation(state) {
    const locations = {
      [this.BATCH_STATES.IN_TRANSIT_TO_PROCESSOR]: 'En route to Processor',
      [this.BATCH_STATES.IN_TRANSIT_TO_LAB]: 'En route to Laboratory',
      [this.BATCH_STATES.IN_TRANSIT_TO_REGULATOR]: 'En route to Regulatory Office'
    };
    return locations[state] || 'In Transit';
  }

  /**
   * Create notification
   */
  createNotification(type, batch, additionalData = null) {
    const notification = {
      id: Date.now(),
      type: type,
      batchId: batch.id,
      message: this.generateNotificationMessage(type, batch, additionalData),
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.push(notification);
    return notification;
  }

  /**
   * Generate notification message
   */
  generateNotificationMessage(type, batch, additionalData) {
    switch (type) {
      case 'batch_created':
        return `New batch ${batch.id} created for ${batch.herbType}`;
      case 'state_changed':
        return `Batch ${batch.id} status updated to ${additionalData}`;
      default:
        return `Update for batch ${batch.id}`;
    }
  }

  /**
   * Get notifications for user
   */
  getNotifications(userId, portal) {
    const userBatches = this.getBatchesForPortal(portal, userId);
    const userBatchIds = userBatches.map(b => b.id);

    return this.notifications
      .filter(n => userBatchIds.includes(n.batchId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

module.exports = new WorkflowService();
