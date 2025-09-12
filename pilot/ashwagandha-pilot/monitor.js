#!/usr/bin/env node

/**
 * Ashwagandha Pilot Monitoring System
 * Real-time monitoring and automated testing for the pilot program
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const WebSocket = require('ws');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

class PilotMonitor {
  constructor() {
    this.config = this.loadPilotConfig();
    this.metrics = {
      collections: 0,
      qualityTests: 0,
      qrScans: 0,
      activeUsers: 0,
      transactionLatency: [],
      errorCount: 0,
      lastUpdate: new Date()
    };
    this.testResults = [];
    this.alerts = [];
    this.isRunning = false;
    
    // API endpoints
    this.endpoints = {
      blockchain: 'http://localhost:3001/api/blockchain',
      mobile: 'http://localhost:3002/api/mobile',
      consumer: 'http://localhost:3003/api/consumer',
      dashboard: 'http://localhost:3004/api/dashboard'
    };
    
    // WebSocket connections
    this.wsConnections = new Map();
  }

  /**
   * Load pilot configuration
   */
  loadPilotConfig() {
    try {
      const configPath = path.join(__dirname, 'pilot-config.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to load pilot configuration:', error);
      process.exit(1);
    }
  }

  /**
   * Start pilot monitoring
   */
  async start() {
    try {
      console.log('🚀 Starting Ashwagandha Pilot Monitoring System...');
      console.log(`📋 Pilot: ${this.config.pilotName}`);
      console.log(`📅 Duration: ${this.config.startDate} to ${this.config.endDate}`);
      console.log(`👥 Participants: ${this.config.participants.farmers.count} farmers, ${this.config.participants.processors.count} processors`);
      
      this.isRunning = true;
      
      // Initialize monitoring components
      await this.initializeMonitoring();
      
      // Start automated testing
      await this.startAutomatedTesting();
      
      // Setup scheduled tasks
      this.setupScheduledTasks();
      
      // Start real-time monitoring
      this.startRealtimeMonitoring();
      
      console.log('✅ Pilot monitoring system started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start pilot monitoring:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize monitoring components
   */
  async initializeMonitoring() {
    console.log('🔧 Initializing monitoring components...');
    
    // Check system health
    await this.checkSystemHealth();
    
    // Initialize WebSocket connections
    await this.initializeWebSockets();
    
    // Load existing metrics
    await this.loadMetrics();
    
    console.log('✅ Monitoring components initialized');
  }

  /**
   * Check system health
   */
  async checkSystemHealth() {
    const healthChecks = [];
    
    for (const [service, endpoint] of Object.entries(this.endpoints)) {
      healthChecks.push(
        this.checkServiceHealth(service, `${endpoint}/health`)
      );
    }
    
    const results = await Promise.allSettled(healthChecks);
    
    results.forEach((result, index) => {
      const service = Object.keys(this.endpoints)[index];
      if (result.status === 'fulfilled' && result.value) {
        console.log(`✅ ${service} service: healthy`);
      } else {
        console.log(`❌ ${service} service: unhealthy`);
        this.addAlert('critical', `${service} service is not responding`);
      }
    });
  }

  /**
   * Check individual service health
   */
  async checkServiceHealth(serviceName, healthEndpoint) {
    try {
      const response = await axios.get(healthEndpoint, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error(`Health check failed for ${serviceName}:`, error.message);
      return false;
    }
  }

  /**
   * Initialize WebSocket connections
   */
  async initializeWebSockets() {
    try {
      // Connect to dashboard WebSocket
      const dashboardWs = new WebSocket('ws://localhost:3004/ws/pilot');
      dashboardWs.on('open', () => {
        console.log('📡 Connected to dashboard WebSocket');
        this.wsConnections.set('dashboard', dashboardWs);
      });
      
      dashboardWs.on('message', (data) => {
        this.handleWebSocketMessage('dashboard', data);
      });
      
      dashboardWs.on('error', (error) => {
        console.error('Dashboard WebSocket error:', error);
      });
      
    } catch (error) {
      console.error('Failed to initialize WebSocket connections:', error);
    }
  }

  /**
   * Handle WebSocket messages
   */
  handleWebSocketMessage(source, data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'new_collection':
          this.metrics.collections++;
          this.updateMetrics();
          break;
        case 'quality_test_completed':
          this.metrics.qualityTests++;
          this.updateMetrics();
          break;
        case 'qr_scan':
          this.metrics.qrScans++;
          this.updateMetrics();
          break;
        case 'user_activity':
          this.metrics.activeUsers = message.activeUsers;
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  /**
   * Start automated testing
   */
  async startAutomatedTesting() {
    console.log('🧪 Starting automated testing scenarios...');
    
    for (const scenario of this.config.testingScenarios) {
      console.log(`📝 Scheduling test scenario: ${scenario.name}`);
      
      // Schedule scenario execution
      setTimeout(() => {
        this.executeTestScenario(scenario);
      }, Math.random() * 60000); // Random delay up to 1 minute
    }
  }

  /**
   * Execute test scenario
   */
  async executeTestScenario(scenario) {
    console.log(`🎯 Executing test scenario: ${scenario.name}`);
    
    const testResult = {
      id: uuidv4(),
      scenarioId: scenario.id,
      name: scenario.name,
      startTime: new Date(),
      endTime: null,
      status: 'running',
      steps: [],
      errors: [],
      metrics: {}
    };
    
    try {
      for (let i = 0; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];
        console.log(`  📋 Step ${i + 1}: ${step}`);
        
        const stepResult = await this.executeTestStep(step, scenario);
        testResult.steps.push(stepResult);
        
        if (!stepResult.success) {
          testResult.errors.push(`Step ${i + 1} failed: ${stepResult.error}`);
        }
        
        // Wait between steps
        await this.sleep(2000);
      }
      
      testResult.status = testResult.errors.length === 0 ? 'passed' : 'failed';
      testResult.endTime = new Date();
      
      console.log(`✅ Test scenario completed: ${scenario.name} - ${testResult.status}`);
      
    } catch (error) {
      testResult.status = 'error';
      testResult.endTime = new Date();
      testResult.errors.push(error.message);
      
      console.error(`❌ Test scenario failed: ${scenario.name}`, error);
    }
    
    this.testResults.push(testResult);
    this.saveTestResults();
  }

  /**
   * Execute individual test step
   */
  async executeTestStep(step, scenario) {
    const stepResult = {
      description: step,
      startTime: new Date(),
      endTime: null,
      success: false,
      error: null,
      metrics: {}
    };
    
    try {
      // Simulate different test steps
      if (step.includes('Farmer collects')) {
        await this.simulateCollection();
        stepResult.success = true;
      } else if (step.includes('Quality testing')) {
        await this.simulateQualityTest();
        stepResult.success = true;
      } else if (step.includes('Consumer scans')) {
        await this.simulateQRScan();
        stepResult.success = true;
      } else if (step.includes('GPS coordinates')) {
        await this.simulateGPSCapture();
        stepResult.success = true;
      } else {
        // Generic step simulation
        await this.sleep(1000);
        stepResult.success = true;
      }
      
      stepResult.endTime = new Date();
      
    } catch (error) {
      stepResult.success = false;
      stepResult.error = error.message;
      stepResult.endTime = new Date();
    }
    
    return stepResult;
  }

  /**
   * Simulate collection event
   */
  async simulateCollection() {
    const farmer = this.getRandomFarmer();
    const collectionData = {
      farmerId: farmer.farmerId,
      botanicalName: 'Withania somnifera',
      quantity: Math.floor(Math.random() * 50) + 10, // 10-60 kg
      location: {
        latitude: farmer.location.latitude + (Math.random() - 0.5) * 0.01,
        longitude: farmer.location.longitude + (Math.random() - 0.5) * 0.01
      },
      timestamp: new Date().toISOString()
    };
    
    const response = await axios.post(`${this.endpoints.mobile}/collection`, collectionData);
    
    if (response.status === 200) {
      this.metrics.collections++;
      console.log(`  ✅ Collection simulated for farmer ${farmer.farmerId}`);
    } else {
      throw new Error(`Collection simulation failed: ${response.status}`);
    }
  }

  /**
   * Simulate quality test
   */
  async simulateQualityTest() {
    const testData = {
      batchId: `BATCH_${Date.now()}`,
      withanolides: 2.5 + Math.random() * 2.5, // 2.5-5.0%
      moisture: Math.random() * 10, // 0-10%
      heavyMetals: Math.random() * 0.005, // 0-0.005 ppm
      testDate: new Date().toISOString()
    };
    
    const response = await axios.post(`${this.endpoints.blockchain}/quality-test`, testData);
    
    if (response.status === 200) {
      this.metrics.qualityTests++;
      console.log(`  ✅ Quality test simulated for batch ${testData.batchId}`);
    } else {
      throw new Error(`Quality test simulation failed: ${response.status}`);
    }
  }

  /**
   * Simulate QR code scan
   */
  async simulateQRScan() {
    const qrCode = `QR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const response = await axios.get(`${this.endpoints.consumer}/provenance/${qrCode}`);
    
    if (response.status === 200) {
      this.metrics.qrScans++;
      console.log(`  ✅ QR scan simulated for code ${qrCode}`);
    } else {
      throw new Error(`QR scan simulation failed: ${response.status}`);
    }
  }

  /**
   * Simulate GPS capture
   */
  async simulateGPSCapture() {
    const farmer = this.getRandomFarmer();
    const gpsData = {
      latitude: farmer.location.latitude,
      longitude: farmer.location.longitude,
      accuracy: Math.random() * 5 + 1, // 1-6 meters
      timestamp: new Date().toISOString()
    };
    
    // Simulate GPS validation
    const isInApprovedZone = this.validateGeoFencing(gpsData.latitude, gpsData.longitude);
    
    if (isInApprovedZone) {
      console.log(`  ✅ GPS capture simulated - location approved`);
    } else {
      throw new Error('GPS location outside approved zone');
    }
  }

  /**
   * Get random farmer for simulation
   */
  getRandomFarmer() {
    const farmers = this.config.participants.farmers.locations;
    return farmers[Math.floor(Math.random() * farmers.length)];
  }

  /**
   * Validate geo-fencing
   */
  validateGeoFencing(latitude, longitude) {
    // Simple validation - in production this would use proper geo-fencing algorithms
    const farmer = this.getRandomFarmer();
    const distance = this.calculateDistance(
      latitude, longitude,
      farmer.location.latitude, farmer.location.longitude
    );
    
    return distance < 10; // Within 10km of farmer location
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Setup scheduled tasks
   */
  setupScheduledTasks() {
    console.log('⏰ Setting up scheduled monitoring tasks...');
    
    // Daily metrics collection (every day at 00:00)
    cron.schedule('0 0 * * *', () => {
      this.generateDailyReport();
    });
    
    // Weekly report (every Sunday at 09:00)
    cron.schedule('0 9 * * 0', () => {
      this.generateWeeklyReport();
    });
    
    // Performance monitoring (every 5 minutes)
    cron.schedule('*/5 * * * *', () => {
      this.collectPerformanceMetrics();
    });
    
    // Health check (every minute)
    cron.schedule('* * * * *', () => {
      this.performHealthCheck();
    });
    
    console.log('✅ Scheduled tasks configured');
  }

  /**
   * Start real-time monitoring
   */
  startRealtimeMonitoring() {
    console.log('📊 Starting real-time monitoring...');
    
    setInterval(() => {
      this.updateMetrics();
      this.checkAlerts();
      this.broadcastMetrics();
    }, 10000); // Every 10 seconds
  }

  /**
   * Update metrics
   */
  updateMetrics() {
    this.metrics.lastUpdate = new Date();
    
    // Calculate progress against targets
    const progress = {
      collections: (this.metrics.collections / this.config.targetMetrics.collections.target) * 100,
      qualityTests: (this.metrics.qualityTests / this.config.targetMetrics.qualityTests.target) * 100,
      qrScans: (this.metrics.qrScans / this.config.targetMetrics.qrScans.target) * 100
    };
    
    console.log(`📈 Progress - Collections: ${progress.collections.toFixed(1)}%, Quality Tests: ${progress.qualityTests.toFixed(1)}%, QR Scans: ${progress.qrScans.toFixed(1)}%`);
  }

  /**
   * Check for alerts
   */
  checkAlerts() {
    // Check if error rate is too high
    if (this.metrics.errorCount > 10) {
      this.addAlert('warning', 'High error rate detected');
    }
    
    // Check if progress is behind schedule
    const daysSinceStart = Math.floor((new Date() - new Date(this.config.startDate)) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((new Date(this.config.endDate) - new Date(this.config.startDate)) / (1000 * 60 * 60 * 24));
    const expectedProgress = (daysSinceStart / totalDays) * 100;
    const actualProgress = (this.metrics.collections / this.config.targetMetrics.collections.target) * 100;
    
    if (actualProgress < expectedProgress - 20) {
      this.addAlert('warning', 'Pilot progress is behind schedule');
    }
  }

  /**
   * Add alert
   */
  addAlert(severity, message) {
    const alert = {
      id: uuidv4(),
      severity,
      message,
      timestamp: new Date(),
      acknowledged: false
    };
    
    this.alerts.push(alert);
    console.log(`🚨 ${severity.toUpperCase()}: ${message}`);
  }

  /**
   * Broadcast metrics via WebSocket
   */
  broadcastMetrics() {
    const dashboardWs = this.wsConnections.get('dashboard');
    if (dashboardWs && dashboardWs.readyState === WebSocket.OPEN) {
      dashboardWs.send(JSON.stringify({
        type: 'pilot_metrics',
        data: this.metrics,
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * Generate daily report
   */
  generateDailyReport() {
    console.log('📊 Generating daily report...');
    
    const report = {
      date: new Date().toISOString().split('T')[0],
      metrics: { ...this.metrics },
      testResults: this.testResults.filter(result => 
        new Date(result.startTime).toDateString() === new Date().toDateString()
      ),
      alerts: this.alerts.filter(alert => 
        new Date(alert.timestamp).toDateString() === new Date().toDateString()
      )
    };
    
    const reportPath = path.join(__dirname, 'reports', `daily-${report.date}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Daily report saved: ${reportPath}`);
  }

  /**
   * Generate weekly report
   */
  generateWeeklyReport() {
    console.log('📊 Generating weekly report...');
    // Implementation for weekly report generation
  }

  /**
   * Collect performance metrics
   */
  async collectPerformanceMetrics() {
    try {
      const startTime = Date.now();
      await axios.get(`${this.endpoints.blockchain}/health`);
      const latency = Date.now() - startTime;
      
      this.metrics.transactionLatency.push(latency);
      
      // Keep only last 100 measurements
      if (this.metrics.transactionLatency.length > 100) {
        this.metrics.transactionLatency.shift();
      }
      
    } catch (error) {
      this.metrics.errorCount++;
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    await this.checkSystemHealth();
  }

  /**
   * Load existing metrics
   */
  async loadMetrics() {
    try {
      const metricsPath = path.join(__dirname, 'pilot-metrics.json');
      if (fs.existsSync(metricsPath)) {
        const savedMetrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
        this.metrics = { ...this.metrics, ...savedMetrics };
        console.log('📊 Loaded existing metrics');
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }

  /**
   * Save test results
   */
  saveTestResults() {
    try {
      const resultsPath = path.join(__dirname, 'test-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(this.testResults, null, 2));
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stop monitoring
   */
  stop() {
    console.log('🛑 Stopping pilot monitoring...');
    this.isRunning = false;
    
    // Close WebSocket connections
    this.wsConnections.forEach((ws, name) => {
      ws.close();
      console.log(`📡 Closed ${name} WebSocket connection`);
    });
    
    // Save final metrics
    const metricsPath = path.join(__dirname, 'pilot-metrics.json');
    fs.writeFileSync(metricsPath, JSON.stringify(this.metrics, null, 2));
    
    console.log('✅ Pilot monitoring stopped');
  }
}

// Create and start monitor if run directly
if (require.main === module) {
  const monitor = new PilotMonitor();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    monitor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    monitor.stop();
    process.exit(0);
  });
  
  // Start monitoring
  monitor.start().catch(error => {
    console.error('❌ Failed to start pilot monitoring:', error);
    process.exit(1);
  });
}

module.exports = PilotMonitor;
