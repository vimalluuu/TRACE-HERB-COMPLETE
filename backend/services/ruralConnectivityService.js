const fs = require('fs');
const path = require('path');

/**
 * Rural Connectivity Service
 * Handles SMS-to-blockchain, offline sync, and paper QR systems for rural farmers
 */
class RuralConnectivityService {
  constructor() {
    // SMS Gateway Configuration (Mock)
    this.smsGateway = {
      provider: 'TextLocal', // Popular in India
      apiKey: process.env.SMS_API_KEY || 'mock_api_key',
      senderId: 'TRCHRB',
      baseUrl: 'https://api.textlocal.in/send/'
    };

    // LoRaWAN Configuration (Mock)
    this.loraConfig = {
      networkServer: 'ttn.in', // The Things Network India
      appId: 'trace-herb-rural',
      deviceEUI: 'mock_device_eui',
      frequency: '865-867 MHz' // India ISM band
    };

    // Offline sync storage
    this.offlineQueue = [];
    this.paperQRDatabase = new Map();

    // SMS Command patterns
    this.smsCommands = {
      REGISTER: /^REG\s+(\w+)\s+(.+)$/i,
      HARVEST: /^HRV\s+(\w+)\s+(\d+\.?\d*)\s*(\w+)?\s*(.*)$/i,
      STATUS: /^STS\s+(\w+)$/i,
      HELP: /^HELP$/i,
      QUALITY: /^QLT\s+(\w+)\s+(\d+)$/i,
      LOCATION: /^LOC\s+(\w+)\s+([\d.-]+)\s+([\d.-]+)$/i
    };

    // Supported languages for SMS
    this.smsLanguages = {
      'en': 'English',
      'hi': 'Hindi',
      'te': 'Telugu',
      'ta': 'Tamil',
      'kn': 'Kannada',
      'mr': 'Marathi',
      'gu': 'Gujarati',
      'bn': 'Bengali'
    };
  }

  /**
   * Process incoming SMS and convert to blockchain data
   * @param {string} phoneNumber - Sender's phone number
   * @param {string} message - SMS message content
   * @param {string} language - Language code (optional)
   * @returns {object} Processing result
   */
  async processSMSToBlockchain(phoneNumber, message, language = 'en') {
    try {
      const cleanPhone = this.cleanPhoneNumber(phoneNumber);
      const cleanMessage = message.trim().toUpperCase();

      console.log(`Processing SMS from ${cleanPhone}: ${message}`);

      // Parse SMS command
      const parsedCommand = this.parseSMSCommand(cleanMessage);
      
      if (!parsedCommand.success) {
        return await this.sendSMSResponse(cleanPhone, 
          'Invalid command. Send HELP for instructions.', language);
      }

      // Process based on command type
      let result;
      switch (parsedCommand.command) {
        case 'REGISTER':
          result = await this.handleRegisterCommand(cleanPhone, parsedCommand.data, language);
          break;
        case 'HARVEST':
          result = await this.handleHarvestCommand(cleanPhone, parsedCommand.data, language);
          break;
        case 'STATUS':
          result = await this.handleStatusCommand(cleanPhone, parsedCommand.data, language);
          break;
        case 'QUALITY':
          result = await this.handleQualityCommand(cleanPhone, parsedCommand.data, language);
          break;
        case 'LOCATION':
          result = await this.handleLocationCommand(cleanPhone, parsedCommand.data, language);
          break;
        case 'HELP':
          result = await this.handleHelpCommand(cleanPhone, language);
          break;
        default:
          result = await this.sendSMSResponse(cleanPhone, 
            'Unknown command. Send HELP for instructions.', language);
      }

      return {
        success: true,
        phoneNumber: cleanPhone,
        command: parsedCommand.command,
        result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('SMS Processing Error:', error);
      await this.sendSMSResponse(phoneNumber, 
        'System error. Please try again later.', language);
      
      return {
        success: false,
        error: error.message,
        phoneNumber,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Handle offline data synchronization
   * @param {object} deviceData - Data from offline device
   * @param {string} deviceId - Unique device identifier
   * @returns {object} Sync result
   */
  async syncOfflineData(deviceData, deviceId) {
    try {
      console.log(`Syncing offline data from device: ${deviceId}`);

      // Validate device data
      const validation = this.validateOfflineData(deviceData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid offline data format',
          details: validation.errors
        };
      }

      // Process each data entry
      const syncResults = [];
      for (const entry of deviceData.entries) {
        try {
          // Convert offline entry to blockchain format
          const blockchainData = this.convertOfflineToBlockchain(entry, deviceId);
          
          // Add to sync queue
          this.offlineQueue.push({
            id: this.generateSyncId(),
            deviceId,
            data: blockchainData,
            timestamp: entry.timestamp || new Date().toISOString(),
            status: 'pending'
          });

          syncResults.push({
            entryId: entry.id,
            status: 'queued',
            blockchainId: blockchainData.id
          });

        } catch (entryError) {
          console.error(`Error processing entry ${entry.id}:`, entryError);
          syncResults.push({
            entryId: entry.id,
            status: 'failed',
            error: entryError.message
          });
        }
      }

      // Process sync queue
      await this.processSyncQueue();

      return {
        success: true,
        deviceId,
        totalEntries: deviceData.entries.length,
        syncResults,
        queueSize: this.offlineQueue.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Offline Sync Error:', error);
      return {
        success: false,
        error: error.message,
        deviceId,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate paper QR slip with OTP activation
   * @param {object} batchData - Batch information
   * @param {string} farmerId - Farmer ID
   * @returns {object} Paper QR result
   */
  async generatePaperQR(batchData, farmerId) {
    try {
      // Generate unique QR code
      const qrId = this.generateQRId();
      
      // Generate OTP for activation
      const otp = this.generateOTP();
      
      // Create paper QR entry
      const paperQR = {
        qrId,
        otp,
        farmerId,
        batchData,
        status: 'inactive',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        activatedAt: null,
        activationPhone: null
      };

      // Store in paper QR database
      this.paperQRDatabase.set(qrId, paperQR);

      // Generate QR code content
      const qrContent = `TRACE-HERB:${qrId}:${farmerId}`;

      return {
        success: true,
        qrId,
        qrContent,
        otp,
        activationInstructions: {
          sms: `Send "ACTIVATE ${qrId} ${otp}" to activate this QR code`,
          call: `Call 1800-TRACE-HERB and provide QR ID: ${qrId} and OTP: ${otp}`,
          web: `Visit trace-herb.in/activate and enter QR ID: ${qrId} and OTP: ${otp}`
        },
        expiresAt: paperQR.expiresAt,
        printData: {
          farmerId,
          farmerName: batchData.farmerName,
          herbName: batchData.commonName,
          quantity: `${batchData.quantity} ${batchData.unit}`,
          date: new Date().toLocaleDateString('en-IN'),
          qrId: qrId.substring(0, 8) // Short ID for printing
        }
      };

    } catch (error) {
      console.error('Paper QR Generation Error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Activate paper QR code using OTP
   * @param {string} qrId - QR code ID
   * @param {string} otp - One-time password
   * @param {string} phoneNumber - Activating phone number
   * @returns {object} Activation result
   */
  async activatePaperQR(qrId, otp, phoneNumber) {
    try {
      const paperQR = this.paperQRDatabase.get(qrId);
      
      if (!paperQR) {
        return {
          success: false,
          error: 'QR code not found'
        };
      }

      if (paperQR.status === 'active') {
        return {
          success: false,
          error: 'QR code already activated'
        };
      }

      if (new Date() > new Date(paperQR.expiresAt)) {
        return {
          success: false,
          error: 'QR code has expired'
        };
      }

      if (paperQR.otp !== otp) {
        return {
          success: false,
          error: 'Invalid OTP'
        };
      }

      // Activate the QR code
      paperQR.status = 'active';
      paperQR.activatedAt = new Date().toISOString();
      paperQR.activationPhone = this.cleanPhoneNumber(phoneNumber);

      // Update database
      this.paperQRDatabase.set(qrId, paperQR);

      // Send confirmation SMS
      await this.sendSMSResponse(phoneNumber, 
        `QR code ${qrId.substring(0, 8)} activated successfully! Your herbs are now traceable on blockchain.`);

      return {
        success: true,
        qrId,
        activatedAt: paperQR.activatedAt,
        batchData: paperQR.batchData,
        message: 'QR code activated successfully'
      };

    } catch (error) {
      console.error('Paper QR Activation Error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper methods
  cleanPhoneNumber(phone) {
    // Remove country code and format for Indian numbers
    return phone.replace(/^\+91/, '').replace(/\D/g, '').slice(-10);
  }

  parseSMSCommand(message) {
    for (const [command, pattern] of Object.entries(this.smsCommands)) {
      const match = message.match(pattern);
      if (match) {
        return {
          success: true,
          command,
          data: match.slice(1) // Remove full match, keep groups
        };
      }
    }
    return { success: false };
  }

  async handleRegisterCommand(phone, data, language) {
    const [farmerId, farmerName] = data;
    
    // Mock farmer registration
    const registration = {
      farmerId,
      farmerName,
      phone,
      registeredAt: new Date().toISOString(),
      status: 'active'
    };

    await this.sendSMSResponse(phone, 
      `Welcome ${farmerName}! Farmer ID ${farmerId} registered. Send HRV to report harvest.`, language);

    return registration;
  }

  async handleHarvestCommand(phone, data, language) {
    const [herbCode, quantity, unit = 'KG', notes = ''] = data;
    
    // Create harvest entry
    const harvest = {
      id: this.generateHarvestId(),
      farmerId: phone, // Use phone as temp farmer ID
      herbCode,
      quantity: parseFloat(quantity),
      unit,
      notes,
      reportedAt: new Date().toISOString(),
      method: 'SMS'
    };

    await this.sendSMSResponse(phone, 
      `Harvest recorded: ${quantity}${unit} of ${herbCode}. ID: ${harvest.id.substring(0, 8)}`, language);

    return harvest;
  }

  async handleStatusCommand(phone, data, language) {
    const [batchId] = data;
    
    // Mock status check
    const status = {
      batchId,
      status: 'In Processing',
      location: 'Quality Lab',
      lastUpdate: new Date().toISOString()
    };

    await this.sendSMSResponse(phone, 
      `Batch ${batchId}: ${status.status} at ${status.location}`, language);

    return status;
  }

  async handleQualityCommand(phone, data, language) {
    const [batchId, score] = data;
    
    const quality = {
      batchId,
      qualityScore: parseInt(score),
      reportedBy: phone,
      reportedAt: new Date().toISOString()
    };

    await this.sendSMSResponse(phone, 
      `Quality score ${score} recorded for batch ${batchId}`, language);

    return quality;
  }

  async handleLocationCommand(phone, data, language) {
    const [batchId, lat, lng] = data;
    
    const location = {
      batchId,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      reportedBy: phone,
      reportedAt: new Date().toISOString()
    };

    await this.sendSMSResponse(phone, 
      `Location updated for batch ${batchId}`, language);

    return location;
  }

  async handleHelpCommand(phone, language) {
    const helpText = `TRACE HERB SMS Commands:
REG <FarmerID> <Name> - Register
HRV <HerbCode> <Qty> [Unit] - Report harvest
STS <BatchID> - Check status
QLT <BatchID> <Score> - Report quality
LOC <BatchID> <Lat> <Lng> - Update location
HELP - Show this help`;

    await this.sendSMSResponse(phone, helpText, language);
    return { command: 'help', sent: true };
  }

  async sendSMSResponse(phone, message, language = 'en') {
    // Mock SMS sending
    console.log(`SMS to ${phone}: ${message}`);
    
    // In real implementation, this would call SMS gateway API
    return {
      success: true,
      phone,
      message,
      language,
      sentAt: new Date().toISOString(),
      provider: this.smsGateway.provider
    };
  }

  validateOfflineData(data) {
    const errors = [];
    
    if (!data.entries || !Array.isArray(data.entries)) {
      errors.push('Missing or invalid entries array');
    }

    if (!data.deviceId) {
      errors.push('Missing device ID');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  convertOfflineToBlockchain(entry, deviceId) {
    return {
      id: this.generateBlockchainId(),
      deviceId,
      type: 'offline_sync',
      data: entry,
      syncedAt: new Date().toISOString(),
      source: 'LoRaWAN'
    };
  }

  async processSyncQueue() {
    // Mock processing of sync queue
    const processed = this.offlineQueue.splice(0, 10); // Process 10 at a time
    
    for (const item of processed) {
      item.status = 'synced';
      item.syncedAt = new Date().toISOString();
    }

    return processed;
  }

  generateQRId() {
    return 'QR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateSyncId() {
    return 'SYNC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateHarvestId() {
    return 'HRV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateBlockchainId() {
    return 'BC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Statistics and monitoring
  getConnectivityStats() {
    return {
      smsProcessed: 1234,
      offlineDevices: 45,
      paperQRsActive: 234,
      syncQueueSize: this.offlineQueue.length,
      lastSync: new Date().toISOString()
    };
  }
}

module.exports = new RuralConnectivityService();
