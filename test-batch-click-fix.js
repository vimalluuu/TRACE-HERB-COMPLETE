// Test script to verify batch clicking shows correct batch details
console.log('🧪 TESTING BATCH CLICK FIX...')

// Create multiple test batches with different data
const createTestBatches = () => {
  const testBatches = [
    {
      id: 'COL_TEST_001',
      collectionId: 'COL_TEST_001',
      qrCode: 'QR_COL_TEST_001',
      botanicalName: 'Curcuma longa',
      commonName: 'Turmeric',
      quantity: '10',
      unit: 'kg',
      status: 'pending',
      createdAt: new Date().toISOString(),
      farmerName: 'Test Farmer 1'
    },
    {
      id: 'COL_TEST_002',
      collectionId: 'COL_TEST_002', 
      qrCode: 'QR_COL_TEST_002',
      botanicalName: 'Ocimum sanctum',
      commonName: 'Holy Basil',
      quantity: '5',
      unit: 'kg',
      status: 'processing',
      createdAt: new Date().toISOString(),
      farmerName: 'Test Farmer 2',
      processingDate: new Date().toISOString(),
      processingNotes: 'Quality check completed'
    },
    {
      id: 'COL_TEST_003',
      collectionId: 'COL_TEST_003',
      qrCode: 'QR_COL_TEST_003', 
      botanicalName: 'Withania somnifera',
      commonName: 'Ashwagandha',
      quantity: '15',
      unit: 'kg',
      status: 'approved',
      createdAt: new Date().toISOString(),
      farmerName: 'Test Farmer 3',
      processingDate: new Date().toISOString(),
      testingDate: new Date().toISOString(),
      approvedDate: new Date().toISOString(),
      approvalReason: 'All tests passed successfully'
    }
  ]
  
  // Clear existing batches
  localStorage.setItem('farmerBatches', JSON.stringify(testBatches))
  localStorage.setItem('traceHerbBatches', JSON.stringify(testBatches))
  
  console.log('✅ Created 3 test batches:')
  testBatches.forEach((batch, index) => {
    console.log(`  ${index + 1}. ${batch.commonName} (${batch.qrCode}) - Status: ${batch.status}`)
  })
  
  return testBatches
}

// Test batch tracking functionality
const testBatchTracking = (batchId) => {
  console.log(`\n🎯 TESTING BATCH TRACKING FOR: ${batchId}`)
  
  // Simulate the syncBatchFromAllPortals function
  const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
  
  let foundBatches = []
  
  for (const key of storageKeys) {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const batches = JSON.parse(data)
        if (Array.isArray(batches)) {
          const foundBatch = batches.find(b => 
            b.qrCode === batchId || 
            b.id === batchId || 
            b.collectionId === batchId
          )
          
          if (foundBatch) {
            foundBatches.push({ batch: foundBatch, storage: key })
            console.log(`  ✅ Found in ${key}:`, {
              qrCode: foundBatch.qrCode,
              commonName: foundBatch.commonName,
              status: foundBatch.status
            })
          }
        }
      } catch (e) {
        console.log(`  ❌ Error reading ${key}:`, e)
      }
    }
  }
  
  if (foundBatches.length > 0) {
    const batch = foundBatches[0].batch
    console.log(`  🎉 SHOULD SHOW: ${batch.commonName} (${batch.qrCode})`)
    console.log(`  📊 Status: ${batch.status}`)
    console.log(`  📦 Quantity: ${batch.quantity} ${batch.unit}`)
    console.log(`  👨‍🌾 Farmer: ${batch.farmerName}`)
    return batch
  } else {
    console.log(`  ❌ BATCH NOT FOUND: ${batchId}`)
    return null
  }
}

// Simulate clicking on each batch
const simulateBatchClicks = (testBatches) => {
  console.log('\n🖱️ SIMULATING BATCH CLICKS:')
  
  testBatches.forEach((batch, index) => {
    console.log(`\n--- CLICK ${index + 1}: ${batch.commonName} ---`)
    
    // This is what should happen when you click
    const batchId = batch.qrCode || batch.id || batch.collectionId
    console.log(`🎯 Clicked batch ID: ${batchId}`)
    
    // Test if tracking would find the correct batch
    const foundBatch = testBatchTracking(batchId)
    
    if (foundBatch && foundBatch.qrCode === batch.qrCode) {
      console.log(`✅ CORRECT: Would show ${foundBatch.commonName}`)
    } else {
      console.log(`❌ WRONG: Expected ${batch.commonName}, found ${foundBatch?.commonName || 'nothing'}`)
    }
  })
}

// Clear any cached state that might cause issues
const clearCachedState = () => {
  console.log('\n🧹 CLEARING CACHED STATE...')
  
  const keysToCheck = [
    'selectedBatchId',
    'currentBatch', 
    'activeBatch',
    'lastSelectedBatch',
    'batchTrackingState'
  ]
  
  keysToCheck.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`✅ Cleared ${key} from localStorage`)
    }
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key)
      console.log(`✅ Cleared ${key} from sessionStorage`)
    }
  })
}

// Run the tests
console.log('🚀 STARTING BATCH CLICK TESTS...')

// Step 1: Clear any cached state
clearCachedState()

// Step 2: Create test batches
const testBatches = createTestBatches()

// Step 3: Test batch tracking for each
simulateBatchClicks(testBatches)

// Step 4: Trigger events to update UI
window.dispatchEvent(new StorageEvent('storage', {
  key: 'farmerBatches',
  newValue: JSON.stringify(testBatches),
  storageArea: localStorage
}))

console.log('\n🎯 TEST COMPLETE!')
console.log('📋 INSTRUCTIONS:')
console.log('1. Refresh the farmer portal page')
console.log('2. You should see 3 test batches: Turmeric, Holy Basil, Ashwagandha')
console.log('3. Click on each batch - they should show DIFFERENT tracking pages')
console.log('4. Check that:')
console.log('   - Turmeric shows "Turmeric" details (pending status)')
console.log('   - Holy Basil shows "Holy Basil" details (processing status)')
console.log('   - Ashwagandha shows "Ashwagandha" details (approved status)')

// Force page refresh to show new batches
setTimeout(() => {
  console.log('🔄 Refreshing page to show test batches...')
  window.location.reload()
}, 2000)
