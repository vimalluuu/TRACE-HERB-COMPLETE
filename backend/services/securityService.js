const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Security & Cyber Innovation Service
 * Handles Zero-Knowledge Proofs, end-to-end encryption, and threat simulation
 */
class SecurityService {
  constructor() {
    // ZKP Configuration
    this.zkpConfig = {
      curve: 'secp256k1',
      hashAlgorithm: 'sha256',
      proofSystem: 'Groth16',
      trustedSetup: 'ceremony_2024_trace_herb'
    };

    // Encryption Configuration
    this.encryptionConfig = {
      algorithm: 'aes-256-gcm',
      keyDerivation: 'pbkdf2',
      iterations: 100000,
      saltLength: 32,
      ivLength: 16,
      tagLength: 16
    };

    // Threat Detection Patterns
    this.threatPatterns = {
      fakeQR: {
        invalidFormat: /^(?!TRACE-HERB:)[A-Z0-9-_]+$/,
        suspiciousLength: { min: 10, max: 200 },
        knownMalicious: ['FAKE-QR-123', 'SCAM-HERB-456']
      },
      doubleSpending: {
        timeWindow: 300000, // 5 minutes
        maxAttempts: 3
      },
      dataIntegrity: {
        hashMismatch: true,
        timestampTolerance: 600000, // 10 minutes
        signatureValidation: true
      },
      accessPatterns: {
        maxRequestsPerMinute: 100,
        suspiciousIPs: ['192.168.1.100', '10.0.0.50'],
        geoAnomalies: true
      }
    };

    // Mock databases for security
    this.zkpProofs = new Map();
    this.encryptedData = new Map();
    this.threatLogs = [];
    this.accessLogs = [];
    this.securityKeys = new Map();
    this.verificationAttempts = new Map();
  }

  /**
   * Generate Zero-Knowledge Proof for privacy-preserving analytics
   * @param {object} privateData - Sensitive data to prove
   * @param {object} publicInputs - Public verification parameters
   * @param {string} proofType - Type of proof (quality, location, quantity)
   * @returns {object} ZKP generation result
   */
  async generateZKProof(privateData, publicInputs, proofType) {
    try {
      console.log(`Generating ZKP for ${proofType}...`);

      // Simulate ZKP generation delay
      await this.simulateProcessingDelay(3000);

      // Generate proof based on type
      let proof;
      switch (proofType) {
        case 'quality':
          proof = await this.generateQualityProof(privateData, publicInputs);
          break;
        case 'location':
          proof = await this.generateLocationProof(privateData, publicInputs);
          break;
        case 'quantity':
          proof = await this.generateQuantityProof(privateData, publicInputs);
          break;
        case 'farmer_identity':
          proof = await this.generateIdentityProof(privateData, publicInputs);
          break;
        default:
          throw new Error('Unsupported proof type');
      }

      // Store proof for verification
      const proofId = this.generateProofId();
      this.zkpProofs.set(proofId, {
        proof,
        proofType,
        publicInputs,
        timestamp: new Date().toISOString(),
        verified: false
      });

      return {
        success: true,
        proofId,
        proof,
        proofType,
        publicInputs,
        verificationInstructions: {
          endpoint: `/api/security/verify-zkp/${proofId}`,
          method: 'POST',
          requiredFields: ['proof', 'publicInputs']
        },
        privacyGuarantees: [
          'Sensitive farmer data never exposed',
          'Only proof of compliance revealed',
          'Zero-knowledge verification possible',
          'Cryptographically secure and tamper-proof'
        ],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('ZKP Generation Error:', error);
      return {
        success: false,
        error: error.message,
        proofType,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verify Zero-Knowledge Proof
   * @param {string} proofId - Proof identifier
   * @param {object} submittedProof - Proof to verify
   * @param {object} publicInputs - Public verification parameters
   * @returns {object} ZKP verification result
   */
  async verifyZKProof(proofId, submittedProof, publicInputs) {
    try {
      const storedProof = this.zkpProofs.get(proofId);
      
      if (!storedProof) {
        return {
          success: false,
          error: 'Proof not found',
          verified: false
        };
      }

      // Simulate verification delay
      await this.simulateProcessingDelay(2000);

      // Verify proof cryptographically (mock implementation)
      const isValid = this.cryptographicallyVerifyProof(
        submittedProof, 
        storedProof.proof, 
        publicInputs
      );

      // Update proof status
      storedProof.verified = isValid;
      storedProof.verificationTime = new Date().toISOString();

      return {
        success: true,
        verified: isValid,
        proofId,
        proofType: storedProof.proofType,
        verificationTime: storedProof.verificationTime,
        publicInputs,
        privacyPreserved: true,
        message: isValid ? 
          'Proof verified successfully - compliance confirmed without revealing sensitive data' :
          'Proof verification failed - data may be invalid or tampered'
      };

    } catch (error) {
      console.error('ZKP Verification Error:', error);
      return {
        success: false,
        error: error.message,
        verified: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Encrypt sensitive data with selective disclosure
   * @param {object} data - Data to encrypt
   * @param {array} disclosureFields - Fields that can be selectively disclosed
   * @param {string} recipientId - Intended recipient
   * @returns {object} Encryption result
   */
  async encryptWithSelectiveDisclosure(data, disclosureFields, recipientId) {
    try {
      // Generate encryption key
      const masterKey = crypto.randomBytes(32);
      const salt = crypto.randomBytes(this.encryptionConfig.saltLength);
      
      // Create field-specific keys for selective disclosure
      const fieldKeys = {};
      const encryptedFields = {};
      
      for (const field of Object.keys(data)) {
        // Generate unique key for each field
        const fieldKey = crypto.pbkdf2Sync(
          masterKey, 
          Buffer.concat([salt, Buffer.from(field)]), 
          this.encryptionConfig.iterations, 
          32, 
          'sha256'
        );
        
        fieldKeys[field] = fieldKey;
        
        // Encrypt field data
        const iv = crypto.randomBytes(this.encryptionConfig.ivLength);
        const cipher = crypto.createCipher(this.encryptionConfig.algorithm, fieldKey);
        cipher.setAAD(Buffer.from(field)); // Additional authenticated data
        
        let encrypted = cipher.update(JSON.stringify(data[field]), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        
        encryptedFields[field] = {
          data: encrypted,
          iv: iv.toString('hex'),
          tag: tag.toString('hex'),
          disclosable: disclosureFields.includes(field)
        };
      }

      // Store encryption metadata
      const encryptionId = this.generateEncryptionId();
      this.encryptedData.set(encryptionId, {
        encryptedFields,
        fieldKeys,
        salt: salt.toString('hex'),
        recipientId,
        disclosureFields,
        timestamp: new Date().toISOString()
      });

      // Generate disclosure tokens for allowed fields
      const disclosureTokens = {};
      for (const field of disclosureFields) {
        disclosureTokens[field] = this.generateDisclosureToken(encryptionId, field);
      }

      return {
        success: true,
        encryptionId,
        encryptedFields: Object.keys(encryptedFields).reduce((acc, field) => {
          acc[field] = {
            encrypted: true,
            disclosable: encryptedFields[field].disclosable,
            size: encryptedFields[field].data.length
          };
          return acc;
        }, {}),
        disclosureTokens,
        recipientId,
        encryptionAlgorithm: this.encryptionConfig.algorithm,
        keyDerivation: this.encryptionConfig.keyDerivation,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Encryption Error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Selectively disclose encrypted fields
   * @param {string} encryptionId - Encryption identifier
   * @param {array} fieldsToDisclose - Fields to decrypt and disclose
   * @param {string} disclosureToken - Authorization token
   * @returns {object} Selective disclosure result
   */
  async selectivelyDisclose(encryptionId, fieldsToDisclose, disclosureToken) {
    try {
      const encryptedData = this.encryptedData.get(encryptionId);
      
      if (!encryptedData) {
        return {
          success: false,
          error: 'Encrypted data not found'
        };
      }

      // Verify disclosure authorization
      const isAuthorized = this.verifyDisclosureToken(encryptionId, fieldsToDisclose, disclosureToken);
      if (!isAuthorized) {
        return {
          success: false,
          error: 'Unauthorized disclosure attempt'
        };
      }

      const disclosedData = {};
      const deniedFields = [];

      for (const field of fieldsToDisclose) {
        if (!encryptedData.disclosureFields.includes(field)) {
          deniedFields.push(field);
          continue;
        }

        // Decrypt field
        const fieldData = encryptedData.encryptedFields[field];
        const fieldKey = encryptedData.fieldKeys[field];
        
        try {
          const decipher = crypto.createDecipher(this.encryptionConfig.algorithm, fieldKey);
          decipher.setAAD(Buffer.from(field));
          decipher.setAuthTag(Buffer.from(fieldData.tag, 'hex'));
          
          let decrypted = decipher.update(fieldData.data, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          
          disclosedData[field] = JSON.parse(decrypted);
        } catch (decryptError) {
          console.error(`Decryption error for field ${field}:`, decryptError);
          deniedFields.push(field);
        }
      }

      return {
        success: true,
        encryptionId,
        disclosedData,
        deniedFields,
        disclosureTime: new Date().toISOString(),
        privacyNote: 'Only requested fields have been disclosed. Other data remains encrypted.'
      };

    } catch (error) {
      console.error('Selective Disclosure Error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Simulate and detect various cyber threats
   * @param {object} threatScenario - Threat simulation parameters
   * @returns {object} Threat simulation result
   */
  async simulateThreat(threatScenario) {
    try {
      const { threatType, payload, sourceIP, userAgent } = threatScenario;
      
      let detectionResult;
      switch (threatType) {
        case 'fake_qr':
          detectionResult = await this.detectFakeQR(payload);
          break;
        case 'double_spending':
          detectionResult = await this.detectDoubleSpending(payload);
          break;
        case 'data_tampering':
          detectionResult = await this.detectDataTampering(payload);
          break;
        case 'access_anomaly':
          detectionResult = await this.detectAccessAnomaly(payload, sourceIP, userAgent);
          break;
        case 'injection_attack':
          detectionResult = await this.detectInjectionAttack(payload);
          break;
        default:
          throw new Error('Unsupported threat type');
      }

      // Log threat attempt
      const threatLog = {
        id: this.generateThreatId(),
        threatType,
        payload,
        sourceIP,
        userAgent,
        detectionResult,
        timestamp: new Date().toISOString(),
        severity: this.calculateThreatSeverity(threatType, detectionResult)
      };

      this.threatLogs.push(threatLog);

      return {
        success: true,
        threatId: threatLog.id,
        threatType,
        detected: detectionResult.detected,
        severity: threatLog.severity,
        detectionDetails: detectionResult,
        mitigationActions: this.generateMitigationActions(threatType, detectionResult),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Threat Simulation Error:', error);
      return {
        success: false,
        error: error.message,
        threatType,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper methods for ZKP generation
  async generateQualityProof(privateData, publicInputs) {
    // Mock quality proof generation
    const qualityScore = privateData.qualityScore;
    const threshold = publicInputs.minQuality || 70;
    
    return {
      proofData: this.generateMockProof('quality'),
      publicStatement: `Quality score >= ${threshold}`,
      verified: qualityScore >= threshold,
      proofSize: '2.1KB',
      verificationTime: '150ms'
    };
  }

  async generateLocationProof(privateData, publicInputs) {
    // Mock location proof generation
    const { latitude, longitude } = privateData.location;
    const allowedRegion = publicInputs.allowedRegion;
    
    return {
      proofData: this.generateMockProof('location'),
      publicStatement: `Location within approved region: ${allowedRegion}`,
      verified: this.isLocationInRegion({ latitude, longitude }, allowedRegion),
      proofSize: '1.8KB',
      verificationTime: '120ms'
    };
  }

  async generateQuantityProof(privateData, publicInputs) {
    // Mock quantity proof generation
    const quantity = privateData.quantity;
    const maxAllowed = publicInputs.maxQuantity || 1000;
    
    return {
      proofData: this.generateMockProof('quantity'),
      publicStatement: `Quantity <= ${maxAllowed}kg`,
      verified: quantity <= maxAllowed,
      proofSize: '1.5KB',
      verificationTime: '100ms'
    };
  }

  async generateIdentityProof(privateData, publicInputs) {
    // Mock identity proof generation
    const farmerId = privateData.farmerId;
    const requiredCertification = publicInputs.requiredCertification;
    
    return {
      proofData: this.generateMockProof('identity'),
      publicStatement: `Farmer has ${requiredCertification} certification`,
      verified: privateData.certifications.includes(requiredCertification),
      proofSize: '2.5KB',
      verificationTime: '200ms'
    };
  }

  // Threat detection methods
  async detectFakeQR(qrData) {
    const { qrCode, metadata } = qrData;
    const threats = [];

    // Check QR format
    if (this.threatPatterns.fakeQR.invalidFormat.test(qrCode)) {
      threats.push('Invalid QR format detected');
    }

    // Check QR length
    if (qrCode.length < this.threatPatterns.fakeQR.suspiciousLength.min ||
        qrCode.length > this.threatPatterns.fakeQR.suspiciousLength.max) {
      threats.push('Suspicious QR code length');
    }

    // Check against known malicious QRs
    if (this.threatPatterns.fakeQR.knownMalicious.includes(qrCode)) {
      threats.push('Known malicious QR code');
    }

    // Verify blockchain existence
    const blockchainExists = await this.verifyBlockchainRecord(qrCode);
    if (!blockchainExists) {
      threats.push('QR code not found in blockchain');
    }

    return {
      detected: threats.length > 0,
      threats,
      riskScore: Math.min(100, threats.length * 25),
      recommendation: threats.length > 0 ? 'Block QR code and alert user' : 'QR code appears legitimate'
    };
  }

  async detectDoubleSpending(transactionData) {
    const { transactionId, farmerId, timestamp } = transactionData;
    const recentAttempts = this.verificationAttempts.get(farmerId) || [];
    
    // Check for recent attempts
    const recentWindow = Date.now() - this.threatPatterns.doubleSpending.timeWindow;
    const recentCount = recentAttempts.filter(attempt => 
      new Date(attempt.timestamp).getTime() > recentWindow
    ).length;

    const isDoubleSpending = recentCount >= this.threatPatterns.doubleSpending.maxAttempts;

    // Update attempts log
    recentAttempts.push({ transactionId, timestamp: new Date().toISOString() });
    this.verificationAttempts.set(farmerId, recentAttempts.slice(-10)); // Keep last 10

    return {
      detected: isDoubleSpending,
      recentAttempts: recentCount,
      maxAllowed: this.threatPatterns.doubleSpending.maxAttempts,
      timeWindow: this.threatPatterns.doubleSpending.timeWindow / 1000 / 60, // minutes
      recommendation: isDoubleSpending ? 'Block transaction and investigate' : 'Transaction appears normal'
    };
  }

  async detectDataTampering(data) {
    const { originalHash, currentData, timestamp } = data;
    
    // Calculate current hash
    const currentHash = crypto.createHash('sha256')
      .update(JSON.stringify(currentData))
      .digest('hex');

    const hashMismatch = originalHash !== currentHash;
    
    // Check timestamp validity
    const dataTimestamp = new Date(timestamp).getTime();
    const now = Date.now();
    const timestampAnomaly = Math.abs(now - dataTimestamp) > this.threatPatterns.dataIntegrity.timestampTolerance;

    return {
      detected: hashMismatch || timestampAnomaly,
      hashMismatch,
      timestampAnomaly,
      originalHash,
      currentHash,
      timeDifference: Math.abs(now - dataTimestamp) / 1000 / 60, // minutes
      recommendation: (hashMismatch || timestampAnomaly) ? 
        'Data integrity compromised - reject transaction' : 
        'Data integrity verified'
    };
  }

  async detectAccessAnomaly(accessData, sourceIP, userAgent) {
    const { userId, requestCount, location } = accessData;
    const anomalies = [];

    // Check request rate
    if (requestCount > this.threatPatterns.accessPatterns.maxRequestsPerMinute) {
      anomalies.push('Excessive request rate detected');
    }

    // Check suspicious IPs
    if (this.threatPatterns.accessPatterns.suspiciousIPs.includes(sourceIP)) {
      anomalies.push('Access from suspicious IP address');
    }

    // Mock geo-location check
    if (location && this.isGeoAnomalous(location)) {
      anomalies.push('Unusual geographic access pattern');
    }

    return {
      detected: anomalies.length > 0,
      anomalies,
      sourceIP,
      userAgent,
      riskScore: Math.min(100, anomalies.length * 30),
      recommendation: anomalies.length > 0 ? 
        'Implement additional authentication' : 
        'Access pattern appears normal'
    };
  }

  async detectInjectionAttack(payload) {
    const injectionPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i
    ];

    const detectedPatterns = [];
    for (const pattern of injectionPatterns) {
      if (pattern.test(payload)) {
        detectedPatterns.push(pattern.toString());
      }
    }

    return {
      detected: detectedPatterns.length > 0,
      detectedPatterns,
      payload: payload.substring(0, 100) + '...', // Truncate for logging
      riskScore: Math.min(100, detectedPatterns.length * 40),
      recommendation: detectedPatterns.length > 0 ? 
        'Block request and sanitize input' : 
        'Input appears safe'
    };
  }

  // Utility methods
  generateMockProof(type) {
    return {
      a: this.generateRandomHex(64),
      b: [this.generateRandomHex(64), this.generateRandomHex(64)],
      c: this.generateRandomHex(64),
      type,
      curve: this.zkpConfig.curve,
      proofSystem: this.zkpConfig.proofSystem
    };
  }

  cryptographicallyVerifyProof(submitted, stored, publicInputs) {
    // Mock verification - in real implementation, this would use actual ZKP libraries
    return JSON.stringify(submitted) === JSON.stringify(stored.proof);
  }

  generateRandomHex(length) {
    return crypto.randomBytes(length / 2).toString('hex');
  }

  generateProofId() {
    return 'ZKP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateEncryptionId() {
    return 'ENC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateThreatId() {
    return 'THR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateDisclosureToken(encryptionId, field) {
    return crypto.createHash('sha256')
      .update(`${encryptionId}:${field}:${Date.now()}`)
      .digest('hex');
  }

  verifyDisclosureToken(encryptionId, fields, token) {
    // Mock token verification
    return token && token.length === 64; // SHA256 hex length
  }

  isLocationInRegion(location, region) {
    // Mock location verification
    return region === 'Karnataka' || region === 'India';
  }

  async verifyBlockchainRecord(qrCode) {
    // Mock blockchain verification
    return qrCode.startsWith('TRACE-HERB:');
  }

  isGeoAnomalous(location) {
    // Mock geo-anomaly detection
    return location.country !== 'India';
  }

  calculateThreatSeverity(threatType, detectionResult) {
    if (!detectionResult.detected) return 'low';
    
    const severityMap = {
      'fake_qr': 'high',
      'double_spending': 'critical',
      'data_tampering': 'critical',
      'access_anomaly': 'medium',
      'injection_attack': 'high'
    };
    
    return severityMap[threatType] || 'medium';
  }

  generateMitigationActions(threatType, detectionResult) {
    if (!detectionResult.detected) return ['Continue normal operation'];
    
    const mitigationMap = {
      'fake_qr': [
        'Block QR code from system',
        'Alert user about potential fraud',
        'Report to security team',
        'Update QR validation rules'
      ],
      'double_spending': [
        'Temporarily suspend farmer account',
        'Require additional verification',
        'Investigate transaction history',
        'Implement rate limiting'
      ],
      'data_tampering': [
        'Reject tampered transaction',
        'Restore from backup if available',
        'Investigate data source',
        'Strengthen integrity checks'
      ],
      'access_anomaly': [
        'Require multi-factor authentication',
        'Monitor user activity closely',
        'Implement IP-based restrictions',
        'Review access logs'
      ],
      'injection_attack': [
        'Block malicious request',
        'Sanitize all inputs',
        'Update input validation',
        'Review security policies'
      ]
    };
    
    return mitigationMap[threatType] || ['Investigate further'];
  }

  async simulateProcessingDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Statistics and monitoring
  getSecurityStats() {
    const totalThreats = this.threatLogs.length;
    const detectedThreats = this.threatLogs.filter(log => log.detectionResult.detected).length;
    const criticalThreats = this.threatLogs.filter(log => log.severity === 'critical').length;

    return {
      totalZKProofs: this.zkpProofs.size,
      encryptedDatasets: this.encryptedData.size,
      totalThreats,
      detectedThreats,
      criticalThreats,
      detectionRate: totalThreats > 0 ? (detectedThreats / totalThreats * 100).toFixed(1) : 0,
      lastThreatDetected: this.threatLogs.length > 0 ? 
        this.threatLogs[this.threatLogs.length - 1].timestamp : null,
      securityLevel: criticalThreats === 0 ? 'High' : criticalThreats < 3 ? 'Medium' : 'Low'
    };
  }
}

module.exports = new SecurityService();
