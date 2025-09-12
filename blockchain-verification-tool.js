/**
 * TRACE HERB Blockchain Verification Tool
 * This tool helps verify if the system is actually running on blockchain
 */

// Use built-in modules instead of axios for better compatibility
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

class BlockchainVerificationTool {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3000/api';
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  /**
   * Run all blockchain verification tests
   */
  async runAllTests() {
    console.log('🔍 TRACE HERB Blockchain Verification Tool');
    console.log('==========================================\n');

    try {
      // Test 1: Check if backend API is running
      await this.testBackendConnection();

      // Test 2: Check blockchain service status
      await this.testBlockchainStatus();

      // Test 3: Test transaction submission
      await this.testTransactionSubmission();

      // Test 4: Test data retrieval
      await this.testDataRetrieval();

      // Test 5: Check for Hyperledger Fabric components
      await this.testHyperledgerComponents();

      // Test 6: Verify blockchain network configuration
      await this.testNetworkConfiguration();

      // Test 7: Check transaction logs
      await this.testTransactionLogs();

      // Generate final report
      this.generateReport();

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      this.addTest('Overall Verification', false, error.message);
    }
  }

  /**
   * Test backend API connection
   */
  async testBackendConnection() {
    console.log('🔗 Testing Backend API Connection...');
    
    try {
      const response = await axios.get(`${this.apiBaseUrl}/health`, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log('✅ Backend API is running');
        this.addTest('Backend API Connection', true, `API responding on port 3000`);
      } else {
        console.log('⚠️ Backend API returned unexpected status');
        this.addTest('Backend API Connection', false, `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Backend API is not accessible');
      this.addTest('Backend API Connection', false, `API not accessible: ${error.message}`);
    }
  }

  /**
   * Test blockchain service status
   */
  async testBlockchainStatus() {
    console.log('⛓️ Testing Blockchain Service Status...');
    
    try {
      const response = await axios.get(`${this.apiBaseUrl}/blockchain/status`, { timeout: 10000 });
      
      if (response.data && response.data.connected) {
        const status = response.data;
        
        if (status.mode === 'blockchain') {
          console.log('✅ Real blockchain network detected');
          console.log(`   Network: ${status.networkName}`);
          console.log(`   Channel: ${status.channelName}`);
          console.log(`   Peers: ${status.peersConnected}`);
          console.log(`   Status: ${status.status}`);
          
          this.addTest('Blockchain Network', true, 
            `Connected to real Hyperledger Fabric network with ${status.peersConnected} peers`);
            
        } else if (status.mode === 'demo') {
          console.log('⚠️ Demo mode detected - not using real blockchain');
          console.log(`   Block Height: ${status.blockHeight}`);
          console.log(`   Transactions: ${status.transactionCount}`);
          
          this.addTest('Blockchain Network', false, 
            'System is running in demo mode, not connected to real blockchain', 'warning');
            
        } else {
          console.log('❌ Unknown blockchain mode');
          this.addTest('Blockchain Network', false, `Unknown mode: ${status.mode}`);
        }
      } else {
        console.log('❌ Blockchain service not connected');
        this.addTest('Blockchain Network', false, 'Blockchain service not connected');
      }
    } catch (error) {
      console.log('❌ Cannot check blockchain status');
      this.addTest('Blockchain Network', false, `Cannot check status: ${error.message}`);
    }
  }

  /**
   * Test transaction submission
   */
  async testTransactionSubmission() {
    console.log('📤 Testing Transaction Submission...');
    
    try {
      const testData = {
        id: `TEST_${Date.now()}`,
        qrCode: `QR_TEST_${Date.now()}`,
        resourceType: 'CollectionEvent',
        timestamp: new Date().toISOString(),
        collector: {
          name: 'Test Farmer',
          phone: '+91 9876543210',
          village: 'Test Village'
        },
        herb: {
          ayurvedicName: 'Test Herb',
          botanicalName: 'Testus herbicus',
          partUsed: 'leaves'
        },
        location: {
          latitude: 28.6139,
          longitude: 77.2090
        },
        status: 'collected'
      };

      const response = await axios.post(`${this.apiBaseUrl}/collection-events`, testData, { timeout: 10000 });
      
      if (response.data && response.data.success) {
        console.log('✅ Transaction submitted successfully');
        console.log(`   Transaction ID: ${response.data.transactionId || 'N/A'}`);
        console.log(`   Block Number: ${response.data.blockNumber || 'N/A'}`);
        
        this.addTest('Transaction Submission', true, 
          `Transaction submitted with ID: ${response.data.transactionId || 'demo-mode'}`);
          
        // Store test transaction ID for retrieval test
        this.testTransactionId = response.data.transactionId;
        this.testQrCode = testData.qrCode;
        
      } else {
        console.log('❌ Transaction submission failed');
        this.addTest('Transaction Submission', false, 'Transaction submission returned no success flag');
      }
    } catch (error) {
      console.log('❌ Transaction submission error');
      this.addTest('Transaction Submission', false, `Submission error: ${error.message}`);
    }
  }

  /**
   * Test data retrieval from blockchain
   */
  async testDataRetrieval() {
    console.log('📥 Testing Data Retrieval...');
    
    if (!this.testQrCode) {
      console.log('⚠️ Skipping data retrieval test - no test QR code available');
      this.addTest('Data Retrieval', false, 'No test data to retrieve', 'warning');
      return;
    }

    try {
      const response = await axios.get(`${this.apiBaseUrl}/provenance/${this.testQrCode}`, { timeout: 10000 });
      
      if (response.data && response.data.success) {
        console.log('✅ Data retrieved successfully from blockchain');
        console.log(`   QR Code: ${this.testQrCode}`);
        console.log(`   Data found: ${response.data.data ? 'Yes' : 'No'}`);
        
        this.addTest('Data Retrieval', true, 'Successfully retrieved data from blockchain');
      } else {
        console.log('❌ Data retrieval failed');
        this.addTest('Data Retrieval', false, 'Could not retrieve test data');
      }
    } catch (error) {
      console.log('❌ Data retrieval error');
      this.addTest('Data Retrieval', false, `Retrieval error: ${error.message}`);
    }
  }

  /**
   * Check for Hyperledger Fabric components
   */
  async testHyperledgerComponents() {
    console.log('🏗️ Checking Hyperledger Fabric Components...');
    
    const fabricPaths = [
      'blockchain/organizations',
      'blockchain/channel-artifacts',
      'blockchain/chaincode',
      'wallet'
    ];

    let foundComponents = 0;
    
    for (const fabricPath of fabricPaths) {
      if (fs.existsSync(fabricPath)) {
        console.log(`✅ Found: ${fabricPath}`);
        foundComponents++;
      } else {
        console.log(`❌ Missing: ${fabricPath}`);
      }
    }

    if (foundComponents === fabricPaths.length) {
      this.addTest('Hyperledger Components', true, 'All Hyperledger Fabric components found');
    } else if (foundComponents > 0) {
      this.addTest('Hyperledger Components', false, 
        `Only ${foundComponents}/${fabricPaths.length} components found`, 'warning');
    } else {
      this.addTest('Hyperledger Components', false, 'No Hyperledger Fabric components found');
    }
  }

  /**
   * Test network configuration
   */
  async testNetworkConfiguration() {
    console.log('🌐 Testing Network Configuration...');
    
    const configPaths = [
      'blockchain/organizations/peerOrganizations/farmers.trace-herb.com/connection-farmers.json',
      'blockchain/organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com'
    ];

    let validConfigs = 0;
    
    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        console.log(`✅ Found config: ${path.basename(configPath)}`);
        validConfigs++;
      } else {
        console.log(`❌ Missing config: ${path.basename(configPath)}`);
      }
    }

    if (validConfigs > 0) {
      this.addTest('Network Configuration', true, `Found ${validConfigs} network configuration files`);
    } else {
      this.addTest('Network Configuration', false, 'No network configuration files found');
    }
  }

  /**
   * Check transaction logs
   */
  async testTransactionLogs() {
    console.log('📋 Checking Transaction Logs...');
    
    const logPaths = [
      'backend/logs/combined.log',
      'backend/logs/error.log'
    ];

    let foundLogs = false;
    
    for (const logPath of logPaths) {
      if (fs.existsSync(logPath)) {
        const logContent = fs.readFileSync(logPath, 'utf8');
        
        if (logContent.includes('blockchain') || logContent.includes('transaction')) {
          console.log(`✅ Found blockchain activity in ${path.basename(logPath)}`);
          foundLogs = true;
        }
      }
    }

    if (foundLogs) {
      this.addTest('Transaction Logs', true, 'Found blockchain transaction logs');
    } else {
      this.addTest('Transaction Logs', false, 'No blockchain transaction logs found', 'warning');
    }
  }

  /**
   * Add test result
   */
  addTest(name, passed, message, type = 'normal') {
    this.results.tests.push({
      name,
      passed,
      message,
      type,
      timestamp: new Date().toISOString()
    });

    this.results.summary.totalTests++;
    if (passed) {
      this.results.summary.passed++;
    } else if (type === 'warning') {
      this.results.summary.warnings++;
    } else {
      this.results.summary.failed++;
    }
  }

  /**
   * Generate final report
   */
  generateReport() {
    console.log('\n📊 BLOCKCHAIN VERIFICATION REPORT');
    console.log('==================================');
    console.log(`Total Tests: ${this.results.summary.totalTests}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️ Warnings: ${this.results.summary.warnings}`);
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log('--------------------');
    
    this.results.tests.forEach((test, index) => {
      const icon = test.passed ? '✅' : (test.type === 'warning' ? '⚠️' : '❌');
      console.log(`${index + 1}. ${icon} ${test.name}`);
      console.log(`   ${test.message}`);
    });

    // Determine overall blockchain status
    const realBlockchainTest = this.results.tests.find(t => t.name === 'Blockchain Network');
    
    console.log('\n🎯 FINAL VERDICT:');
    console.log('=================');
    
    if (realBlockchainTest && realBlockchainTest.passed) {
      console.log('✅ SYSTEM IS RUNNING ON REAL BLOCKCHAIN');
      console.log('   Your TRACE HERB system is connected to Hyperledger Fabric');
    } else if (realBlockchainTest && realBlockchainTest.type === 'warning') {
      console.log('⚠️ SYSTEM IS RUNNING IN DEMO MODE');
      console.log('   Your system is working but not connected to real blockchain');
      console.log('   To connect to real blockchain, set up Hyperledger Fabric network');
    } else {
      console.log('❌ BLOCKCHAIN CONNECTION ISSUES');
      console.log('   Your system may not be properly connected to blockchain');
    }

    // Save report to file
    fs.writeFileSync('blockchain-verification-report.json', JSON.stringify(this.results, null, 2));
    console.log('\n📄 Report saved to: blockchain-verification-report.json');
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new BlockchainVerificationTool();
  verifier.runAllTests().catch(console.error);
}

module.exports = BlockchainVerificationTool;
