/**
 * Dashboard Routes - API endpoints for dashboard data
 */

const express = require('express');
const router = express.Router();

const { protect: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 */
router.get('/stats', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalCollections: 1247,
        activeFarmers: 89,
        qualityTests: 456,
        blockchainTransactions: 2103,
        networkHealth: 98.5
      }
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get recent activities
 *     tags: [Dashboard]
 */
router.get('/recent', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: '1',
          type: 'collection',
          description: 'Ashwagandha collected by Farmer #123',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'quality-test',
          description: 'Quality test completed for batch #456',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    });
  } catch (error) {
    logger.error('Dashboard recent error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
