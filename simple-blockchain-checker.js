/**
 * Simple TRACE HERB Blockchain Status Checker
 * Uses only built-in Node.js modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

class SimpleBlockchainChecker {
  constructor() {
    this.apiBaseUrl = 'localhost';
    this.apiPort = 3000;
  }

  /**
   * Make HTTP request using built-in modules
   */
  makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.apiBaseUrl,
        port: this.apiPort,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      };

      const req = http.request(options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(body);
            resolve({
              status: res.statusCode,
              data: jsonData,
              success: res.statusCode >= 200 && res.statusCode < 300
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              data: body,
              success: res.statusCode >= 200 && res.statusCode < 300
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  /**
   * Check if backend API is running
   */
  async checkBackendAPI() {
    console.log('🔗 Checking Backend API...');
    
    try {
      const response = await this.makeRequest('/api/health');
      
      if (response.success) {
        console.log('✅ Backend API is running');
        return { success: true, message: 'Backend API is accessible' };
      } else {
        console.log('⚠️ Backend API returned error status:', response.status);
        return { success: false, message: `API returned status ${response.status}` };
      }
    } catch (error) {
      console.log('❌ Backend API is not accessible:', error.message);
      return { success: false, message: `API not accessible: ${error.message}` };
    }
  }

  /**
   * Check blockchain service status
   */
  async checkBlockchainStatus() {
    console.log('⛓️ Checking Blockchain Status...');
    
    try {
      const response = await this.makeRequest('/api/health/blockchain');
      
      if (response.success && response.data) {
        const status = response.data.data || response.data;
        
        console.log(`   Connected: ${status.connected}`);
        console.log(`   Mode: ${status.mode}`);
        console.log(`   Network: ${status.networkName}`);
        console.log(`   Channel: ${status.channelName}`);
        console.log(`   Peers: ${status.peersConnected}`);
        console.log(`   Status: ${status.status}`);
        
        if (status.mode === 'blockchain') {
          console.log('✅ Real blockchain network detected!');
          return { 
            success: true, 
            isRealBlockchain: true, 
            message: 'Connected to real Hyperledger Fabric network',
            details: status
          };
        } else if (status.mode === 'demo') {
          console.log('⚠️ Demo mode detected - not using real blockchain');
          return { 
            success: true, 
            isRealBlockchain: false, 
            message: 'Running in demo mode',
            details: status
          };
        } else {
          console.log('❓ Unknown blockchain mode');
          return { 
            success: false, 
            isRealBlockchain: false, 
            message: `Unknown mode: ${status.mode}`,
            details: status
          };
        }
      } else {
        console.log('❌ Blockchain service not responding properly');
        return { success: false, message: 'Blockchain service not responding' };
      }
    } catch (error) {
      console.log('❌ Cannot check blockchain status:', error.message);
      return { success: false, message: `Cannot check blockchain: ${error.message}` };
    }
  }

  /**
   * Test transaction submission
   */
  async testTransaction() {
    console.log('📤 Testing Transaction Submission...');
    
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

    try {
      const response = await this.makeRequest('/api/collection', 'POST', testData);
      
      if (response.success && response.data && response.data.success) {
        console.log('✅ Transaction submitted successfully');
        console.log(`   Transaction ID: ${response.data.transactionId || 'N/A'}`);
        console.log(`   Block Number: ${response.data.blockNumber || 'N/A'}`);
        
        return { 
          success: true, 
          message: 'Transaction submitted successfully',
          transactionId: response.data.transactionId,
          blockNumber: response.data.blockNumber
        };
      } else {
        console.log('❌ Transaction submission failed');
        return { success: false, message: 'Transaction submission failed' };
      }
    } catch (error) {
      console.log('❌ Transaction submission error:', error.message);
      return { success: false, message: `Transaction error: ${error.message}` };
    }
  }

  /**
   * Check for Hyperledger Fabric components
   */
  checkHyperledgerComponents() {
    console.log('🏗️ Checking Hyperledger Fabric Components...');
    
    const fabricPaths = [
      'blockchain/organizations',
      'blockchain/channel-artifacts',
      'blockchain/chaincode',
      'wallet'
    ];

    let foundComponents = 0;
    const results = [];
    
    for (const fabricPath of fabricPaths) {
      const exists = fs.existsSync(fabricPath);
      if (exists) {
        console.log(`✅ Found: ${fabricPath}`);
        foundComponents++;
      } else {
        console.log(`❌ Missing: ${fabricPath}`);
      }
      results.push({ path: fabricPath, exists });
    }

    const success = foundComponents > 0;
    const message = `Found ${foundComponents}/${fabricPaths.length} Hyperledger components`;
    
    return { success, message, components: results, foundCount: foundComponents };
  }

  /**
   * Run all checks
   */
  async runAllChecks() {
    console.log('🔍 TRACE HERB Blockchain Status Checker');
    console.log('========================================\n');

    const results = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Check 1: Backend API
    results.checks.api = await this.checkBackendAPI();

    // Check 2: Blockchain Status
    results.checks.blockchain = await this.checkBlockchainStatus();

    // Check 3: Transaction Test
    results.checks.transaction = await this.testTransaction();

    // Check 4: Hyperledger Components
    results.checks.components = this.checkHyperledgerComponents();

    // Generate final report
    this.generateReport(results);

    return results;
  }

  /**
   * Generate final report
   */
  generateReport(results) {
    console.log('\n📊 BLOCKCHAIN STATUS REPORT');
    console.log('============================');

    const { api, blockchain, transaction, components } = results.checks;

    console.log(`\n🔗 Backend API: ${api.success ? '✅ Connected' : '❌ Failed'}`);
    console.log(`   ${api.message}`);

    console.log(`\n⛓️ Blockchain Network: ${blockchain.success ? '✅ Connected' : '❌ Failed'}`);
    console.log(`   ${blockchain.message}`);
    if (blockchain.details) {
      console.log(`   Mode: ${blockchain.details.mode}`);
      console.log(`   Peers: ${blockchain.details.peersConnected}`);
    }

    console.log(`\n📤 Transaction Test: ${transaction.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   ${transaction.message}`);

    console.log(`\n🏗️ Hyperledger Components: ${components.success ? '✅ Found' : '❌ Missing'}`);
    console.log(`   ${components.message}`);

    // Final verdict
    console.log('\n🎯 FINAL VERDICT:');
    console.log('=================');
    
    if (blockchain.success && blockchain.isRealBlockchain) {
      console.log('✅ SYSTEM IS RUNNING ON REAL BLOCKCHAIN');
      console.log('   Your TRACE HERB system is connected to Hyperledger Fabric');
      console.log('   All transactions are being recorded on the distributed ledger');
    } else if (blockchain.success && !blockchain.isRealBlockchain) {
      console.log('⚠️ SYSTEM IS RUNNING IN DEMO MODE');
      console.log('   Your system is working but not connected to real blockchain');
      console.log('   To connect to real blockchain:');
      console.log('   1. Set up Hyperledger Fabric network');
      console.log('   2. Configure connection profiles');
      console.log('   3. Deploy smart contracts');
    } else {
      console.log('❌ BLOCKCHAIN CONNECTION ISSUES');
      console.log('   Your system may not be properly connected to blockchain');
      console.log('   Please check:');
      console.log('   1. Backend API is running (port 3000)');
      console.log('   2. Blockchain service configuration');
      console.log('   3. Network connectivity');
    }

    // Save report
    try {
      fs.writeFileSync('blockchain-status-report.json', JSON.stringify(results, null, 2));
      console.log('\n📄 Report saved to: blockchain-status-report.json');
    } catch (error) {
      console.log('\n⚠️ Could not save report file:', error.message);
    }
  }
}

// Run checker if called directly
if (require.main === module) {
  const checker = new SimpleBlockchainChecker();
  checker.runAllChecks().catch(console.error);
}

module.exports = SimpleBlockchainChecker;
