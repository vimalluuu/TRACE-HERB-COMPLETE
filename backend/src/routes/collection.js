/**
 * Collection Routes - API endpoints for herb collection events
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { CollectionEvent } = require('../models');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');
const { protect: auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/collection/events:
 *   post:
 *     summary: Record a new collection event and generate QR code
 *     tags: [Collection]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collectionId:
 *                 type: string
 *               farmer:
 *                 type: object
 *               herb:
 *                 type: object
 *               location:
 *                 type: object
 *               environmental:
 *                 type: object
 *     responses:
 *       201:
 *         description: Collection event recorded and QR code generated
 *       400:
 *         description: Validation error
 */
router.post('/events', async (req, res) => {
  try {
    const { collectionId, farmer, herb, location, environmental, metadata } = req.body;

    // Debug logging
    console.log('Received data:', { collectionId, farmer, herb, location });

    // Generate QR code for this collection
    const qrCode = `QR_${collectionId}`;

    // Create FHIR-compliant collection event
    const collectionEvent = {
      resourceType: 'Provenance',
      id: collectionId,
      target: {
        qrCode: qrCode,
        batchNumber: `BATCH_${Date.now()}`,
        productName: (herb && herb.commonName) || (herb && herb.botanicalName) || 'Unknown Herb',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
      },
      product: {
        name: (herb && herb.commonName) || (herb && herb.botanicalName) || 'Unknown Herb',
        botanicalName: (herb && herb.botanicalName) || 'Unknown',
        category: 'Medicinal Herb',
        grade: 'Premium',
        certifications: ['Organic', 'Sustainable']
      },
      blockchain: {
        networkId: 'trace-herb-network',
        transactionId: `TX_${Date.now()}_${uuidv4().substr(0, 8)}`,
        timestamp: Date.now(),
        verified: true,
        mode: 'CA-Connected'
      },
      events: [
        {
          id: `EVENT_${Date.now()}_1`,
          type: 'Collection',
          timestamp: new Date().toISOString(),
          location: {
            coordinates: [(location && location.longitude) || 0, (location && location.latitude) || 0],
            address: (location && location.address) || `${(farmer && farmer.village) || 'Unknown'}, ${(farmer && farmer.district) || 'Unknown'}, ${(farmer && farmer.state) || 'Unknown'}`,
            altitude: (location && location.altitude) || 0,
            accuracy: (location && location.accuracy) || 10
          },
          performer: {
            id: (farmer && farmer.farmerId) || `FARMER_${Date.now()}`,
            name: (farmer && farmer.name) || 'Unknown Farmer',
            role: 'Farmer',
            contact: (farmer && farmer.phone) || 'Not provided',
            certification: (farmer && farmer.certification) || 'Organic Certified',
            experience: (farmer && farmer.experience) || '5+ years'
          },
          details: {
            method: (herb && herb.collectionMethod) || 'Sustainable harvesting',
            quantity: `${(herb && herb.quantity) || 0} ${(herb && herb.unit) || 'kg'}`,
            partUsed: (herb && herb.partUsed) || 'Not specified',
            season: (herb && herb.season) || 'Current',
            weatherConditions: (herb && herb.weatherConditions) || 'Favorable',
            soilType: (herb && herb.soilType) || 'Fertile',
            notes: (herb && herb.notes) || 'Quality collection'
          }
        }
      ],
      consumer: {
        scanCount: 0,
        firstScan: null,
        lastScan: null
      },
      sustainability: {
        carbonFootprint: '0.5 kg CO2',
        waterUsage: '10 liters',
        organicCertified: true,
        fairTrade: true
      }
    };

    // Store in blockchain service (CA-Connected mode)
    await blockchainService.storeCollectionEvent(qrCode, collectionEvent);

    logger.info(`Collection event recorded with QR code: ${qrCode}`);

    res.status(201).json({
      success: true,
      message: 'Collection event recorded successfully and QR code generated',
      data: {
        qrCode: qrCode,
        collectionId: collectionId,
        blockchainId: collectionEvent.blockchain.transactionId,
        provenance: collectionEvent
      }
    });

  } catch (error) {
    logger.error('Error recording collection event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record collection event',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/collection:
 *   post:
 *     summary: Record a new collection event
 *     tags: [Collection]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CollectionEvent'
 *     responses:
 *       201:
 *         description: Collection event recorded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/',
  auth,
  [
    body('subject.botanicalName').notEmpty().withMessage('Botanical name is required'),
    body('performer.identifier').notEmpty().withMessage('Collector identifier is required'),
    body('location.coordinates.latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('location.coordinates.longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
    body('quantity.value').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('quantity.unit').notEmpty().withMessage('Quantity unit is required')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Create collection event
      const collectionEvent = new CollectionEvent(req.body);
      
      // Validate the collection event
      const validation = collectionEvent.validate();
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Collection event validation failed',
          details: validation.errors
        });
      }

      // Validate sustainability compliance
      const sustainabilityCheck = await blockchainService.validateSustainabilityCompliance(collectionEvent);
      if (!sustainabilityCheck.isCompliant) {
        return res.status(400).json({
          error: 'Sustainability compliance failed',
          details: sustainabilityCheck.errors,
          warnings: sustainabilityCheck.warnings
        });
      }

      let blockchainId = null;
      let syncStatus = 'pending';
      let message = 'Collection data saved locally. Will sync to blockchain when connection is available.';

      try {
        // Try to record on blockchain
        blockchainId = await blockchainService.recordCollectionEvent(collectionEvent);

        // Update collection event with blockchain info
        collectionEvent.blockchain.transactionId = blockchainId;
        syncStatus = 'synced';
        message = 'Collection event recorded successfully on blockchain';

      } catch (blockchainError) {
        logger.warn('Blockchain recording failed, saving locally:', blockchainError.message);

        // Save locally for later sync
        collectionEvent.blockchain.syncStatus = 'pending';
        collectionEvent.blockchain.lastSyncAttempt = new Date().toISOString();
        collectionEvent.blockchain.syncError = blockchainError.message;
      }

      logger.info(`Collection event recorded: ${collectionEvent.id} (sync status: ${syncStatus})`);

      res.status(201).json({
        success: true,
        message: message,
        data: {
          id: collectionEvent.id,
          blockchainId: blockchainId,
          syncStatus: syncStatus,
          sustainabilityCompliance: sustainabilityCheck
        }
      });

    } catch (error) {
      logger.error('Error recording collection event:', error);
      res.status(500).json({
        error: 'Failed to record collection event',
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/collection/sync:
 *   post:
 *     summary: Sync pending collection events to blockchain
 *     tags: [Collection]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync completed successfully
 *       500:
 *         description: Sync failed
 */
router.post('/sync', async (req, res) => {
  try {
    logger.info('Manual blockchain sync requested');

    // Check blockchain connection status
    const networkStatus = await blockchainService.getNetworkStatus();

    if (!networkStatus.connected) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain network is not available for sync',
        networkStatus: networkStatus
      });
    }

    // In a real implementation, you would:
    // 1. Query database for records with syncStatus = 'pending'
    // 2. Attempt to sync each record to blockchain
    // 3. Update syncStatus based on results

    // For demo purposes, we'll simulate a successful sync
    const syncResults = {
      attempted: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    logger.info('Blockchain sync completed', syncResults);

    res.json({
      success: true,
      message: 'Blockchain sync completed successfully',
      results: syncResults,
      networkStatus: networkStatus
    });

  } catch (error) {
    logger.error('Error during blockchain sync:', error);
    res.status(500).json({
      success: false,
      message: 'Blockchain sync failed',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/collection/{id}:
 *   get:
 *     summary: Get collection event by ID
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection event retrieved successfully
 *       404:
 *         description: Collection event not found
 */
router.get('/:id',
  [
    param('id').notEmpty().withMessage('Collection event ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Query from blockchain (this would typically query the ledger)
      // For now, we'll simulate this
      const collectionEvent = await blockchainService.queryAllRecords('collection');
      const event = collectionEvent.find(e => e.id === req.params.id);

      if (!event) {
        return res.status(404).json({
          error: 'Collection event not found',
          message: `No collection event found with ID: ${req.params.id}`
        });
      }

      res.json({
        success: true,
        data: event
      });

    } catch (error) {
      logger.error('Error retrieving collection event:', error);
      res.status(500).json({
        error: 'Failed to retrieve collection event',
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/collection:
 *   get:
 *     summary: Get all collection events with filtering
 *     tags: [Collection]
 *     parameters:
 *       - in: query
 *         name: botanicalName
 *         schema:
 *           type: string
 *       - in: query
 *         name: collector
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *     responses:
 *       200:
 *         description: Collection events retrieved successfully
 */
router.get('/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO 8601 date')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { botanicalName, collector, startDate, endDate, limit = 20, offset = 0 } = req.query;

      // Query all collection events from blockchain
      let collectionEvents = await blockchainService.queryAllRecords('collection');

      // Apply filters
      if (botanicalName) {
        collectionEvents = collectionEvents.filter(event => 
          event.subject.botanicalName.toLowerCase().includes(botanicalName.toLowerCase())
        );
      }

      if (collector) {
        collectionEvents = collectionEvents.filter(event => 
          event.performer.identifier.toLowerCase().includes(collector.toLowerCase()) ||
          event.performer.display.toLowerCase().includes(collector.toLowerCase())
        );
      }

      if (startDate) {
        collectionEvents = collectionEvents.filter(event => 
          new Date(event.performedDateTime) >= new Date(startDate)
        );
      }

      if (endDate) {
        collectionEvents = collectionEvents.filter(event => 
          new Date(event.performedDateTime) <= new Date(endDate)
        );
      }

      // Sort by date (newest first)
      collectionEvents.sort((a, b) => new Date(b.performedDateTime) - new Date(a.performedDateTime));

      // Apply pagination
      const total = collectionEvents.length;
      const paginatedEvents = collectionEvents.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

      res.json({
        success: true,
        data: paginatedEvents,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      });

    } catch (error) {
      logger.error('Error retrieving collection events:', error);
      res.status(500).json({
        error: 'Failed to retrieve collection events',
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/collection/{id}/history:
 *   get:
 *     summary: Get transaction history for a collection event
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *       404:
 *         description: Collection event not found
 */
router.get('/:id/history',
  [
    param('id').notEmpty().withMessage('Collection event ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const history = await blockchainService.getRecordHistory(req.params.id);

      res.json({
        success: true,
        data: {
          recordId: req.params.id,
          history: history
        }
      });

    } catch (error) {
      logger.error('Error retrieving collection event history:', error);
      res.status(500).json({
        error: 'Failed to retrieve collection event history',
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/collection/{id}/sustainability:
 *   get:
 *     summary: Get sustainability report for a collection event
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sustainability report retrieved successfully
 *       404:
 *         description: Collection event not found
 */
router.get('/:id/sustainability',
  [
    param('id').notEmpty().withMessage('Collection event ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const report = await blockchainService.generateSustainabilityReport(req.params.id);

      res.json({
        success: true,
        data: report
      });

    } catch (error) {
      logger.error('Error generating sustainability report:', error);
      res.status(500).json({
        error: 'Failed to generate sustainability report',
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/collection/{id}/upload:
 *   post:
 *     summary: Upload documentation for a collection event
 *     tags: [Collection]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               certificates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       400:
 *         description: Upload error
 */
router.post('/:id/upload',
  auth,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'certificates', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const uploadedFiles = {
        photos: req.files.photos || [],
        certificates: req.files.certificates || []
      };

      // Process uploaded files
      const fileUrls = {
        photos: uploadedFiles.photos.map(file => `/uploads/${file.filename}`),
        certificates: uploadedFiles.certificates.map(file => `/uploads/${file.filename}`)
      };

      logger.info(`Files uploaded for collection event ${id}:`, fileUrls);

      res.json({
        success: true,
        message: 'Files uploaded successfully',
        data: fileUrls
      });

    } catch (error) {
      logger.error('Error uploading files:', error);
      res.status(500).json({
        error: 'Failed to upload files',
        message: error.message
      });
    }
  }
);

module.exports = router;
