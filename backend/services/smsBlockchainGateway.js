const fs = require('fs');
const path = require('path');

/**
 * SMS-over-Blockchain Gateway Service
 * Enables IoT/GPS-enabled data capture via SMS when internet connectivity is sparse
 * Transmits real-time collection events from remote locations to blockchain
 */
class SMSBlockchainGateway {
  constructor() {
    // SMS Gateway Configuration for IoT data transmission
    this.smsGateway = {
      provider: 'TextLocal', // Popular SMS provider in India
      apiKey: process.env.SMS_API_KEY || 'mock_api_key',
      senderId: 'TRCHRB',
      baseUrl: 'https://api.textlocal.in/send/',
      webhookUrl: '/api/sms/webhook' // For receiving SMS data
    };

    // IoT Device Registry
    this.iotDevices = new Map();
    this.collectionEvents = new Map();
    this.smsDataBuffer = [];
    
    // Initialize demo IoT devices at remote collection points
    this.initializeDemoDevices();
    
    // SMS data parsing patterns for IoT sensor data
    this.smsDataPatterns = {
      // Collection Event: CE|DeviceID|Lat|Lng|Species|Quantity|Quality|Timestamp|CollectorID
      COLLECTION_EVENT: /^CE\|([A-Z0-9_]+)\|([\d.-]+)\|([\d.-]+)\|([A-Z]+)\|([\d.]+)\|([A-C])\|(\d+)\|([A-Z0-9]+)$/,
      
      // Sensor Data: SD|DeviceID|Temperature|Humidity|SoilPH|Moisture|Timestamp
      SENSOR_DATA: /^SD\|([A-Z0-9_]+)\|([\d.-]+)\|([\d.-]+)\|([\d.-]+)\|([\d.-]+)\|(\d+)$/,
      
      // Quality Test: QT|DeviceID|TestType|Result|Value|Unit|Timestamp|LabID
      QUALITY_TEST: /^QT\|([A-Z0-9_]+)\|([A-Z_]+)\|([PASS|FAIL]+)\|([\d.-]+)\|([A-Z%]+)\|(\d+)\|([A-Z0-9]+)$/,
      
      // GPS Heartbeat: GPS|DeviceID|Lat|Lng|Battery|Signal|Timestamp
      GPS_HEARTBEAT: /^GPS\|([A-Z0-9_]+)\|([\d.-]+)\|([\d.-]+)\|(\d+)\|([LOW|MED|HIGH]+)\|(\d+)$/
    };
  }

  initializeDemoDevices() {
    // Remote collection point in Western Ghats (Ashwagandha region)
    this.iotDevices.set('IOT_WG_001', {
      deviceId: 'IOT_WG_001',
      location: { 
        latitude: 15.3173, 
        longitude: 75.7139,
        region: 'Western Ghats, Karnataka',
        elevation: 650
      },
      collectorId: 'COL_001',
      collectorName: 'Rajesh Kumar',
      phoneNumber: '+91-9876543210',
      lastSeen: new Date(),
      batteryLevel: 85,
      signalStrength: 'LOW', // Requires SMS gateway
      species: ['ASHWAGANDHA', 'TURMERIC'],
      status: 'ACTIVE'
    });

    // Remote collection point in Himalayas (High altitude herbs)
    this.iotDevices.set('IOT_HM_002', {
      deviceId: 'IOT_HM_002',
      location: { 
        latitude: 30.0668, 
        longitude: 79.0193,
        region: 'Uttarakhand Himalayas',
        elevation: 2100
      },
      collectorId: 'COL_002',
      collectorName: 'Priya Sharma',
      phoneNumber: '+91-9876543211',
      lastSeen: new Date(),
      batteryLevel: 92,
      signalStrength: 'MEDIUM',
      species: ['BRAHMI', 'SHANKHPUSHPI'],
      status: 'ACTIVE'
    });

    // Remote collection point in Rajasthan (Desert herbs)
    this.iotDevices.set('IOT_RJ_003', {
      deviceId: 'IOT_RJ_003',
      location: { 
        latitude: 27.0238, 
        longitude: 74.2179,
        region: 'Thar Desert, Rajasthan',
        elevation: 250
      },
      collectorId: 'COL_003',
      collectorName: 'Mohan Singh',
      phoneNumber: '+91-9876543212',
      lastSeen: new Date(),
      batteryLevel: 78,
      signalStrength: 'LOW',
      species: ['SAFED_MUSLI', 'SHATAVARI'],
      status: 'ACTIVE'
    });
  }

  /**
   * Process incoming SMS data from IoT devices
   * Parses GPS coordinates, sensor data, and collection events
   */
  async processSMSData(phoneNumber, messageBody, timestamp) {
    try {
      const device = this.findDeviceByPhone(phoneNumber);
      if (!device) {
        return {
          success: false,
          error: 'Device not registered',
          phoneNumber
        };
      }

      // Parse different types of SMS data
      let parsedData = null;
      let dataType = null;

      // Try to match collection event pattern
      const collectionMatch = messageBody.match(this.smsDataPatterns.COLLECTION_EVENT);
      if (collectionMatch) {
        parsedData = this.parseCollectionEvent(collectionMatch, device);
        dataType = 'COLLECTION_EVENT';
      }

      // Try to match sensor data pattern
      const sensorMatch = messageBody.match(this.smsDataPatterns.SENSOR_DATA);
      if (sensorMatch) {
        parsedData = this.parseSensorData(sensorMatch, device);
        dataType = 'SENSOR_DATA';
      }

      // Try to match quality test pattern
      const qualityMatch = messageBody.match(this.smsDataPatterns.QUALITY_TEST);
      if (qualityMatch) {
        parsedData = this.parseQualityTest(qualityMatch, device);
        dataType = 'QUALITY_TEST';
      }

      // Try to match GPS heartbeat pattern
      const gpsMatch = messageBody.match(this.smsDataPatterns.GPS_HEARTBEAT);
      if (gpsMatch) {
        parsedData = this.parseGPSHeartbeat(gpsMatch, device);
        dataType = 'GPS_HEARTBEAT';
      }

      if (!parsedData) {
        return {
          success: false,
          error: 'Invalid SMS data format',
          messageBody,
          expectedFormats: [
            'CE|DeviceID|Lat|Lng|Species|Quantity|Quality|Timestamp|CollectorID',
            'SD|DeviceID|Temperature|Humidity|SoilPH|Moisture|Timestamp',
            'QT|DeviceID|TestType|Result|Value|Unit|Timestamp|LabID',
            'GPS|DeviceID|Lat|Lng|Battery|Signal|Timestamp'
          ]
        };
      }

      // Buffer the data for blockchain transmission
      const bufferedData = {
        id: `SMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deviceId: device.deviceId,
        dataType,
        data: parsedData,
        receivedAt: new Date(timestamp),
        phoneNumber,
        status: 'BUFFERED'
      };

      this.smsDataBuffer.push(bufferedData);

      // Simulate blockchain transmission
      await this.transmitToBlockchain(bufferedData);

      return {
        success: true,
        dataType,
        deviceId: device.deviceId,
        parsedData,
        blockchainTxId: `TX_${bufferedData.id}`,
        message: 'Data successfully transmitted to blockchain via SMS gateway'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        phoneNumber,
        messageBody
      };
    }
  }

  parseCollectionEvent(match, device) {
    const [, deviceId, lat, lng, species, quantity, quality, timestamp, collectorId] = match;
    
    return {
      eventType: 'CollectionEvent',
      deviceId,
      location: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        region: device.location.region,
        elevation: device.location.elevation
      },
      species: species.toUpperCase(),
      quantity: parseFloat(quantity),
      qualityGrade: quality,
      timestamp: new Date(parseInt(timestamp) * 1000),
      collectorId,
      collectorName: device.collectorName,
      environmentalData: {
        region: device.location.region,
        elevation: device.location.elevation
      }
    };
  }

  parseSensorData(match, device) {
    const [, deviceId, temperature, humidity, soilPH, moisture, timestamp] = match;
    
    return {
      eventType: 'SensorData',
      deviceId,
      location: device.location,
      sensorReadings: {
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        soilPH: parseFloat(soilPH),
        soilMoisture: parseFloat(moisture)
      },
      timestamp: new Date(parseInt(timestamp) * 1000),
      collectorId: device.collectorId
    };
  }

  parseQualityTest(match, device) {
    const [, deviceId, testType, result, value, unit, timestamp, labId] = match;
    
    return {
      eventType: 'QualityTest',
      deviceId,
      testType: testType.toLowerCase().replace('_', ' '),
      result: result === 'PASS',
      value: parseFloat(value),
      unit,
      timestamp: new Date(parseInt(timestamp) * 1000),
      labId,
      location: device.location
    };
  }

  parseGPSHeartbeat(match, device) {
    const [, deviceId, lat, lng, battery, signal, timestamp] = match;
    
    // Update device status
    device.location.latitude = parseFloat(lat);
    device.location.longitude = parseFloat(lng);
    device.batteryLevel = parseInt(battery);
    device.signalStrength = signal;
    device.lastSeen = new Date(parseInt(timestamp) * 1000);
    
    return {
      eventType: 'GPSHeartbeat',
      deviceId,
      location: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      },
      batteryLevel: parseInt(battery),
      signalStrength: signal,
      timestamp: new Date(parseInt(timestamp) * 1000)
    };
  }

  findDeviceByPhone(phoneNumber) {
    for (const [deviceId, device] of this.iotDevices) {
      if (device.phoneNumber === phoneNumber) {
        return device;
      }
    }
    return null;
  }

  async transmitToBlockchain(bufferedData) {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    bufferedData.status = 'TRANSMITTED';
    bufferedData.blockchainTxId = `TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    bufferedData.transmittedAt = new Date();
    
    return bufferedData;
  }

  // Get SMS gateway statistics
  getSMSGatewayStats() {
    const totalDevices = this.iotDevices.size;
    const activeDevices = Array.from(this.iotDevices.values()).filter(d => d.status === 'ACTIVE').length;
    const bufferedMessages = this.smsDataBuffer.filter(d => d.status === 'BUFFERED').length;
    const transmittedMessages = this.smsDataBuffer.filter(d => d.status === 'TRANSMITTED').length;
    
    return {
      totalDevices,
      activeDevices,
      bufferedMessages,
      transmittedMessages,
      totalMessages: this.smsDataBuffer.length,
      lastActivity: this.smsDataBuffer.length > 0 ? 
        Math.max(...this.smsDataBuffer.map(d => d.receivedAt.getTime())) : null
    };
  }

  // Get device status
  getDeviceStatus(deviceId) {
    return this.iotDevices.get(deviceId) || null;
  }

  // Get all devices
  getAllDevices() {
    return Array.from(this.iotDevices.values());
  }

  // Get recent SMS data
  getRecentSMSData(limit = 10) {
    return this.smsDataBuffer
      .sort((a, b) => b.receivedAt - a.receivedAt)
      .slice(0, limit);
  }
}

module.exports = SMSBlockchainGateway;
