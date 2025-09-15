const express = require('express');
const smsService = require('../services/smsService');
const router = express.Router();

/**
 * POST /api/sms/webhook
 * Webhook endpoint for incoming SMS messages
 * This would typically be called by SMS gateway providers like Twilio, AWS SNS, etc.
 */
router.post('/webhook', async (req, res) => {
  try {
    const { phoneNumber, message, messageId, timestamp } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    // Process the SMS
    const result = await smsService.processSMS(phoneNumber, message);

    // Log the SMS interaction
    console.log(`SMS Processed - From: ${phoneNumber}, Message: "${message}", Response: "${result.message}"`);

    res.json({
      success: true,
      data: result,
      processed: true
    });

  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'SMS processing failed',
      message: error.message
    });
  }
});

/**
 * POST /api/sms/simulate
 * Simulate SMS for testing purposes
 */
router.post('/simulate', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    // Process the simulated SMS
    const result = await smsService.processSMS(phoneNumber, message);

    res.json({
      success: true,
      data: result,
      simulation: true
    });

  } catch (error) {
    console.error('SMS simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'SMS simulation failed',
      message: error.message
    });
  }
});

/**
 * POST /api/sms/register-farmer
 * Register a new farmer via SMS
 */
router.post('/register-farmer', async (req, res) => {
  try {
    const { phoneNumber, name, location } = req.body;

    if (!phoneNumber || !name || !location) {
      return res.status(400).json({
        success: false,
        error: 'Phone number, name, and location are required'
      });
    }

    const result = smsService.registerFarmer(phoneNumber, name, location);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Farmer registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Farmer registration failed',
      message: error.message
    });
  }
});

/**
 * GET /api/sms/sync-queue
 * Get pending entries waiting for blockchain sync
 */
router.get('/sync-queue', async (req, res) => {
  try {
    const queue = smsService.getOfflineSyncQueue();

    res.json({
      success: true,
      data: {
        pendingEntries: queue,
        count: queue.length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Sync queue error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sync queue',
      message: error.message
    });
  }
});

/**
 * POST /api/sms/generate-paper-qr
 * Generate paper QR slip with OTP
 */
router.post('/generate-paper-qr', async (req, res) => {
  try {
    const { farmerId, entryId } = req.body;

    if (!farmerId || !entryId) {
      return res.status(400).json({
        success: false,
        error: 'Farmer ID and Entry ID are required'
      });
    }

    const qrSlip = smsService.generatePaperQRSlip(farmerId, entryId);

    res.json({
      success: true,
      data: qrSlip
    });

  } catch (error) {
    console.error('Paper QR generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate paper QR slip',
      message: error.message
    });
  }
});

/**
 * GET /api/sms/statistics
 * Get SMS service statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = smsService.getStatistics();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('SMS statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get SMS statistics',
      message: error.message
    });
  }
});

/**
 * POST /api/sms/force-sync
 * Force sync a specific entry to blockchain
 */
router.post('/force-sync', async (req, res) => {
  try {
    const { entryId } = req.body;

    if (!entryId) {
      return res.status(400).json({
        success: false,
        error: 'Entry ID is required'
      });
    }

    // Force sync the entry
    await smsService.syncToBlockchain(entryId);

    res.json({
      success: true,
      message: `Entry ${entryId} sync initiated`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Force sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to force sync entry',
      message: error.message
    });
  }
});

/**
 * GET /api/sms/commands
 * Get available SMS commands and their formats
 */
router.get('/commands', async (req, res) => {
  try {
    const commands = {
      HARVEST: {
        format: "HARVEST [Species] [Quantity]KG LAT [Latitude] LNG [Longitude] [Notes]",
        example: "HARVEST Ashwagandha 15KG LAT 12.9716 LNG 77.5946 Good quality",
        description: "Record a new harvest entry"
      },
      STATUS: {
        format: "STATUS [EntryID]",
        example: "STATUS ENT-A1B2C3D4",
        description: "Check status of a harvest entry"
      },
      OTP: {
        format: "OTP [6-digit-OTP] [QR-Code]",
        example: "OTP A1B2C3 QR-D4E5F6G7H8I9",
        description: "Verify paper QR slip with OTP"
      },
      HELP: {
        format: "HELP",
        example: "HELP",
        description: "Get list of available commands"
      },
      REGISTER: {
        format: "REGISTER [Name] [Location]",
        example: "REGISTER Rajesh Kumar Karnataka",
        description: "Register as a new farmer"
      }
    };

    res.json({
      success: true,
      data: {
        commands,
        supportPhone: "1800-TRACE-HERB",
        instructions: "Send SMS commands to the registered SMS gateway number. All commands are case-insensitive."
      }
    });

  } catch (error) {
    console.error('Commands error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get SMS commands',
      message: error.message
    });
  }
});

/**
 * POST /api/sms/bulk-sync
 * Sync all pending entries to blockchain
 */
router.post('/bulk-sync', async (req, res) => {
  try {
    const queue = smsService.getOfflineSyncQueue();
    const syncPromises = queue.map(entry => smsService.syncToBlockchain(entry.id));
    
    // Start all syncs (don't wait for completion)
    Promise.all(syncPromises).catch(error => {
      console.error('Bulk sync error:', error);
    });

    res.json({
      success: true,
      message: `Initiated sync for ${queue.length} entries`,
      entriesCount: queue.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Bulk sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate bulk sync',
      message: error.message
    });
  }
});

/**
 * GET /api/sms/farmers
 * Get list of registered farmers
 */
router.get('/farmers', async (req, res) => {
  try {
    // In production, this would query the actual database
    const farmers = Array.from(smsService.farmers.entries()).map(([phone, farmer]) => ({
      phoneNumber: phone,
      ...farmer
    }));

    res.json({
      success: true,
      data: {
        farmers,
        count: farmers.length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Farmers list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get farmers list',
      message: error.message
    });
  }
});

/**
 * POST /api/sms/send-notification
 * Send notification SMS to farmer
 */
router.post('/send-notification', async (req, res) => {
  try {
    const { phoneNumber, message, type = 'info' } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    // Add emoji based on notification type
    const typeEmojis = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      reminder: '🔔'
    };

    const formattedMessage = `${typeEmojis[type] || 'ℹ️'} ${message}`;
    const result = smsService.sendSMSResponse(phoneNumber, formattedMessage);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification',
      message: error.message
    });
  }
});

module.exports = router;
