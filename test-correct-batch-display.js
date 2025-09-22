// Test script to verify each batch click shows the CORRECT batch data
console.log('🧪 TESTING CORRECT BATCH DISPLAY...')

// First, let's see what batches currently exist
const checkExistingBatches = () => {
  console.log('📦 CHECKING EXISTING BATCHES:')
  
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  const sharedBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  
  console.log(`📊 Farmer Batches: ${farmerBatches.length}`)
  farmerBatches.forEach((batch, index) => {
    console.log(`  ${index + 1}. ${batch.qrCode} - ${batch.commonName || batch.botanicalName} (${batch.status || 'pending'})`)
  })
  
  console.log(`📊 Shared Batches: ${sharedBatches.length}`)
  sharedBatches.forEach((batch, index) => {
    console.log(`  ${index + 1}. ${batch.qrCode} - ${batch.commonName || batch.botanicalName} (${batch.status || 'pending'})`)
  })
  
  return farmerBatches
}

// Create distinct test batches to verify the fix
const createDistinctTestBatches = () => {
  console.log('🎯 CREATING DISTINCT TEST BATCHES...')
  
  const testBatches = [
    {
      id: 'COL_TURMERIC_001',
      collectionId: 'COL_TURMERIC_001',
      qrCode: 'QR_COL_TURMERIC_001',
      botanicalName: 'Curcuma longa',
      commonName: 'TURMERIC',
      quantity: '25',
      unit: 'kg',
      status: 'pending',
      createdAt: new Date().toISOString(),
      farmerName: 'Turmeric Farmer',
      notes: 'High quality turmeric from organic farm'
    },
    {
      id: 'COL_BASIL_002',
      collectionId: 'COL_BASIL_002',
      qrCode: 'QR_COL_BASIL_002',
      botanicalName: 'Ocimum sanctum',
      commonName: 'HOLY BASIL',
      quantity: '15',
      unit: 'kg',
      status: 'processing',
      createdAt: new Date().toISOString(),
      farmerName: 'Basil Farmer',
      processingDate: new Date().toISOString(),
      processingNotes: 'Processing started - quality check passed',
      notes: 'Premium holy basil leaves'
    },
    {
      id: 'COL_ASHWA_003',
      collectionId: 'COL_ASHWA_003',
      qrCode: 'QR_COL_ASHWA_003',
      botanicalName: 'Withania somnifera',
      commonName: 'ASHWAGANDHA',
      quantity: '30',
      unit: 'kg',
      status: 'approved',
      createdAt: new Date().toISOString(),
      farmerName: 'Ashwagandha Farmer',
      processingDate: new Date().toISOString(),
      testingDate: new Date().toISOString(),
      approvedDate: new Date().toISOString(),
      approvalReason: 'Excellent quality - all tests passed with high scores',
      notes: 'Premium grade ashwagandha roots'
    }
  ]
  
  // Replace existing batches with test batches
  localStorage.setItem('farmerBatches', JSON.stringify(testBatches))
  localStorage.setItem('traceHerbBatches', JSON.stringify(testBatches))
  
  console.log('✅ CREATED 3 DISTINCT TEST BATCHES:')
  testBatches.forEach((batch, index) => {
    console.log(`  ${index + 1}. ${batch.qrCode} - ${batch.commonName} (${batch.status})`)
  })
  
  return testBatches
}

// Test the batch finding logic
const testBatchFinding = (batchId) => {
  console.log(`\n🔍 TESTING BATCH FINDING FOR: ${batchId}`)
  
  const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
  
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
            console.log(`  ✅ FOUND in ${key}:`)
            console.log(`     QR Code: ${foundBatch.qrCode}`)
            console.log(`     Common Name: ${foundBatch.commonName}`)
            console.log(`     Botanical Name: ${foundBatch.botanicalName}`)
            console.log(`     Status: ${foundBatch.status}`)
            console.log(`     Farmer: ${foundBatch.farmerName}`)
            return foundBatch
          }
        }
      } catch (e) {
        console.log(`  ❌ Error reading ${key}:`, e)
      }
    }
  }
  
  console.log(`  ❌ NOT FOUND: ${batchId}`)
  return null
}

// Simulate what should happen when clicking each batch
const simulateCorrectBehavior = (testBatches) => {
  console.log('\n🎯 SIMULATING CORRECT BATCH CLICK BEHAVIOR:')
  
  testBatches.forEach((batch, index) => {
    console.log(`\n--- CLICK TEST ${index + 1}: ${batch.commonName} ---`)
    console.log(`🖱️ User clicks on: ${batch.qrCode}`)
    console.log(`📋 Should show batch with:`)
    console.log(`   - QR Code: ${batch.qrCode}`)
    console.log(`   - Name: ${batch.commonName}`)
    console.log(`   - Status: ${batch.status}`)
    console.log(`   - Farmer: ${batch.farmerName}`)
    
    // Test if our finding logic works
    const found = testBatchFinding(batch.qrCode)
    
    if (found && found.qrCode === batch.qrCode) {
      console.log(`✅ CORRECT: Would display ${found.commonName}`)
    } else {
      console.log(`❌ WRONG: Expected ${batch.commonName}, found ${found?.commonName || 'nothing'}`)
    }
  })
}

// Clear any problematic cached data
const clearProblematicCache = () => {
  console.log('\n🧹 CLEARING PROBLEMATIC CACHE...')
  
  // Remove any keys that might cause state persistence issues
  const problematicKeys = [
    'selectedBatchId',
    'currentBatch',
    'activeBatch',
    'lastBatch',
    'batchCache',
    'trackingBatch'
  ]
  
  problematicKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`✅ Removed ${key}`)
    }
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key)
      console.log(`✅ Removed ${key} from session`)
    }
  })
}

// Run the complete test
console.log('🚀 STARTING COMPLETE BATCH DISPLAY TEST...')

// Step 1: Check existing batches
const existingBatches = checkExistingBatches()

// Step 2: Clear problematic cache
clearProblematicCache()

// Step 3: Create distinct test batches
const testBatches = createDistinctTestBatches()

// Step 4: Test the finding logic
simulateCorrectBehavior(testBatches)

// Step 5: Trigger UI updates
window.dispatchEvent(new StorageEvent('storage', {
  key: 'farmerBatches',
  newValue: JSON.stringify(testBatches),
  storageArea: localStorage
}))

console.log('\n🎉 TEST SETUP COMPLETE!')
console.log('📋 NEXT STEPS:')
console.log('1. Refresh the farmer portal page')
console.log('2. You should see 3 distinct batches:')
console.log('   - TURMERIC (QR_COL_TURMERIC_001) - Pending')
console.log('   - HOLY BASIL (QR_COL_BASIL_002) - Processing')
console.log('   - ASHWAGANDHA (QR_COL_ASHWA_003) - Approved')
console.log('3. Click each batch and verify:')
console.log('   - TURMERIC click → Shows TURMERIC details')
console.log('   - HOLY BASIL click → Shows HOLY BASIL details')
console.log('   - ASHWAGANDHA click → Shows ASHWAGANDHA details')
console.log('4. Check the header shows correct QR code and name')

// Auto-refresh to show the new batches
setTimeout(() => {
  console.log('🔄 Auto-refreshing to show test batches...')
  window.location.reload()
}, 3000)
