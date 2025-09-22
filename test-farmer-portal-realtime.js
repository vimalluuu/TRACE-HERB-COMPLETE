// Test script for farmer portal real-time tracking
// Run this in the browser console on the farmer portal (http://localhost:3002)

console.log('🧪 Testing Farmer Portal Real-Time Tracking...')

// Clear all existing data first
console.log('🧹 Clearing all demo data...')
localStorage.removeItem('traceHerbBatches')
localStorage.removeItem('farmerBatches')
localStorage.removeItem('processorBatches')
localStorage.removeItem('labBatches')
localStorage.removeItem('regulatoryBatches')

// Create a test batch
const testBatch = {
  id: 'TEST_BATCH_001',
  collectionId: 'TEST_BATCH_001',
  qrCode: 'QR_COL_TEST_BATCH_001',
  botanicalName: 'Ocimum sanctum',
  commonName: 'Holy Basil',
  quantity: '50',
  unit: 'kg',
  farmerName: 'Test Farmer',
  farmLocation: 'Test Farm, India',
  status: 'pending',
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  synced: true
}

console.log('📦 Creating test batch:', testBatch.qrCode)

// Add batch to storage
const batches = [testBatch]
localStorage.setItem('traceHerbBatches', JSON.stringify(batches))
localStorage.setItem('farmerBatches', JSON.stringify(batches))

// Trigger storage event for real-time updates
window.dispatchEvent(new StorageEvent('storage', {
  key: 'traceHerbBatches',
  newValue: JSON.stringify(batches)
}))

console.log('✅ Test batch created successfully!')

// Function to update batch status with detailed information
const updateBatchWithDetails = (qrCode, updates) => {
  const batches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  const batchIndex = batches.findIndex(b => b.qrCode === qrCode)
  
  if (batchIndex >= 0) {
    batches[batchIndex] = { ...batches[batchIndex], ...updates }
    
    // Update all storage locations
    localStorage.setItem('traceHerbBatches', JSON.stringify(batches))
    localStorage.setItem('farmerBatches', JSON.stringify(batches))
    
    // Also update portal-specific storage
    if (updates.status === 'processing' || updates.status === 'processed') {
      const processorBatches = JSON.parse(localStorage.getItem('processorBatches') || '[]')
      const processorIndex = processorBatches.findIndex(b => b.qrCode === qrCode)
      if (processorIndex >= 0) {
        processorBatches[processorIndex] = batches[batchIndex]
      } else {
        processorBatches.push(batches[batchIndex])
      }
      localStorage.setItem('processorBatches', JSON.stringify(processorBatches))
    }
    
    if (updates.status === 'testing' || updates.status === 'tested') {
      const labBatches = JSON.parse(localStorage.getItem('labBatches') || '[]')
      const labIndex = labBatches.findIndex(b => b.qrCode === qrCode)
      if (labIndex >= 0) {
        labBatches[labIndex] = batches[batchIndex]
      } else {
        labBatches.push(batches[batchIndex])
      }
      localStorage.setItem('labBatches', JSON.stringify(labBatches))
    }
    
    if (updates.status === 'approved' || updates.status === 'rejected') {
      const regulatoryBatches = JSON.parse(localStorage.getItem('regulatoryBatches') || '[]')
      const regulatoryIndex = regulatoryBatches.findIndex(b => b.qrCode === qrCode)
      if (regulatoryIndex >= 0) {
        regulatoryBatches[regulatoryIndex] = batches[batchIndex]
      } else {
        regulatoryBatches.push(batches[batchIndex])
      }
      localStorage.setItem('regulatoryBatches', JSON.stringify(regulatoryBatches))
    }
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'traceHerbBatches',
      newValue: JSON.stringify(batches)
    }))
    
    console.log(`✅ Updated batch ${qrCode} to status: ${updates.status}`)
    return batches[batchIndex]
  }
  return null
}

// Test the complete workflow with detailed status updates
console.log('🚀 Starting workflow simulation...')

setTimeout(() => {
  console.log('📝 Step 1: Processor Review Started...')
  updateBatchWithDetails(testBatch.qrCode, {
    status: 'processing',
    processingData: {
      processor: 'ABC Processing Ltd',
      method: 'Initial quality assessment',
      status: 'Under review',
      startTime: new Date().toISOString()
    },
    processingTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  })
}, 2000)

setTimeout(() => {
  console.log('📝 Step 2: Approved by Processor...')
  updateBatchWithDetails(testBatch.qrCode, {
    status: 'processed',
    processingData: {
      processor: 'ABC Processing Ltd',
      method: 'Steam distillation',
      yield: '85%',
      quality: 'Premium Grade',
      decision: 'Approved',
      completedTime: new Date().toISOString(),
      notes: 'Excellent quality herbs, processing completed successfully'
    },
    processingTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  })
}, 5000)

setTimeout(() => {
  console.log('📝 Step 3: Lab Testing Started...')
  updateBatchWithDetails(testBatch.qrCode, {
    status: 'testing',
    labTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  })
}, 8000)

setTimeout(() => {
  console.log('📝 Step 4: Approved by Laboratory...')
  updateBatchWithDetails(testBatch.qrCode, {
    status: 'tested',
    testResults: {
      purity: '98.5%',
      moisture: '8.2%',
      contaminants: 'None detected',
      grade: 'A+',
      quality: 'Premium',
      lab: 'Quality Labs India',
      decision: 'Approved',
      testDate: new Date().toISOString(),
      notes: 'Excellent quality parameters, all tests passed'
    },
    labTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  })
}, 11000)

setTimeout(() => {
  console.log('📝 Step 5: Approved by Regulatory Authority...')
  updateBatchWithDetails(testBatch.qrCode, {
    status: 'approved',
    regulatoryDecision: 'approved',
    regulatoryComments: 'Excellent quality herbs, meets all regulatory standards and safety requirements. Approved for market distribution.',
    regulatoryTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  })
}, 14000)

console.log('⏱️ Workflow simulation started! Watch the farmer portal for real-time updates over the next 15 seconds.')
console.log('📱 The batch status should update automatically showing:')
console.log('   1. Currently Under Processor Review (2s)')
console.log('   2. Approved by Processor (5s)')
console.log('   3. Currently Under Lab Testing (8s)')
console.log('   4. Approved by Laboratory (11s)')
console.log('   5. Approved by Regulatory Authority (14s)')

// Function to manually trigger sync (for testing)
window.testManualSync = async () => {
  console.log('🔄 Testing manual sync...')
  const event = new CustomEvent('manualSync')
  window.dispatchEvent(event)
}

console.log('💡 You can also run window.testManualSync() to test manual sync functionality')
