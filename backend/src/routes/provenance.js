/**
 * Provenance routes
 */

const express = require('express');
const router = express.Router();

const blockchainService = require('../services/blockchainService');
const databaseService = require('../services/databaseService');
const { getAllDemoData } = require('../../../tests/demo-data');

/**
 * @route   GET /api/provenance/qr/:qrCode
 * @desc    Get provenance data by QR code
 * @access  Public
 */
router.get('/qr/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;

    console.log(`Looking up QR code: ${qrCode}`);

    // Try to get from blockchain (includes CA-connected mode with enhanced data)
    let provenance = await blockchainService.getProvenanceByQR(qrCode);

    // If not found in blockchain, try database
    if (!provenance) {
      provenance = await databaseService.getProvenanceByQR(qrCode);
    }

    if (!provenance) {
      return res.status(404).json({
        success: false,
        error: 'Product not found. Please check the QR code and try again.'
      });
    }

    // Update scan count (in a real system, this would be more sophisticated)
    if (provenance.consumer) {
      provenance.consumer.scanCount = (provenance.consumer.scanCount || 0) + 1;
      provenance.consumer.lastScan = new Date().toISOString();
      if (!provenance.consumer.firstScan) {
        provenance.consumer.firstScan = new Date().toISOString();
      }
    }

    res.json({
      success: true,
      data: provenance
    });

  } catch (error) {
    console.error('Error getting provenance by QR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve product information'
    });
  }
});

/**
 * @route   POST /api/provenance
 * @desc    Create new provenance record
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const provenance = req.body;

    // Validate required fields
    if (!provenance.id || !provenance.target) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id and target'
      });
    }

    // Save to blockchain
    const blockchainResult = await blockchainService.submitTransaction(
      'herb-traceability',
      'CreateProvenance',
      provenance.id,
      JSON.stringify(provenance)
    );

    // Save to database
    await databaseService.saveProvenance(provenance);

    res.status(201).json({
      success: true,
      data: {
        provenanceId: provenance.id,
        qrCode: provenance.target.qrCode,
        blockchainId: blockchainResult.transactionId
      }
    });

  } catch (error) {
    console.error('Error creating provenance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create provenance record'
    });
  }
});

/**
 * @route   GET /api/provenance/:id
 * @desc    Get provenance by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to get from database first
    let provenance = await databaseService.getProvenance(id);
    
    if (!provenance) {
      return res.status(404).json({
        success: false,
        error: 'Provenance record not found'
      });
    }

    res.json({
      success: true,
      data: provenance
    });

  } catch (error) {
    console.error('Error getting provenance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve provenance record'
    });
  }
});

/**
 * @route   POST /api/provenance/demo/load
 * @desc    Load demo data
 * @access  Public (for demo purposes)
 */
router.post('/demo/load', async (req, res) => {
  try {
    console.log('Loading demo data...');
    
    const demoData = getAllDemoData();
    
    // Load into blockchain service
    await blockchainService.loadDemoData(demoData);
    
    // Load into database service
    await databaseService.loadDemoData(demoData);
    
    res.json({
      success: true,
      message: 'Demo data loaded successfully',
      data: {
        qrCode: demoData.provenance.target.qrCode,
        provenanceId: demoData.provenance.id
      }
    });

  } catch (error) {
    console.error('Error loading demo data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load demo data'
    });
  }
});

module.exports = router;
