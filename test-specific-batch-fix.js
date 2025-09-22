// Test script to verify specific batch loading fix
console.log('🔧 TESTING SPECIFIC BATCH LOADING FIX...')

// Test the exact batches you mentioned
const testBatchIds = [
  'QR_COL_1758553577265_F39FC920', // The batch you want to see
  'QR_COL_1758550770854_36AB1459'  // The batch that keeps showing
]

// Function to find batch in storage (same logic as component)
const findSpecificBatch = (searchBatchId) => {
  console.log(`\n🔍 SEARCHING FOR: ${searchBatchId}`)
  
  const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
  
  for (const key of storageKeys) {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const batches = JSON.parse(data)
        if (Array.isArray(batches)) {
          console.log(`  📦 Checking ${key}: ${batches.length} batches`)
          
          // List all batches in this storage
          batches.forEach((b, index) => {
            console.log(`    ${index + 1}. ${b.qrCode || b.id} - ${b.commonName || b.botanicalName}`)
          })
          
          const foundBatch = batches.find(b => {
            const matches = (
              b.qrCode === searchBatchId || 
              b.id === searchBatchId || 
              b.collectionId === searchBatchId
            )
            return matches
          })
          
          if (foundBatch) {
            console.log(`  ✅ FOUND in ${key}:`)
            console.log(`    - QR Code: ${foundBatch.qrCode}`)
            console.log(`    - ID: ${foundBatch.id}`)
            console.log(`    - Common Name: ${foundBatch.commonName}`)
            console.log(`    - Botanical Name: ${foundBatch.botanicalName}`)
            console.log(`    - Status: ${foundBatch.status}`)
            return foundBatch
          }
        }
      } catch (e) {
        console.log(`  ❌ Error reading ${key}:`, e)
      }
    } else {
      console.log(`  📦 ${key}: Empty`)
    }
  }
  
  console.log(`  ❌ NOT FOUND: ${searchBatchId}`)
  return null
}

// Test each batch ID
testBatchIds.forEach(batchId => {
  const found = findSpecificBatch(batchId)
  if (found) {
    console.log(`🎉 SUCCESS: ${batchId} found and would show ${found.commonName}`)
  } else {
    console.log(`💔 PROBLEM: ${batchId} not found in any storage`)
  }
})

// Check if the problem batch exists and why it might be showing
console.log('\n🔍 INVESTIGATING WHY WRONG BATCH SHOWS...')

const problemBatch = findSpecificBatch('QR_COL_1758550770854_36AB1459')
if (problemBatch) {
  console.log('🚨 PROBLEM BATCH EXISTS:')
  console.log('  This batch exists in storage, so it might be getting loaded by mistake')
  console.log('  Check if there\'s a state management issue or if it\'s the first batch in array')
}

// Check array positions
const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
if (farmerBatches.length > 0) {
  console.log('\n📊 FARMER BATCHES ORDER:')
  farmerBatches.forEach((batch, index) => {
    const isProblematic = batch.qrCode === 'QR_COL_1758550770854_36AB1459'
    console.log(`  ${index + 1}. ${batch.qrCode} - ${batch.commonName} ${isProblematic ? '⚠️ PROBLEM BATCH' : ''}`)
  })
  
  if (farmerBatches[0].qrCode === 'QR_COL_1758550770854_36AB1459') {
    console.log('🚨 FOUND THE ISSUE: Problem batch is FIRST in array!')
    console.log('   The component might be defaulting to the first batch instead of searching correctly')
  }
}

// Test the component's search logic directly
console.log('\n🧪 TESTING COMPONENT SEARCH LOGIC:')

const testComponentSearch = (targetBatchId) => {
  console.log(`\n🎯 Testing search for: ${targetBatchId}`)
  
  // Simulate the exact logic from the component
  const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
  
  for (const key of storageKeys) {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const batches = JSON.parse(data)
        if (Array.isArray(batches)) {
          const foundBatch = batches.find(b => {
            const matches = (
              b.qrCode === targetBatchId || 
              b.id === targetBatchId || 
              b.collectionId === targetBatchId
            )
            if (matches) {
              console.log(`  🎯 EXACT MATCH in ${key}: ${b.qrCode} - ${b.commonName}`)
            }
            return matches
          })
          
          if (foundBatch) {
            console.log(`  ✅ Component would load: ${foundBatch.commonName} (${foundBatch.qrCode})`)
            return foundBatch
          }
        }
      } catch (e) {
        console.log(`  ❌ Error: ${e}`)
      }
    }
  }
  
  console.log(`  ❌ Component would find: NOTHING`)
  return null
}

// Test both batches
testComponentSearch('QR_COL_1758553577265_F39FC920')
testComponentSearch('QR_COL_1758550770854_36AB1459')

console.log('\n💡 SOLUTION:')
console.log('1. The component now uses DIRECT SEARCH instead of syncBatchFromAllPortals')
console.log('2. It searches for the EXACT batchId passed as parameter')
console.log('3. It should now show the correct batch data')
console.log('\n🎯 TEST INSTRUCTIONS:')
console.log('1. Click on batch QR_COL_1758553577265_F39FC920')
console.log('2. Check console for "🎯 EXACT MATCH FOUND" message')
console.log('3. Verify the tracking page shows the CORRECT batch name and details')
console.log('4. The header should show "Tracking: QR_COL_1758553577265_F39FC920"')
console.log('5. The batch details should match what you clicked, NOT the old batch')
