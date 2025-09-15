const express = require('express');
const multer = require('multer');
const aiService = require('../services/aiService');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and audio files
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed'), false);
    }
  }
});

/**
 * POST /api/ai/verify-plant
 * AI-powered plant species verification from image
 */
router.post('/verify-plant', upload.single('image'), async (req, res) => {
  try {
    const { claimedSpecies, location, farmerId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    if (!claimedSpecies) {
      return res.status(400).json({
        success: false,
        error: 'Claimed species is required'
      });
    }

    // Parse location if provided
    let locationData = null;
    if (location) {
      try {
        locationData = typeof location === 'string' ? JSON.parse(location) : location;
      } catch (e) {
        console.warn('Invalid location data:', location);
      }
    }

    // Call AI service for plant verification
    const result = await aiService.verifyPlantSpecies(
      req.file.buffer,
      claimedSpecies,
      locationData
    );

    // Log the verification attempt
    console.log(`AI Plant Verification - Farmer: ${farmerId}, Species: ${claimedSpecies}, Result: ${result.verified ? 'VERIFIED' : 'REJECTED'}, Confidence: ${result.confidence}`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Plant verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Plant verification service error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/detect-anomalies
 * Anomaly detection for blockchain entries
 */
router.post('/detect-anomalies', async (req, res) => {
  try {
    const { newEntry, farmerId, processorId } = req.body;

    if (!newEntry) {
      return res.status(400).json({
        success: false,
        error: 'New entry data is required'
      });
    }

    // Fetch historical data for the farmer/processor
    // In production, this would query the actual blockchain/database
    const historicalData = await getHistoricalData(farmerId || processorId);

    // Run anomaly detection
    const result = await aiService.detectAnomalies(newEntry, historicalData);

    // Log high-risk detections
    if (result.riskLevel === 'HIGH') {
      console.warn(`HIGH RISK ANOMALY DETECTED - Entity: ${farmerId || processorId}, Risk Score: ${result.riskScore}`, result.anomalies);
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Anomaly detection service error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/voice-to-blockchain
 * Voice input processing for blockchain entry
 */
router.post('/voice-to-blockchain', upload.single('audio'), async (req, res) => {
  try {
    const { farmerId, language = 'en-IN' } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        error: 'Farmer ID is required'
      });
    }

    // Process voice input
    const result = await aiService.processVoiceInput(req.file.buffer, farmerId);

    // If voice processing was successful and validation passed, prepare blockchain entry
    if (result.success && result.validation.valid) {
      const blockchainEntry = {
        farmerId,
        species: result.parsedData.species,
        quantity: result.parsedData.quantity,
        location: {
          lat: result.parsedData.latitude,
          lng: result.parsedData.longitude
        },
        quality: result.parsedData.quality || 'B',
        timestamp: new Date().toISOString(),
        source: 'voice-input',
        confidence: result.confidence,
        transcription: result.transcription
      };

      // Run anomaly detection on the voice-generated entry
      const historicalData = await getHistoricalData(farmerId);
      const anomalyResult = await aiService.detectAnomalies(blockchainEntry, historicalData);

      result.blockchainEntry = blockchainEntry;
      result.anomalyCheck = anomalyResult;
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Voice processing service error',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/plant-database
 * Get available plant species in AI database
 */
router.get('/plant-database', async (req, res) => {
  try {
    const plantDatabase = {
      'Ashwagandha': {
        scientificName: 'Withania somnifera',
        commonNames: ['Indian Winter Cherry', 'Poison Gooseberry'],
        family: 'Solanaceae',
        uses: ['Adaptogen', 'Stress relief', 'Immune support'],
        harvestSeason: 'October - January',
        optimalRegions: ['Rajasthan', 'Madhya Pradesh', 'Gujarat']
      },
      'Turmeric': {
        scientificName: 'Curcuma longa',
        commonNames: ['Haldi', 'Indian Saffron'],
        family: 'Zingiberaceae',
        uses: ['Anti-inflammatory', 'Digestive aid', 'Wound healing'],
        harvestSeason: 'January - April',
        optimalRegions: ['Andhra Pradesh', 'Tamil Nadu', 'Karnataka']
      },
      'Neem': {
        scientificName: 'Azadirachta indica',
        commonNames: ['Indian Lilac', 'Margosa'],
        family: 'Meliaceae',
        uses: ['Antibacterial', 'Antifungal', 'Pest control'],
        harvestSeason: 'Year-round',
        optimalRegions: ['All India']
      },
      'Tulsi': {
        scientificName: 'Ocimum tenuiflorum',
        commonNames: ['Holy Basil', 'Sacred Basil'],
        family: 'Lamiaceae',
        uses: ['Respiratory health', 'Stress relief', 'Immunity'],
        harvestSeason: 'March - October',
        optimalRegions: ['All India']
      }
    };

    res.json({
      success: true,
      data: {
        species: Object.keys(plantDatabase),
        details: plantDatabase,
        totalSpecies: Object.keys(plantDatabase).length
      }
    });

  } catch (error) {
    console.error('Plant database error:', error);
    res.status(500).json({
      success: false,
      error: 'Plant database service error'
    });
  }
});

/**
 * GET /api/ai/anomaly-stats
 * Get anomaly detection statistics
 */
router.get('/anomaly-stats', async (req, res) => {
  try {
    // Mock statistics - in production, query actual database
    const stats = {
      totalScans: 1247,
      anomaliesDetected: 23,
      highRiskBlocked: 5,
      mediumRiskFlagged: 12,
      lowRiskWarnings: 6,
      accuracyRate: 94.2,
      lastUpdated: new Date().toISOString(),
      topAnomalyTypes: [
        { type: 'VOLUME_SPIKE', count: 8, percentage: 34.8 },
        { type: 'LOCATION_ANOMALY', count: 6, percentage: 26.1 },
        { type: 'QUALITY_DROP', count: 5, percentage: 21.7 },
        { type: 'OFF_SEASON', count: 4, percentage: 17.4 }
      ]
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Anomaly stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Anomaly statistics service error'
    });
  }
});

/**
 * POST /api/ai/simulate-threat
 * Simulate various threat scenarios for demo purposes
 */
router.post('/simulate-threat', async (req, res) => {
  try {
    const { threatType, severity = 'medium' } = req.body;

    const threats = {
      'fake-qr': {
        name: 'Fake QR Code Attack',
        description: 'Attempt to scan counterfeit QR code',
        detection: 'Blockchain hash verification failed',
        action: 'QR code rejected, user warned',
        riskLevel: 'HIGH'
      },
      'double-spending': {
        name: 'Double Spending Attack',
        description: 'Attempt to use same herb batch multiple times',
        detection: 'Duplicate batch ID detected in blockchain',
        action: 'Transaction blocked, authorities notified',
        riskLevel: 'HIGH'
      },
      'location-spoofing': {
        name: 'GPS Location Spoofing',
        description: 'Farmer reporting false harvest location',
        detection: 'Location outside registered farm boundaries',
        action: 'Entry flagged for manual verification',
        riskLevel: 'MEDIUM'
      },
      'volume-manipulation': {
        name: 'Volume Manipulation',
        description: 'Reporting inflated harvest quantities',
        detection: 'Volume exceeds historical patterns',
        action: 'Anomaly detected, field inspection triggered',
        riskLevel: 'MEDIUM'
      }
    };

    const threat = threats[threatType];
    if (!threat) {
      return res.status(400).json({
        success: false,
        error: 'Unknown threat type'
      });
    }

    // Simulate detection and response
    const response = {
      threatDetected: true,
      timestamp: new Date().toISOString(),
      threat,
      systemResponse: {
        detectionTime: Math.random() * 2 + 0.5, // 0.5-2.5 seconds
        confidence: 0.85 + Math.random() * 0.1, // 85-95%
        actionTaken: threat.action,
        alertsSent: ['security-team', 'system-admin', 'regulatory-authority']
      }
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Threat simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Threat simulation service error'
    });
  }
});

// Helper function to get historical data
async function getHistoricalData(entityId) {
  // Mock historical data - in production, query actual database
  const mockData = [
    {
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      species: 'Ashwagandha',
      quantity: 15,
      quality: 'A',
      location: { lat: 12.9716, lng: 77.5946 }
    },
    {
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      species: 'Turmeric',
      quantity: 22,
      quality: 'B+',
      location: { lat: 12.9800, lng: 77.6000 }
    },
    {
      timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      species: 'Ashwagandha',
      quantity: 18,
      quality: 'A',
      location: { lat: 12.9650, lng: 77.5900 }
    }
  ];

  return mockData;
}

module.exports = router;
