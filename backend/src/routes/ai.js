const express = require('express');
const router = express.Router();
const aiVerificationService = require('../../services/aiVerificationService');
const ruralConnectivityService = require('../../services/ruralConnectivityService');
const SMSBlockchainGateway = require('../../services/smsBlockchainGateway');
const sustainabilityService = require('../../services/sustainabilityService');
const securityService = require('../../services/securityService');
const regulatoryService = require('../../services/regulatoryService');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed'), false);
    }
  }
});

// Initialize SMS Blockchain Gateway
const smsBlockchainGateway = new SMSBlockchainGateway();

/**
 * @route POST /api/ai/verify-plant
 * @desc Verify plant species using AI image recognition
 * @access Public
 */
router.post('/verify-plant', upload.single('image'), async (req, res) => {
  try {
    const { expectedSpecies, metadata } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    if (!expectedSpecies) {
      return res.status(400).json({
        success: false,
        error: 'Expected species is required'
      });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');
    
    // Parse metadata if provided
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch (error) {
        console.warn('Invalid metadata format:', error);
      }
    }

    // Perform AI verification
    const verificationResult = await aiVerificationService.verifyPlantSpecies(
      imageBase64,
      expectedSpecies,
      parsedMetadata
    );

    res.json({
      success: true,
      data: verificationResult
    });

  } catch (error) {
    console.error('Plant verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Plant verification failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/detect-anomalies
 * @desc Detect anomalies in harvest data
 * @access Public
 */
router.post('/detect-anomalies', async (req, res) => {
  try {
    const { harvestData, historicalData } = req.body;

    if (!harvestData) {
      return res.status(400).json({
        success: false,
        error: 'Harvest data is required'
      });
    }

    // Perform anomaly detection
    const anomalyResult = await aiVerificationService.detectAnomalies(
      harvestData,
      historicalData || []
    );

    res.json({
      success: true,
      data: anomalyResult
    });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Anomaly detection failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/voice-to-blockchain
 * @desc Process voice recording and extract blockchain data
 * @access Public
 */
router.post('/voice-to-blockchain', upload.single('audio'), async (req, res) => {
  try {
    const { language } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      });
    }

    // Convert audio to base64
    const audioBase64 = req.file.buffer.toString('base64');

    // Process voice to blockchain data
    const voiceResult = await aiVerificationService.processVoiceToBlockchain(
      audioBase64,
      language || 'hi'
    );

    res.json({
      success: true,
      data: voiceResult
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Voice processing failed',
      details: error.message
    });
  }
});

/**
 * @route GET /api/ai/supported-species
 * @desc Get list of supported plant species for AI verification
 * @access Public
 */
router.get('/supported-species', async (req, res) => {
  try {
    const supportedSpecies = [
      {
        botanicalName: 'Withania somnifera',
        commonNames: ['Ashwagandha', 'Winter Cherry', 'Indian Ginseng'],
        family: 'Solanaceae',
        confidence: 0.92
      },
      {
        botanicalName: 'Curcuma longa',
        commonNames: ['Turmeric', 'Haldi', 'Golden Spice'],
        family: 'Zingiberaceae',
        confidence: 0.89
      },
      {
        botanicalName: 'Bacopa monnieri',
        commonNames: ['Brahmi', 'Water Hyssop', 'Herb of Grace'],
        family: 'Plantaginaceae',
        confidence: 0.87
      },
      {
        botanicalName: 'Azadirachta indica',
        commonNames: ['Neem', 'Margosa', 'Indian Lilac'],
        family: 'Meliaceae',
        confidence: 0.91
      }
    ];

    res.json({
      success: true,
      data: {
        species: supportedSpecies,
        totalCount: supportedSpecies.length,
        modelVersion: 'PlantNet-v2.1-Ayurvedic',
        lastUpdated: '2024-09-15'
      }
    });

  } catch (error) {
    console.error('Error fetching supported species:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported species'
    });
  }
});

/**
 * @route GET /api/ai/supported-languages
 * @desc Get list of supported languages for voice processing
 * @access Public
 */
router.get('/supported-languages', async (req, res) => {
  try {
    const supportedLanguages = [
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
    ];

    res.json({
      success: true,
      data: {
        languages: supportedLanguages,
        totalCount: supportedLanguages.length,
        modelVersion: 'Whisper-Multilingual-v3'
      }
    });

  } catch (error) {
    console.error('Error fetching supported languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported languages'
    });
  }
});

/**
 * @route POST /api/ai/batch-verify
 * @desc Verify multiple plants in a single batch
 * @access Public
 */
router.post('/batch-verify', upload.array('images', 10), async (req, res) => {
  try {
    const { expectedSpecies, metadata } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one image file is required'
      });
    }

    if (!expectedSpecies) {
      return res.status(400).json({
        success: false,
        error: 'Expected species is required'
      });
    }

    // Parse metadata if provided
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch (error) {
        console.warn('Invalid metadata format:', error);
      }
    }

    // Process all images
    const verificationPromises = req.files.map(async (file, index) => {
      const imageBase64 = file.buffer.toString('base64');
      const result = await aiVerificationService.verifyPlantSpecies(
        imageBase64,
        expectedSpecies,
        { ...parsedMetadata, imageIndex: index }
      );
      return { imageIndex: index, ...result };
    });

    const verificationResults = await Promise.all(verificationPromises);

    // Calculate batch statistics
    const successCount = verificationResults.filter(r => r.success).length;
    const averageConfidence = verificationResults.reduce((sum, r) => sum + r.confidence, 0) / verificationResults.length;
    const batchSuccess = successCount >= Math.ceil(verificationResults.length * 0.7); // 70% success threshold

    res.json({
      success: true,
      data: {
        batchSuccess,
        totalImages: verificationResults.length,
        successCount,
        failureCount: verificationResults.length - successCount,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        results: verificationResults,
        recommendation: batchSuccess ? 
          'Batch verification successful - proceed with blockchain recording' :
          'Batch verification failed - manual review required'
      }
    });

  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch verification failed',
      details: error.message
    });
  }
});

/**
 * @route GET /api/ai/stats
 * @desc Get AI service statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    // Mock statistics - in real implementation, this would come from database
    const stats = {
      totalVerifications: 1247,
      successRate: 0.89,
      averageConfidence: 0.91,
      topSpecies: [
        { species: 'Withania somnifera', count: 456, successRate: 0.92 },
        { species: 'Curcuma longa', count: 321, successRate: 0.88 },
        { species: 'Bacopa monnieri', count: 234, successRate: 0.87 },
        { species: 'Azadirachta indica', count: 236, successRate: 0.91 }
      ],
      anomaliesDetected: {
        total: 89,
        byType: {
          volume: 34,
          location: 12,
          quality: 28,
          temporal: 15
        }
      },
      voiceProcessing: {
        totalRequests: 567,
        successRate: 0.84,
        topLanguages: [
          { language: 'Hindi', count: 234 },
          { language: 'English', count: 123 },
          { language: 'Telugu', count: 89 },
          { language: 'Tamil', count: 67 }
        ]
      },
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching AI stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI statistics'
    });
  }
});

/**
 * @route POST /api/ai/sms-to-blockchain
 * @desc Process SMS message and convert to blockchain data
 * @access Public
 */
router.post('/sms-to-blockchain', async (req, res) => {
  try {
    const { phoneNumber, message, language } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    const result = await ruralConnectivityService.processSMSToBlockchain(
      phoneNumber,
      message,
      language || 'en'
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('SMS processing error:', error);
    res.status(500).json({
      success: false,
      error: 'SMS processing failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/sync-offline
 * @desc Synchronize offline device data
 * @access Public
 */
router.post('/sync-offline', async (req, res) => {
  try {
    const { deviceData, deviceId } = req.body;

    if (!deviceData || !deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device data and device ID are required'
      });
    }

    const result = await ruralConnectivityService.syncOfflineData(deviceData, deviceId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Offline sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Offline sync failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/generate-paper-qr
 * @desc Generate paper QR slip with OTP activation
 * @access Public
 */
router.post('/generate-paper-qr', async (req, res) => {
  try {
    const { batchData, farmerId } = req.body;

    if (!batchData || !farmerId) {
      return res.status(400).json({
        success: false,
        error: 'Batch data and farmer ID are required'
      });
    }

    const result = await ruralConnectivityService.generatePaperQR(batchData, farmerId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Paper QR generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Paper QR generation failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/activate-paper-qr
 * @desc Activate paper QR code using OTP
 * @access Public
 */
router.post('/activate-paper-qr', async (req, res) => {
  try {
    const { qrId, otp, phoneNumber } = req.body;

    if (!qrId || !otp || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'QR ID, OTP, and phone number are required'
      });
    }

    const result = await ruralConnectivityService.activatePaperQR(qrId, otp, phoneNumber);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Paper QR activation error:', error);
    res.status(500).json({
      success: false,
      error: 'Paper QR activation failed',
      details: error.message
    });
  }
});

/**
 * @route GET /api/ai/connectivity-stats
 * @desc Get rural connectivity statistics
 * @access Public
 */
router.get('/connectivity-stats', async (req, res) => {
  try {
    const stats = ruralConnectivityService.getConnectivityStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching connectivity stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch connectivity statistics'
    });
  }
});

/**
 * @route POST /api/ai/award-green-tokens
 * @desc Award Green Tokens for farmer actions
 * @access Public
 */
router.post('/award-green-tokens', async (req, res) => {
  try {
    const { farmerId, actionData } = req.body;

    if (!farmerId || !actionData) {
      return res.status(400).json({
        success: false,
        error: 'Farmer ID and action data are required'
      });
    }

    const result = await sustainabilityService.awardGreenTokens(farmerId, actionData);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Green token award error:', error);
    res.status(500).json({
      success: false,
      error: 'Green token award failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/calculate-reputation
 * @desc Calculate farmer reputation score
 * @access Public
 */
router.post('/calculate-reputation', async (req, res) => {
  try {
    const { farmerId, performanceData } = req.body;

    if (!farmerId || !performanceData) {
      return res.status(400).json({
        success: false,
        error: 'Farmer ID and performance data are required'
      });
    }

    const result = await sustainabilityService.calculateReputationScore(farmerId, performanceData);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Reputation calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Reputation calculation failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/calculate-carbon-credits
 * @desc Calculate carbon credits for sustainable practices
 * @access Public
 */
router.post('/calculate-carbon-credits', async (req, res) => {
  try {
    const { farmerId, practiceData } = req.body;

    if (!farmerId || !practiceData) {
      return res.status(400).json({
        success: false,
        error: 'Farmer ID and practice data are required'
      });
    }

    const result = await sustainabilityService.calculateCarbonCredits(farmerId, practiceData);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Carbon credit calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Carbon credit calculation failed',
      details: error.message
    });
  }
});

/**
 * @route GET /api/ai/sustainability-stats
 * @desc Get sustainability and incentives statistics
 * @access Public
 */
router.get('/sustainability-stats', async (req, res) => {
  try {
    const stats = sustainabilityService.getSustainabilityStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching sustainability stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sustainability statistics'
    });
  }
});

/**
 * @route POST /api/ai/generate-zkp
 * @desc Generate Zero-Knowledge Proof for privacy-preserving analytics
 * @access Public
 */
router.post('/generate-zkp', async (req, res) => {
  try {
    const { privateData, publicInputs, proofType } = req.body;

    if (!privateData || !publicInputs || !proofType) {
      return res.status(400).json({
        success: false,
        error: 'Private data, public inputs, and proof type are required'
      });
    }

    const result = await securityService.generateZKProof(privateData, publicInputs, proofType);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('ZKP generation error:', error);
    res.status(500).json({
      success: false,
      error: 'ZKP generation failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/verify-zkp/:proofId
 * @desc Verify Zero-Knowledge Proof
 * @access Public
 */
router.post('/verify-zkp/:proofId', async (req, res) => {
  try {
    const { proofId } = req.params;
    const { proof, publicInputs } = req.body;

    if (!proof || !publicInputs) {
      return res.status(400).json({
        success: false,
        error: 'Proof and public inputs are required'
      });
    }

    const result = await securityService.verifyZKProof(proofId, proof, publicInputs);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('ZKP verification error:', error);
    res.status(500).json({
      success: false,
      error: 'ZKP verification failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/encrypt-data
 * @desc Encrypt data with selective disclosure capability
 * @access Public
 */
router.post('/encrypt-data', async (req, res) => {
  try {
    const { data, disclosureFields, recipientId } = req.body;

    if (!data || !disclosureFields || !recipientId) {
      return res.status(400).json({
        success: false,
        error: 'Data, disclosure fields, and recipient ID are required'
      });
    }

    const result = await securityService.encryptWithSelectiveDisclosure(
      data,
      disclosureFields,
      recipientId
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Encryption error:', error);
    res.status(500).json({
      success: false,
      error: 'Encryption failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/selective-disclose/:encryptionId
 * @desc Selectively disclose encrypted fields
 * @access Public
 */
router.post('/selective-disclose/:encryptionId', async (req, res) => {
  try {
    const { encryptionId } = req.params;
    const { fieldsToDisclose, disclosureToken } = req.body;

    if (!fieldsToDisclose || !disclosureToken) {
      return res.status(400).json({
        success: false,
        error: 'Fields to disclose and disclosure token are required'
      });
    }

    const result = await securityService.selectivelyDisclose(
      encryptionId,
      fieldsToDisclose,
      disclosureToken
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Selective disclosure error:', error);
    res.status(500).json({
      success: false,
      error: 'Selective disclosure failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/simulate-threat
 * @desc Simulate and detect cyber threats
 * @access Public
 */
router.post('/simulate-threat', async (req, res) => {
  try {
    const { threatScenario } = req.body;

    if (!threatScenario || !threatScenario.threatType) {
      return res.status(400).json({
        success: false,
        error: 'Threat scenario with threat type is required'
      });
    }

    const result = await securityService.simulateThreat(threatScenario);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Threat simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Threat simulation failed',
      details: error.message
    });
  }
});

/**
 * @route GET /api/ai/security-stats
 * @desc Get security and threat detection statistics
 * @access Public
 */
router.get('/security-stats', async (req, res) => {
  try {
    const stats = securityService.getSecurityStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching security stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security statistics'
    });
  }
});

/**
 * @route POST /api/ai/generate-gs1-compliance
 * @desc Generate GS1-compliant identifiers and barcodes
 * @access Public
 */
router.post('/generate-gs1-compliance', async (req, res) => {
  try {
    const { productData, batchId } = req.body;

    if (!productData || !batchId) {
      return res.status(400).json({
        success: false,
        error: 'Product data and batch ID are required'
      });
    }

    const result = await regulatoryService.generateGS1Compliance(productData, batchId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('GS1 compliance generation error:', error);
    res.status(500).json({
      success: false,
      error: 'GS1 compliance generation failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/generate-fhir-compliance
 * @desc Generate FHIR-compliant healthcare data
 * @access Public
 */
router.post('/generate-fhir-compliance', async (req, res) => {
  try {
    const { herbData, organizationData } = req.body;

    if (!herbData || !organizationData) {
      return res.status(400).json({
        success: false,
        error: 'Herb data and organization data are required'
      });
    }

    const result = await regulatoryService.generateFHIRCompliance(herbData, organizationData);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('FHIR compliance generation error:', error);
    res.status(500).json({
      success: false,
      error: 'FHIR compliance generation failed',
      details: error.message
    });
  }
});

/**
 * @route POST /api/ai/generate-export-certificates
 * @desc Generate automated export certificates
 * @access Public
 */
router.post('/generate-export-certificates', async (req, res) => {
  try {
    const { productData, destinationCountry, requiredCertificates } = req.body;

    if (!productData || !destinationCountry || !requiredCertificates) {
      return res.status(400).json({
        success: false,
        error: 'Product data, destination country, and required certificates are required'
      });
    }

    const result = await regulatoryService.generateExportCertificates(
      productData,
      destinationCountry,
      requiredCertificates
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Export certificate generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Export certificate generation failed',
      details: error.message
    });
  }
});

/**
 * @route GET /api/ai/regulatory-stats
 * @desc Get regulatory compliance statistics
 * @access Public
 */
router.get('/regulatory-stats', async (req, res) => {
  try {
    const stats = regulatoryService.getRegulatoryStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching regulatory stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regulatory statistics'
    });
  }
});

// ============================================================================
// SMS-over-Blockchain Gateway Endpoints
// ============================================================================

/**
 * @route POST /api/sms/webhook
 * @desc Receive SMS data from IoT devices at remote collection points
 * @access Public (webhook)
 */
router.post('/sms/webhook', async (req, res) => {
  try {
    const { phoneNumber, messageBody, timestamp } = req.body;

    if (!phoneNumber || !messageBody) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message body are required'
      });
    }

    const result = await smsBlockchainGateway.processSMSData(
      phoneNumber,
      messageBody,
      timestamp || Date.now()
    );

    res.json(result);

  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process SMS data',
      details: error.message
    });
  }
});

/**
 * @route GET /api/sms/devices
 * @desc Get all registered IoT devices
 * @access Public
 */
router.get('/sms/devices', async (req, res) => {
  try {
    const devices = smsBlockchainGateway.getAllDevices();

    res.json({
      success: true,
      data: {
        devices,
        totalDevices: devices.length,
        activeDevices: devices.filter(d => d.status === 'ACTIVE').length
      }
    });

  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve devices',
      details: error.message
    });
  }
});

/**
 * @route GET /api/sms/device/:deviceId
 * @desc Get specific device status
 * @access Public
 */
router.get('/sms/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const device = smsBlockchainGateway.getDeviceStatus(deviceId);

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: device
    });

  } catch (error) {
    console.error('Get device status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve device status',
      details: error.message
    });
  }
});

/**
 * @route GET /api/sms/stats
 * @desc Get SMS gateway statistics
 * @access Public
 */
router.get('/sms/stats', async (req, res) => {
  try {
    const stats = smsBlockchainGateway.getSMSGatewayStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get SMS stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve SMS statistics',
      details: error.message
    });
  }
});

/**
 * @route GET /api/sms/recent-data
 * @desc Get recent SMS data transmissions
 * @access Public
 */
router.get('/sms/recent-data', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recentData = smsBlockchainGateway.getRecentSMSData(parseInt(limit));

    res.json({
      success: true,
      data: {
        recentTransmissions: recentData,
        totalCount: recentData.length
      }
    });

  } catch (error) {
    console.error('Get recent SMS data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve recent SMS data',
      details: error.message
    });
  }
});

/**
 * @route POST /api/sms/simulate-collection
 * @desc Simulate IoT device sending collection event via SMS
 * @access Public (for demo)
 */
router.post('/sms/simulate-collection', async (req, res) => {
  try {
    const { deviceId, species, quantity, quality } = req.body;

    if (!deviceId || !species || !quantity || !quality) {
      return res.status(400).json({
        success: false,
        error: 'Device ID, species, quantity, and quality are required'
      });
    }

    // Get device info
    const device = smsBlockchainGateway.getDeviceStatus(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }

    // Simulate SMS message format
    const timestamp = Math.floor(Date.now() / 1000);
    const smsMessage = `CE|${deviceId}|${device.location.latitude}|${device.location.longitude}|${species.toUpperCase()}|${quantity}|${quality}|${timestamp}|${device.collectorId}`;

    const result = await smsBlockchainGateway.processSMSData(
      device.phoneNumber,
      smsMessage,
      Date.now()
    );

    res.json({
      success: true,
      data: {
        simulatedSMS: smsMessage,
        result
      }
    });

  } catch (error) {
    console.error('Simulate collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate collection event',
      details: error.message
    });
  }
});

module.exports = router;
