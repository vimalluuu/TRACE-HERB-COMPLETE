/**
 * Integration Routes - API endpoints for external integrations
 */

const express = require('express');
const router = express.Router();

const { protect: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/integration/fhir:
 *   post:
 *     summary: FHIR integration endpoint
 *     tags: [Integration]
 */
router.post('/fhir', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'FHIR data processed',
      data: req.body
    });
  } catch (error) {
    logger.error('FHIR integration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/integration/iot:
 *   post:
 *     summary: IoT data integration endpoint
 *     tags: [Integration]
 */
router.post('/iot', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'IoT data received',
      data: req.body
    });
  } catch (error) {
    logger.error('IoT integration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/integration/webhook:
 *   post:
 *     summary: Webhook endpoint for external systems
 *     tags: [Integration]
 */
router.post('/webhook', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
