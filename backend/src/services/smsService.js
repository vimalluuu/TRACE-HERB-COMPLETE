const crypto = require('crypto');
const moment = require('moment');

class SMSService {
  constructor() {
    // Mock SMS gateway - in production, integrate with Twilio, AWS SNS, or local SMS provider
    this.pendingEntries = new Map(); // Store pending blockchain entries
    this.otpStore = new Map(); // Store OTPs for paper QR verification
    this.smsQueue = []; // Queue for offline SMS processing
    
    // SMS command patterns
    this.commandPatterns = {
      HARVEST: /^HARVEST\s+(\w+)\s+(\d+(?:\.\d+)?)\s*KG\s+LAT\s*(\d+(?:\.\d+)?)\s+LNG\s*(\d+(?:\.\d+)?)\s*(.*)$/i,
      STATUS: /^STATUS\s+([A-Z0-9]+)$/i,
      HELP: /^HELP$/i,
      REGISTER: /^REGISTER\s+(\w+)\s+(.+)$/i,
      OTP: /^OTP\s+([A-Z0-9]{6})\s+([A-Z0-9]+)$/i
    };

    // Initialize mock farmer database
    this.farmers = new Map([
      ['+919876543210', { id: 'FARM-001', name: 'Rajesh Kumar', location: 'Karnataka', verified: true }],
      ['+919876543211', { id: 'FARM-002', name: 'Priya Sharma', location: 'Tamil Nadu', verified: true }],
      ['+919876543212', { id: 'FARM-003', name: 'Amit Patel', location: 'Gujarat', verified: true }]
    ]);
  }

  /**
   * Process incoming SMS message
   * @param {string} phoneNumber - Sender's phone number
   * @param {string} message - SMS message content
   * @returns {Object} Processing result
   */
  async processSMS(phoneNumber, message) {
    try {
      const farmer = this.farmers.get(phoneNumber);
      
      if (!farmer) {
        return this.sendSMSResponse(phoneNumber, 
          "❌ Unregistered number. Send 'REGISTER [Name] [Location]' to register."
        );
      }

      const command = message.trim().toUpperCase();
      
      // Match command patterns
      if (this.commandPatterns.HARVEST.test(command)) {
        return await this.processHarvestCommand(phoneNumber, message, farmer);
      } else if (this.commandPatterns.STATUS.test(command)) {
        return await this.processStatusCommand(phoneNumber, message, farmer);
      } else if (this.commandPatterns.HELP.test(command)) {
        return this.processHelpCommand(phoneNumber);
      } else if (this.commandPatterns.OTP.test(command)) {
        return await this.processOTPCommand(phoneNumber, message, farmer);
      } else {
        return this.sendSMSResponse(phoneNumber, 
          "❓ Unknown command. Send 'HELP' for available commands."
        );
      }
    } catch (error) {
      console.error('SMS Processing Error:', error);
      return this.sendSMSResponse(phoneNumber, 
        "⚠️ System error. Please try again later."
      );
    }
  }

  /**
   * Process harvest command
   * @param {string} phoneNumber - Farmer's phone number
   * @param {string} message - SMS message
   * @param {Object} farmer - Farmer details
   */
  async processHarvestCommand(phoneNumber, message, farmer) {
    const match = message.match(this.commandPatterns.HARVEST);
    if (!match) {
      return this.sendSMSResponse(phoneNumber, 
        "❌ Invalid format. Use: HARVEST [Species] [Quantity]KG LAT [Latitude] LNG [Longitude] [Notes]"
      );
    }

    const [, species, quantity, latitude, longitude, notes] = match;
    
    // Validate data
    const validation = this.validateHarvestData(species, quantity, latitude, longitude);
    if (!validation.valid) {
      return this.sendSMSResponse(phoneNumber, `❌ ${validation.error}`);
    }

    // Generate entry ID
    const entryId = this.generateEntryId();
    
    // Create blockchain entry
    const blockchainEntry = {
      id: entryId,
      farmerId: farmer.id,
      farmerName: farmer.name,
      species: species.toLowerCase(),
      quantity: parseFloat(quantity),
      location: {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      },
      notes: notes || '',
      timestamp: new Date().toISOString(),
      source: 'sms',
      phoneNumber,
      status: 'pending_sync'
    };

    // Store pending entry
    this.pendingEntries.set(entryId, blockchainEntry);

    // Generate OTP for paper QR verification
    const otp = this.generateOTP();
    this.otpStore.set(otp, {
      entryId,
      farmerId: farmer.id,
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });

    // Simulate blockchain sync (in production, this would sync when network is available)
    setTimeout(() => {
      this.syncToBlockchain(entryId);
    }, 5000);

    const response = `✅ Harvest recorded!
📝 Entry ID: ${entryId}
🌿 Species: ${species}
⚖️ Quantity: ${quantity}kg
📍 Location: ${latitude}, ${longitude}
🔐 OTP: ${otp}
⏰ Will sync to blockchain when network available.`;

    return this.sendSMSResponse(phoneNumber, response);
  }

  /**
   * Process status command
   * @param {string} phoneNumber - Farmer's phone number
   * @param {string} message - SMS message
   * @param {Object} farmer - Farmer details
   */
  async processStatusCommand(phoneNumber, message, farmer) {
    const match = message.match(this.commandPatterns.STATUS);
    if (!match) {
      return this.sendSMSResponse(phoneNumber, 
        "❌ Invalid format. Use: STATUS [EntryID]"
      );
    }

    const [, entryId] = match;
    const entry = this.pendingEntries.get(entryId);

    if (!entry) {
      return this.sendSMSResponse(phoneNumber, 
        `❌ Entry ${entryId} not found.`
      );
    }

    if (entry.farmerId !== farmer.id) {
      return this.sendSMSResponse(phoneNumber, 
        "❌ Access denied. You can only check your own entries."
      );
    }

    const statusEmoji = {
      'pending_sync': '⏳',
      'synced': '✅',
      'failed': '❌',
      'processing': '🔄'
    };

    const response = `📊 Status for ${entryId}:
${statusEmoji[entry.status] || '❓'} Status: ${entry.status.replace('_', ' ').toUpperCase()}
🌿 Species: ${entry.species}
⚖️ Quantity: ${entry.quantity}kg
📅 Recorded: ${moment(entry.timestamp).format('DD/MM/YYYY HH:mm')}`;

    return this.sendSMSResponse(phoneNumber, response);
  }

  /**
   * Process help command
   * @param {string} phoneNumber - Farmer's phone number
   */
  processHelpCommand(phoneNumber) {
    const helpText = `📱 TRACE HERB SMS Commands:

🌾 HARVEST [Species] [Qty]KG LAT [Lat] LNG [Lng] [Notes]
   Example: HARVEST Ashwagandha 15KG LAT 12.9716 LNG 77.5946 Good quality

📊 STATUS [EntryID]
   Check status of your harvest entry

🔐 OTP [6-digit-OTP] [QR-Code]
   Verify paper QR slip with OTP

❓ HELP
   Show this help message

📞 Support: Call 1800-TRACE-HERB`;

    return this.sendSMSResponse(phoneNumber, helpText);
  }

  /**
   * Process OTP verification command
   * @param {string} phoneNumber - Farmer's phone number
   * @param {string} message - SMS message
   * @param {Object} farmer - Farmer details
   */
  async processOTPCommand(phoneNumber, message, farmer) {
    const match = message.match(this.commandPatterns.OTP);
    if (!match) {
      return this.sendSMSResponse(phoneNumber, 
        "❌ Invalid format. Use: OTP [6-digit-OTP] [QR-Code]"
      );
    }

    const [, otp, qrCode] = match;
    const otpData = this.otpStore.get(otp);

    if (!otpData) {
      return this.sendSMSResponse(phoneNumber, 
        "❌ Invalid or expired OTP."
      );
    }

    if (otpData.expires < Date.now()) {
      this.otpStore.delete(otp);
      return this.sendSMSResponse(phoneNumber, 
        "❌ OTP has expired. Please generate a new one."
      );
    }

    if (otpData.farmerId !== farmer.id) {
      return this.sendSMSResponse(phoneNumber, 
        "❌ OTP belongs to different farmer."
      );
    }

    // Verify QR code and activate entry
    const entry = this.pendingEntries.get(otpData.entryId);
    if (entry) {
      entry.qrCode = qrCode;
      entry.status = 'verified';
      entry.verifiedAt = new Date().toISOString();
    }

    // Clean up OTP
    this.otpStore.delete(otp);

    const response = `✅ QR Code verified successfully!
📝 Entry ID: ${otpData.entryId}
🏷️ QR Code: ${qrCode}
✅ Ready for blockchain sync`;

    return this.sendSMSResponse(phoneNumber, response);
  }

  /**
   * Generate paper QR slip with OTP
   * @param {string} farmerId - Farmer ID
   * @param {string} entryId - Entry ID
   * @returns {Object} QR slip data
   */
  generatePaperQRSlip(farmerId, entryId) {
    const otp = this.generateOTP();
    const qrCode = this.generateQRCode();
    
    this.otpStore.set(otp, {
      entryId,
      farmerId,
      qrCode,
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days for paper slips
    });

    return {
      otp,
      qrCode,
      entryId,
      farmerId,
      instructions: `
📄 PAPER QR SLIP
🏷️ QR Code: ${qrCode}
🔐 OTP: ${otp}
📝 Entry: ${entryId}

📱 To activate, SMS:
OTP ${otp} ${qrCode}

⚠️ Valid for 7 days
📞 Help: 1800-TRACE-HERB
      `.trim()
    };
  }

  /**
   * Sync pending entries to blockchain when network is available
   * @param {string} entryId - Entry ID to sync
   */
  async syncToBlockchain(entryId) {
    const entry = this.pendingEntries.get(entryId);
    if (!entry) return;

    try {
      // Simulate blockchain sync
      console.log(`Syncing entry ${entryId} to blockchain...`);
      
      // In production, this would make actual blockchain calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      entry.status = 'synced';
      entry.blockchainHash = this.generateBlockchainHash();
      entry.syncedAt = new Date().toISOString();

      console.log(`Entry ${entryId} successfully synced to blockchain`);

      // Notify farmer via SMS
      const farmer = Array.from(this.farmers.values()).find(f => f.id === entry.farmerId);
      if (farmer) {
        const phoneNumber = Array.from(this.farmers.keys()).find(phone => 
          this.farmers.get(phone).id === farmer.id
        );
        
        if (phoneNumber) {
          this.sendSMSResponse(phoneNumber, 
            `✅ Entry ${entryId} synced to blockchain! Hash: ${entry.blockchainHash.substring(0, 8)}...`
          );
        }
      }
    } catch (error) {
      console.error(`Failed to sync entry ${entryId}:`, error);
      entry.status = 'failed';
      entry.error = error.message;
    }
  }

  /**
   * Get offline sync queue
   * @returns {Array} Pending entries for sync
   */
  getOfflineSyncQueue() {
    return Array.from(this.pendingEntries.values())
      .filter(entry => entry.status === 'pending_sync' || entry.status === 'failed');
  }

  /**
   * Validate harvest data
   * @param {string} species - Plant species
   * @param {string} quantity - Quantity
   * @param {string} latitude - Latitude
   * @param {string} longitude - Longitude
   * @returns {Object} Validation result
   */
  validateHarvestData(species, quantity, latitude, longitude) {
    const validSpecies = ['ashwagandha', 'turmeric', 'neem', 'tulsi', 'brahmi', 'giloy'];
    
    if (!validSpecies.includes(species.toLowerCase())) {
      return { valid: false, error: `Invalid species. Valid: ${validSpecies.join(', ')}` };
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0 || qty > 1000) {
      return { valid: false, error: 'Quantity must be between 0.1 and 1000 kg' };
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return { valid: false, error: 'Invalid latitude (-90 to 90)' };
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      return { valid: false, error: 'Invalid longitude (-180 to 180)' };
    }

    // Check if location is within India (approximate bounds)
    if (lat < 6 || lat > 37 || lng < 68 || lng > 97) {
      return { valid: false, error: 'Location must be within India' };
    }

    return { valid: true };
  }

  /**
   * Send SMS response (mock implementation)
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Message to send
   * @returns {Object} Send result
   */
  sendSMSResponse(phoneNumber, message) {
    // Mock SMS sending - in production, use actual SMS gateway
    console.log(`SMS to ${phoneNumber}: ${message}`);
    
    return {
      success: true,
      phoneNumber,
      message,
      timestamp: new Date().toISOString(),
      messageId: this.generateMessageId()
    };
  }

  // Helper methods
  generateEntryId() {
    return 'ENT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  generateOTP() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  generateQRCode() {
    return 'QR-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }

  generateBlockchainHash() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateMessageId() {
    return 'MSG-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Register new farmer via SMS
   * @param {string} phoneNumber - Phone number
   * @param {string} name - Farmer name
   * @param {string} location - Location
   */
  registerFarmer(phoneNumber, name, location) {
    const farmerId = 'FARM-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    
    this.farmers.set(phoneNumber, {
      id: farmerId,
      name,
      location,
      verified: false,
      registeredAt: new Date().toISOString()
    });

    return this.sendSMSResponse(phoneNumber, 
      `✅ Registration successful!
👤 Farmer ID: ${farmerId}
📱 Phone: ${phoneNumber}
📍 Location: ${location}
⚠️ Verification pending. You'll be notified once approved.`
    );
  }

  /**
   * Get SMS statistics
   * @returns {Object} SMS statistics
   */
  getStatistics() {
    const totalEntries = this.pendingEntries.size;
    const syncedEntries = Array.from(this.pendingEntries.values())
      .filter(entry => entry.status === 'synced').length;
    const pendingEntries = Array.from(this.pendingEntries.values())
      .filter(entry => entry.status === 'pending_sync').length;
    const failedEntries = Array.from(this.pendingEntries.values())
      .filter(entry => entry.status === 'failed').length;

    return {
      totalFarmers: this.farmers.size,
      totalEntries,
      syncedEntries,
      pendingEntries,
      failedEntries,
      activeOTPs: this.otpStore.size,
      syncRate: totalEntries > 0 ? Math.round((syncedEntries / totalEntries) * 100) : 0
    };
  }
}

module.exports = new SMSService();
