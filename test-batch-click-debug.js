// Debug script to test batch clicking functionality
console.log('🧪 TESTING BATCH CLICK FUNCTIONALITY...')

// Check what batches are currently in storage
const checkBatches = () => {
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  const sharedBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  
  console.log('📦 FARMER BATCHES:', farmerBatches.length)
  farmerBatches.forEach((batch, index) => {
    console.log(`  ${index + 1}. ${batch.commonName || batch.botanicalName} - ${batch.qrCode}`)
  })
  
  console.log('📦 SHARED BATCHES:', sharedBatches.length)
  sharedBatches.forEach((batch, index) => {
    console.log(`  ${index + 1}. ${batch.commonName || batch.botanicalName} - ${batch.qrCode}`)
  })
  
  return { farmerBatches, sharedBatches }
}

// Check current batches
const { farmerBatches, sharedBatches } = checkBatches()

// Test batch click simulation
const testBatchClick = (batchIndex = 0) => {
  if (farmerBatches.length === 0) {
    console.log('❌ No batches found to test')
    return
  }
  
  const testBatch = farmerBatches[batchIndex]
  console.log('🎯 TESTING CLICK ON BATCH:', testBatch)
  console.log('  - QR Code:', testBatch.qrCode)
  console.log('  - ID:', testBatch.id)
  console.log('  - Collection ID:', testBatch.collectionId)
  console.log('  - Common Name:', testBatch.commonName)
  console.log('  - Botanical Name:', testBatch.botanicalName)
  
  // Simulate the click handler logic
  const batchId = testBatch.qrCode || testBatch.id || testBatch.collectionId
  console.log('🎯 WOULD USE BATCH ID:', batchId)
  
  // Check if this batch exists in tracking storage
  const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
  
  console.log('🔍 CHECKING BATCH AVAILABILITY IN ALL STORAGES:')
  storageKeys.forEach(key => {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const batches = JSON.parse(data)
        const found = batches.find(b => 
          b.qrCode === batchId || 
          b.id === batchId || 
          b.collectionId === batchId
        )
        
        if (found) {
          console.log(`  ✅ Found in ${key}:`, {
            status: found.status,
            qrCode: found.qrCode,
            id: found.id
          })
        } else {
          console.log(`  ❌ Not found in ${key}`)
        }
      } catch (e) {
        console.log(`  ❌ Error reading ${key}:`, e)
      }
    } else {
      console.log(`  ❌ ${key} is empty`)
    }
  })
}

// Test clicking on different batches
console.log('\n🧪 TESTING BATCH CLICKS:')
for (let i = 0; i < Math.min(farmerBatches.length, 3); i++) {
  console.log(`\n--- TESTING BATCH ${i + 1} ---`)
  testBatchClick(i)
}

// Check if there's a persistent selectedBatchId issue
const checkPersistentState = () => {
  console.log('\n🔍 CHECKING FOR PERSISTENT STATE ISSUES:')
  
  // Check if there's any cached state
  const possibleStateKeys = Object.keys(localStorage).filter(key => 
    key.includes('selected') || key.includes('current') || key.includes('active')
  )
  
  if (possibleStateKeys.length > 0) {
    console.log('🔍 Found possible state keys:', possibleStateKeys)
    possibleStateKeys.forEach(key => {
      console.log(`  ${key}:`, localStorage.getItem(key))
    })
  } else {
    console.log('✅ No persistent state keys found')
  }
  
  // Check session storage too
  const sessionKeys = Object.keys(sessionStorage).filter(key => 
    key.includes('batch') || key.includes('selected')
  )
  
  if (sessionKeys.length > 0) {
    console.log('🔍 Found session storage keys:', sessionKeys)
    sessionKeys.forEach(key => {
      console.log(`  ${key}:`, sessionStorage.getItem(key))
    })
  } else {
    console.log('✅ No batch-related session storage found')
  }
}

checkPersistentState()

// Provide fix suggestions
console.log('\n💡 DEBUGGING SUGGESTIONS:')
console.log('1. Open farmer portal and click on different batches')
console.log('2. Check browser console for the debug messages we added')
console.log('3. Look for these messages:')
console.log('   - "🎯 Batch clicked:" (from FastFarmerDashboard)')
console.log('   - "📋 FARMER PORTAL: Setting selected batch ID:" (from index.js)')
console.log('   - "🔍 BATCH TRACKING: Received batchId:" (from FastBatchTracking)')
console.log('4. If all batches show the same ID, there might be a React state issue')

// Clear any potential cached state
console.log('\n🧹 CLEARING POTENTIAL CACHED STATE:')
const keysToCheck = ['selectedBatchId', 'currentBatch', 'activeBatch']
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

console.log('\n🎯 NOW TRY CLICKING ON DIFFERENT BATCHES AND CHECK THE CONSOLE!')
