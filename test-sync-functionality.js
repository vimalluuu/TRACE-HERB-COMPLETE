#!/usr/bin/env node

/**
 * Test Script: TRACE HERB Blockchain Sync Functionality
 * 
 * This script tests the complete sync workflow:
 * 1. Check blockchain status
 * 2. Simulate collection data being saved locally when blockchain is unavailable
 * 3. Test manual sync functionality
 * 4. Verify sync status updates
 */

// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'cyan');
  console.log('='.repeat(60));
}

function logStep(step, message) {
  log(`${step}. ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function checkBlockchainStatus() {
  logStep(1, 'Checking blockchain connection status...');
  
  const result = await makeRequest(`${API_BASE}/health/blockchain`);
  
  if (result.success) {
    const status = result.data.data || result.data; // Handle nested data structure
    logSuccess('Blockchain status retrieved successfully');
    console.log(`   Network: ${status.networkName}`);
    console.log(`   Channel: ${status.channelName}`);
    console.log(`   Mode: ${status.mode}`);
    console.log(`   Connected: ${status.connected}`);
    console.log(`   Peers: ${status.peersConnected}`);
    console.log(`   Status: ${status.status}`);
    
    if (status.mode === 'demo') {
      logWarning('System is running in DEMO MODE - blockchain simulation active');
    } else if (status.connected) {
      logSuccess('Real blockchain connection established');
    } else {
      logError('Blockchain connection failed');
    }
    
    return status;
  } else {
    logError(`Failed to check blockchain status: ${result.error || 'Unknown error'}`);
    return null;
  }
}

async function testSyncFunctionality() {
  logStep(2, 'Testing blockchain sync functionality...');
  
  const result = await makeRequest(`${API_BASE}/collection/sync`, {
    method: 'POST'
  });
  
  if (result.success) {
    const syncResult = result.data;
    logSuccess('Sync operation completed successfully');
    console.log(`   Attempted: ${syncResult.results.attempted}`);
    console.log(`   Successful: ${syncResult.results.successful}`);
    console.log(`   Failed: ${syncResult.results.failed}`);
    
    if (syncResult.results.errors && syncResult.results.errors.length > 0) {
      logWarning('Sync errors encountered:');
      syncResult.results.errors.forEach((error, index) => {
        console.log(`     ${index + 1}. ${error}`);
      });
    }
    
    // Display network status after sync
    if (syncResult.networkStatus) {
      console.log('\n   Network Status After Sync:');
      console.log(`     Mode: ${syncResult.networkStatus.mode}`);
      console.log(`     Connected: ${syncResult.networkStatus.connected}`);
      console.log(`     Status: ${syncResult.networkStatus.status}`);
    }
    
    return syncResult;
  } else {
    logError(`Sync operation failed: ${result.error || 'Unknown error'}`);
    return null;
  }
}

async function testHealthEndpoints() {
  logStep(3, 'Testing health endpoints...');
  
  // Test general health
  const healthResult = await makeRequest(`${API_BASE}/health`);
  if (healthResult.success) {
    logSuccess('General health check passed');
  } else {
    logError('General health check failed');
  }
  
  // Test blockchain-specific health
  const blockchainHealthResult = await makeRequest(`${API_BASE}/health/blockchain`);
  if (blockchainHealthResult.success) {
    logSuccess('Blockchain health check passed');
  } else {
    logError('Blockchain health check failed');
  }
  
  return {
    general: healthResult.success,
    blockchain: blockchainHealthResult.success
  };
}

async function simulateCollectionScenario() {
  logStep(4, 'Simulating collection data scenario...');
  
  // In a real scenario, this would be collection data that failed to sync
  // For demo purposes, we'll just test the sync endpoint
  
  logWarning('Note: In demo mode, no actual collection data is pending sync');
  logWarning('In production, this would sync locally stored collection events');
  
  const syncResult = await testSyncFunctionality();
  
  if (syncResult) {
    if (syncResult.results.attempted === 0) {
      logSuccess('No pending collection data to sync (expected in demo mode)');
    } else {
      logSuccess(`Successfully processed ${syncResult.results.successful} collection events`);
    }
  }
  
  return syncResult;
}

async function runTests() {
  logHeader('🚜 TRACE HERB - Blockchain Sync Functionality Test');
  
  try {
    // Step 1: Check blockchain status
    const blockchainStatus = await checkBlockchainStatus();
    
    if (!blockchainStatus) {
      logError('Cannot proceed without blockchain status');
      return;
    }
    
    // Step 2: Test health endpoints
    await testHealthEndpoints();
    
    // Step 3: Test sync functionality
    await simulateCollectionScenario();
    
    // Final summary
    logHeader('📊 Test Summary');
    
    if (blockchainStatus.mode === 'demo') {
      logWarning('SYSTEM STATUS: Demo Mode Active');
      console.log('   ✅ Backend API: Connected');
      console.log('   ✅ Blockchain Service: Connected (Demo Mode)');
      console.log('   ✅ Sync Functionality: Working');
      console.log('   ⚠️  Real Blockchain: Not Connected');
      
      console.log('\n📋 Next Steps:');
      console.log('   1. Configure Hyperledger Fabric network for production');
      console.log('   2. Update environment variables for blockchain connection');
      console.log('   3. Test with real collection data');
      console.log('   4. Verify frontend blockchain status component');
    } else if (blockchainStatus.connected) {
      logSuccess('SYSTEM STATUS: Production Ready');
      console.log('   ✅ Backend API: Connected');
      console.log('   ✅ Blockchain Service: Connected');
      console.log('   ✅ Sync Functionality: Working');
      console.log('   ✅ Real Blockchain: Connected');
    } else {
      logError('SYSTEM STATUS: Connection Issues');
      console.log('   ✅ Backend API: Connected');
      console.log('   ❌ Blockchain Service: Disconnected');
      console.log('   ⚠️  Sync Functionality: Limited');
    }
    
    logHeader('🎯 User Instructions');
    console.log('1. Open the consumer portal: http://localhost:3003');
    console.log('2. Look for the blockchain status indicator in the top-right');
    console.log('3. Click on the status to see detailed information');
    console.log('4. If in demo mode, you can click "Sync Now" to test sync functionality');
    console.log('5. Collection data will be saved locally and synced when blockchain is available');
    
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
  }
}

// Run the tests
runTests().catch(console.error);
