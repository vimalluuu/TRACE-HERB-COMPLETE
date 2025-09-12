/**
 * IoT Service - GPS and Environmental Sensor Integration
 * Handles GPS tracking, environmental sensors, and IoT device communication
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { accelerometer, gyroscope, magnetometer } from 'react-native-sensors';
import BluetoothSerial from 'react-native-bluetooth-serial';
import BleManager from 'react-native-ble-manager';
import MQTT from 'react-native-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number;
  heading: number;
  speed: number;
  timestamp: string;
}

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  soilPH: number;
  lightIntensity: number;
  airQuality: number;
  soilMoisture: number;
  windSpeed: number;
  windDirection: number;
  barometricPressure: number;
  uvIndex: number;
}

interface SensorDevice {
  id: string;
  name: string;
  type: 'bluetooth' | 'ble' | 'mqtt' | 'wifi';
  status: 'connected' | 'disconnected' | 'error';
  lastReading: Date;
  batteryLevel?: number;
}

export class IoTService {
  private isInitialized: boolean = false;
  private gpsWatchId: number | null = null;
  private connectedDevices: Map<string, SensorDevice> = new Map();
  private mqttClient: any = null;
  private sensorSubscriptions: any[] = [];
  private environmentalData: EnvironmentalData | null = null;
  private gpsData: GPSCoordinates | null = null;

  // MQTT Configuration for IoT devices
  private mqttConfig = {
    host: 'mqtt.trace-herb.com',
    port: 1883,
    protocol: 'mqtt',
    username: 'trace-herb-farmer',
    password: 'secure-password-123',
    clientId: `farmer-app-${Date.now()}`,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000
  };

  // Known IoT device configurations
  private deviceConfigurations = {
    'TH-ENV-001': {
      name: 'TRACE HERB Environmental Sensor',
      type: 'bluetooth' as const,
      services: ['environmental-data'],
      characteristics: {
        temperature: '2A6E',
        humidity: '2A6F',
        pressure: '2A6D'
      }
    },
    'TH-SOIL-001': {
      name: 'TRACE HERB Soil Sensor',
      type: 'ble' as const,
      services: ['soil-data'],
      characteristics: {
        ph: '2A70',
        moisture: '2A71',
        nutrients: '2A72'
      }
    },
    'TH-GPS-001': {
      name: 'TRACE HERB GPS Tracker',
      type: 'bluetooth' as const,
      services: ['location-data'],
      characteristics: {
        coordinates: '2A73',
        accuracy: '2A74'
      }
    }
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize IoT service and all sensors
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing IoT Service...');

      // Request permissions
      await this.requestPermissions();

      // Initialize Bluetooth
      await this.initializeBluetooth();

      // Initialize BLE
      await this.initializeBLE();

      // Initialize MQTT
      await this.initializeMQTT();

      // Initialize device sensors
      await this.initializeDeviceSensors();

      // Start GPS tracking
      await this.startGPSTracking();

      this.isInitialized = true;
      console.log('✅ IoT Service initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize IoT Service:', error);
      throw error;
    }
  }

  /**
   * Request necessary permissions for IoT functionality
   */
  private async requestPermissions(): Promise<void> {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      for (const [permission, result] of Object.entries(granted)) {
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn(`Permission ${permission} not granted`);
        }
      }
    }
  }

  /**
   * Initialize Bluetooth Classic for legacy sensors
   */
  private async initializeBluetooth(): Promise<void> {
    try {
      const isEnabled = await BluetoothSerial.isEnabled();
      if (!isEnabled) {
        await BluetoothSerial.enable();
      }

      // Set up event listeners
      BluetoothSerial.on('bluetoothEnabled', () => {
        console.log('📶 Bluetooth enabled');
      });

      BluetoothSerial.on('bluetoothDisabled', () => {
        console.log('📵 Bluetooth disabled');
      });

      BluetoothSerial.on('connectionSuccess', (device: any) => {
        console.log('🔗 Bluetooth device connected:', device.name);
        this.connectedDevices.set(device.id, {
          id: device.id,
          name: device.name,
          type: 'bluetooth',
          status: 'connected',
          lastReading: new Date()
        });
      });

      BluetoothSerial.on('connectionFailed', (error: any) => {
        console.error('❌ Bluetooth connection failed:', error);
      });

    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
    }
  }

  /**
   * Initialize Bluetooth Low Energy for modern sensors
   */
  private async initializeBLE(): Promise<void> {
    try {
      await BleManager.start({ showAlert: false });

      // Set up event listeners
      BleManager.addListener('BleManagerDidUpdateValueForCharacteristic', (data) => {
        this.handleBLEData(data);
      });

      BleManager.addListener('BleManagerConnectPeripheral', (peripheral) => {
        console.log('🔗 BLE device connected:', peripheral.name);
        this.connectedDevices.set(peripheral.id, {
          id: peripheral.id,
          name: peripheral.name || 'Unknown BLE Device',
          type: 'ble',
          status: 'connected',
          lastReading: new Date()
        });
      });

      BleManager.addListener('BleManagerDisconnectPeripheral', (peripheral) => {
        console.log('🔌 BLE device disconnected:', peripheral.name);
        const device = this.connectedDevices.get(peripheral.id);
        if (device) {
          device.status = 'disconnected';
        }
      });

    } catch (error) {
      console.error('Error initializing BLE:', error);
    }
  }

  /**
   * Initialize MQTT for IoT device communication
   */
  private async initializeMQTT(): Promise<void> {
    try {
      this.mqttClient = new MQTT.Client(this.mqttConfig);

      this.mqttClient.on('connect', () => {
        console.log('🌐 MQTT connected');
        
        // Subscribe to sensor data topics
        this.mqttClient.subscribe('trace-herb/sensors/+/data');
        this.mqttClient.subscribe('trace-herb/sensors/+/status');
        this.mqttClient.subscribe('trace-herb/gps/+/location');
      });

      this.mqttClient.on('message', (topic: string, message: Buffer) => {
        this.handleMQTTMessage(topic, message);
      });

      this.mqttClient.on('error', (error: any) => {
        console.error('❌ MQTT error:', error);
      });

      await this.mqttClient.connect();

    } catch (error) {
      console.error('Error initializing MQTT:', error);
    }
  }

  /**
   * Initialize device built-in sensors
   */
  private async initializeDeviceSensors(): Promise<void> {
    try {
      // Accelerometer for device orientation and movement
      const accelerometerSubscription = accelerometer.subscribe(({ x, y, z }) => {
        // Use for detecting device stability during measurements
        this.handleAccelerometerData({ x, y, z });
      });

      // Gyroscope for rotation detection
      const gyroscopeSubscription = gyroscope.subscribe(({ x, y, z }) => {
        // Use for detecting device rotation during GPS readings
        this.handleGyroscopeData({ x, y, z });
      });

      // Magnetometer for compass heading
      const magnetometerSubscription = magnetometer.subscribe(({ x, y, z }) => {
        // Use for determining device heading
        this.handleMagnetometerData({ x, y, z });
      });

      this.sensorSubscriptions.push(
        accelerometerSubscription,
        gyroscopeSubscription,
        magnetometerSubscription
      );

    } catch (error) {
      console.error('Error initializing device sensors:', error);
    }
  }

  /**
   * Start GPS tracking with high accuracy
   */
  async startGPSTracking(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.gpsWatchId = Geolocation.watchPosition(
        (position) => {
          const gpsData: GPSCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || 0,
            heading: position.coords.heading || 0,
            speed: position.coords.speed || 0,
            timestamp: new Date().toISOString()
          };

          this.gpsData = gpsData;
          console.log('📍 GPS updated:', gpsData);
          resolve();
        },
        (error) => {
          console.error('❌ GPS error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 1, // Update every 1 meter
          interval: 5000, // Update every 5 seconds
          fastestInterval: 2000,
          forceRequestLocation: true,
          showLocationDialog: true,
          useSignificantChanges: false
        }
      );
    });
  }

  /**
   * Start environmental monitoring from connected sensors
   */
  async startEnvironmentalMonitoring(): Promise<EnvironmentalData | null> {
    try {
      console.log('🌡️ Starting environmental monitoring...');

      // Scan for available devices
      await this.scanForDevices();

      // Connect to known environmental sensors
      await this.connectToEnvironmentalSensors();

      // Start data collection
      const environmentalData = await this.collectEnvironmentalData();

      this.environmentalData = environmentalData;
      return environmentalData;

    } catch (error) {
      console.error('Error starting environmental monitoring:', error);
      return null;
    }
  }

  /**
   * Scan for available IoT devices
   */
  private async scanForDevices(): Promise<void> {
    try {
      // Scan for Bluetooth devices
      const bluetoothDevices = await BluetoothSerial.list();
      console.log('📡 Found Bluetooth devices:', bluetoothDevices.length);

      // Scan for BLE devices
      await BleManager.scan([], 10, true);
      const bleDevices = await BleManager.getDiscoveredPeripherals();
      console.log('📡 Found BLE devices:', bleDevices.length);

      // Filter for known TRACE HERB devices
      const knownDevices = [...bluetoothDevices, ...bleDevices].filter(device => 
        device.name && device.name.includes('TRACE HERB')
      );

      console.log('🔍 Found TRACE HERB devices:', knownDevices.length);

    } catch (error) {
      console.error('Error scanning for devices:', error);
    }
  }

  /**
   * Connect to environmental sensors
   */
  private async connectToEnvironmentalSensors(): Promise<void> {
    try {
      // Connect to Bluetooth environmental sensors
      const bluetoothDevices = await BluetoothSerial.list();
      for (const device of bluetoothDevices) {
        if (device.name && device.name.includes('TH-ENV')) {
          await BluetoothSerial.connect(device.id);
          console.log('🔗 Connected to environmental sensor:', device.name);
        }
      }

      // Connect to BLE soil sensors
      const bleDevices = await BleManager.getDiscoveredPeripherals();
      for (const device of bleDevices) {
        if (device.name && device.name.includes('TH-SOIL')) {
          await BleManager.connect(device.id);
          console.log('🔗 Connected to soil sensor:', device.name);
        }
      }

    } catch (error) {
      console.error('Error connecting to sensors:', error);
    }
  }

  /**
   * Collect environmental data from all connected sensors
   */
  private async collectEnvironmentalData(): Promise<EnvironmentalData> {
    // Default/simulated values - in production, these would come from actual sensors
    const environmentalData: EnvironmentalData = {
      temperature: 25.5 + (Math.random() - 0.5) * 10, // °C
      humidity: 65 + (Math.random() - 0.5) * 20, // %
      soilPH: 6.8 + (Math.random() - 0.5) * 1.0, // pH
      lightIntensity: 45000 + (Math.random() - 0.5) * 20000, // lux
      airQuality: 85 + (Math.random() - 0.5) * 30, // AQI
      soilMoisture: 40 + (Math.random() - 0.5) * 20, // %
      windSpeed: 5.2 + (Math.random() - 0.5) * 4, // m/s
      windDirection: Math.random() * 360, // degrees
      barometricPressure: 1013.25 + (Math.random() - 0.5) * 50, // hPa
      uvIndex: 6 + (Math.random() - 0.5) * 4 // UV Index
    };

    // In production, collect real data from connected sensors
    for (const [deviceId, device] of this.connectedDevices.entries()) {
      if (device.status === 'connected') {
        try {
          const sensorData = await this.readSensorData(deviceId, device.type);
          if (sensorData) {
            Object.assign(environmentalData, sensorData);
          }
        } catch (error) {
          console.error(`Error reading from device ${deviceId}:`, error);
        }
      }
    }

    return environmentalData;
  }

  /**
   * Read data from specific sensor device
   */
  private async readSensorData(deviceId: string, deviceType: string): Promise<Partial<EnvironmentalData> | null> {
    try {
      switch (deviceType) {
        case 'bluetooth':
          return await this.readBluetoothSensorData(deviceId);
        case 'ble':
          return await this.readBLESensorData(deviceId);
        case 'mqtt':
          return await this.readMQTTSensorData(deviceId);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error reading sensor data from ${deviceId}:`, error);
      return null;
    }
  }

  /**
   * Read data from Bluetooth sensor
   */
  private async readBluetoothSensorData(deviceId: string): Promise<Partial<EnvironmentalData> | null> {
    try {
      const data = await BluetoothSerial.read();
      if (data) {
        // Parse sensor data based on device protocol
        return this.parseSensorData(data);
      }
      return null;
    } catch (error) {
      console.error('Error reading Bluetooth sensor data:', error);
      return null;
    }
  }

  /**
   * Read data from BLE sensor
   */
  private async readBLESensorData(deviceId: string): Promise<Partial<EnvironmentalData> | null> {
    try {
      // Read from specific BLE characteristics
      const config = this.deviceConfigurations[deviceId];
      if (config && config.characteristics) {
        const sensorData: Partial<EnvironmentalData> = {};
        
        // Read temperature if available
        if (config.characteristics.temperature) {
          const tempData = await BleManager.read(deviceId, 'environmental-service', config.characteristics.temperature);
          sensorData.temperature = this.parseTemperatureData(tempData);
        }
        
        // Read humidity if available
        if (config.characteristics.humidity) {
          const humidityData = await BleManager.read(deviceId, 'environmental-service', config.characteristics.humidity);
          sensorData.humidity = this.parseHumidityData(humidityData);
        }
        
        return sensorData;
      }
      return null;
    } catch (error) {
      console.error('Error reading BLE sensor data:', error);
      return null;
    }
  }

  /**
   * Read data from MQTT sensor
   */
  private async readMQTTSensorData(deviceId: string): Promise<Partial<EnvironmentalData> | null> {
    // MQTT data is received via message handlers
    // Return cached data for this device
    const cachedData = await AsyncStorage.getItem(`mqtt-sensor-${deviceId}`);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  /**
   * Handle BLE characteristic data
   */
  private handleBLEData(data: any): void {
    console.log('📊 BLE data received:', data);
    // Process and store BLE sensor data
  }

  /**
   * Handle MQTT messages
   */
  private handleMQTTMessage(topic: string, message: Buffer): void {
    try {
      const data = JSON.parse(message.toString());
      console.log('📨 MQTT message received:', topic, data);
      
      // Store sensor data based on topic
      if (topic.includes('/sensors/')) {
        const deviceId = topic.split('/')[2];
        AsyncStorage.setItem(`mqtt-sensor-${deviceId}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error handling MQTT message:', error);
    }
  }

  /**
   * Handle accelerometer data
   */
  private handleAccelerometerData(data: { x: number; y: number; z: number }): void {
    // Use for device stability detection during measurements
    const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
    const isStable = magnitude < 10.5; // Device is relatively stable
    
    if (!isStable) {
      console.log('⚠️ Device movement detected - measurements may be less accurate');
    }
  }

  /**
   * Handle gyroscope data
   */
  private handleGyroscopeData(data: { x: number; y: number; z: number }): void {
    // Use for rotation detection
  }

  /**
   * Handle magnetometer data
   */
  private handleMagnetometerData(data: { x: number; y: number; z: number }): void {
    // Use for compass heading calculation
  }

  /**
   * Parse generic sensor data
   */
  private parseSensorData(data: string): Partial<EnvironmentalData> {
    try {
      // Parse JSON sensor data
      return JSON.parse(data);
    } catch (error) {
      // Parse CSV or other formats
      console.error('Error parsing sensor data:', error);
      return {};
    }
  }

  /**
   * Parse temperature data from BLE characteristic
   */
  private parseTemperatureData(data: number[]): number {
    // Convert byte array to temperature value
    return (data[0] + (data[1] << 8)) / 100.0;
  }

  /**
   * Parse humidity data from BLE characteristic
   */
  private parseHumidityData(data: number[]): number {
    // Convert byte array to humidity value
    return (data[0] + (data[1] << 8)) / 100.0;
  }

  /**
   * Get current GPS coordinates
   */
  getCurrentGPS(): GPSCoordinates | null {
    return this.gpsData;
  }

  /**
   * Get current environmental data
   */
  getCurrentEnvironmentalData(): EnvironmentalData | null {
    return this.environmentalData;
  }

  /**
   * Get connected devices
   */
  getConnectedDevices(): SensorDevice[] {
    return Array.from(this.connectedDevices.values());
  }

  /**
   * Stop environmental monitoring
   */
  stopEnvironmentalMonitoring(): void {
    // Stop GPS tracking
    if (this.gpsWatchId !== null) {
      Geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }

    // Unsubscribe from device sensors
    this.sensorSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.sensorSubscriptions = [];

    // Disconnect from devices
    this.connectedDevices.forEach(async (device, deviceId) => {
      try {
        if (device.type === 'bluetooth') {
          await BluetoothSerial.disconnect();
        } else if (device.type === 'ble') {
          await BleManager.disconnect(deviceId);
        }
      } catch (error) {
        console.error(`Error disconnecting from device ${deviceId}:`, error);
      }
    });

    // Disconnect MQTT
    if (this.mqttClient) {
      this.mqttClient.end();
    }

    console.log('🛑 Environmental monitoring stopped');
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopEnvironmentalMonitoring();
    this.connectedDevices.clear();
    this.environmentalData = null;
    this.gpsData = null;
    this.isInitialized = false;
  }
}

export default IoTService;
