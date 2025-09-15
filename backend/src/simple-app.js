/**
 * Simple TRACE HERB API Server - Demo Mode
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Services
const blockchainService = require('./services/blockchainService');
const databaseService = require('./services/databaseService');
const cacheService = require('./services/cacheService');

// Demo data
const { getAllDemoData } = require('../../tests/demo-data');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        api: 'healthy',
        blockchain: await blockchainService.getNetworkStatus(),
        database: await databaseService.getStatus(),
        cache: await cacheService.getStatus()
      }
    };

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Collection Events endpoint
app.post('/api/collection-events', async (req, res) => {
  try {
    const collectionEventData = req.body;
    console.log('Received collection event:', collectionEventData.id);

    // Submit to blockchain
    const result = await blockchainService.submitTransaction(
      'herb-traceability',
      'CreateCollectionEvent',
      collectionEventData.id,
      JSON.stringify(collectionEventData)
    );

    // Store in database
    await databaseService.saveCollectionEvent(collectionEventData);

    res.json({
      success: true,
      data: {
        collectionId: collectionEventData.id,
        qrCode: collectionEventData.qrCode,
        transactionId: result.transactionId,
        blockNumber: result.blockNumber,
        message: 'Collection event recorded successfully'
      }
    });

  } catch (error) {
    console.error('Collection event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record collection event'
    });
  }
});

// QR Code lookup endpoint
app.get('/api/provenance/qr/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;

    console.log(`Looking up QR code: ${qrCode}`);

    // First try to get from blockchain
    let provenance = await blockchainService.getProvenanceByQR(qrCode);
    
    // If not found in blockchain, try database
    if (!provenance) {
      provenance = await databaseService.getProvenanceByQR(qrCode);
    }

    // If still not found, check if it's a demo QR code
    if (!provenance && qrCode.startsWith('QR_DEMO_')) {
      const demoData = getAllDemoData();
      provenance = demoData.provenance;

      // Load demo data into services for future requests
      await blockchainService.loadDemoData(demoData);
      await databaseService.loadDemoData(demoData);
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

// Load demo data endpoint
app.post('/api/provenance/demo/load', async (req, res) => {
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

// Blockchain status endpoint
app.get('/api/blockchain/status', async (req, res) => {
  try {
    const status = await blockchainService.getNetworkStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Blockchain status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain status'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('🌿 Starting TRACE HERB API Server...');

    // Connect to services
    await blockchainService.connect();
    await databaseService.connect();
    await cacheService.connect();

    // Load demo data
    const demoData = getAllDemoData();
    await blockchainService.loadDemoData(demoData);
    await databaseService.loadDemoData(demoData);

    const PORT = process.env.PORT || 3000;
    
    app.listen(PORT, () => {
      console.log(`🚀 TRACE HERB API Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔍 QR lookup: http://localhost:${PORT}/api/provenance/qr/QR_DEMO_ASHWAGANDHA_001`);
      console.log(`⛓️  Blockchain status: http://localhost:${PORT}/api/blockchain/status`);
      console.log('✅ Demo data loaded and ready!');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
