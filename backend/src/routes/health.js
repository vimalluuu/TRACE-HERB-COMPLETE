/**
 * Health check routes
 */

const express = require('express');
const router = express.Router();

const blockchainService = require('../services/blockchainService');
const databaseService = require('../services/databaseService');
const cacheService = require('../services/cacheService');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', async (req, res) => {
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

/**
 * @route   GET /api/health/blockchain
 * @desc    Blockchain service health check
 * @access  Public
 */
router.get('/blockchain', async (req, res) => {
  try {
    const status = await blockchainService.getNetworkStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Blockchain health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Blockchain health check failed'
    });
  }
});

module.exports = router;
