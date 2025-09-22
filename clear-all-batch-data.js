// Script to completely clear all batch data from all portals
console.log('🧹 CLEARING ALL BATCH DATA FROM ALL PORTALS...')

// List of all storage keys that contain batch data
const batchStorageKeys = [
  'farmerBatches',
  'traceHerbBatches',
  'processorBatches',
  'labBatches',
  'regulatoryBatches',
  'stakeholderBatches',
  'managementBatches',
  'consumerBatches',
  'batches',
  'herbBatches',
  'collectionBatches',
  'testBatches',
  'approvedBatches',
  'rejectedBatches',
  'pendingBatches',
  'completedBatches'
]

// Additional keys that might store batch-related data
const additionalKeys = [
  'selectedBatchId',
  'currentBatch',
  'activeBatch',
  'lastSelectedBatch',
  'batchTrackingState',
  'batchHistory',
  'batchCache',
  'recentBatches',
  'batchUpdates',
  'syncedBatches'
]

// Function to clear localStorage
const clearLocalStorage = () => {
  console.log('\n🗑️ CLEARING LOCAL STORAGE...')
  
  let clearedCount = 0
  
  // Clear batch storage keys
  batchStorageKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`✅ Cleared ${key}`)
      clearedCount++
    }
  })
  
  // Clear additional keys
  additionalKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`✅ Cleared ${key}`)
      clearedCount++
    }
  })
  
  console.log(`\n📊 CLEARED ${clearedCount} STORAGE KEYS`)
  return clearedCount
}

// Function to clear sessionStorage
const clearSessionStorage = () => {
  console.log('\n🗑️ CLEARING SESSION STORAGE...')
  
  let clearedCount = 0
  
  // Clear batch storage keys
  batchStorageKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key)
      console.log(`✅ Cleared session ${key}`)
      clearedCount++
    }
  })
  
  // Clear additional keys
  additionalKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key)
      console.log(`✅ Cleared session ${key}`)
      clearedCount++
    }
  })
  
  console.log(`\n📊 CLEARED ${clearedCount} SESSION STORAGE KEYS`)
  return clearedCount
}

// Function to initialize empty storage
const initializeEmptyStorage = () => {
  console.log('\n🔧 INITIALIZING EMPTY STORAGE...')
  
  const emptyBatchArray = []
  
  // Initialize main batch storage keys with empty arrays
  const mainKeys = [
    'farmerBatches',
    'traceHerbBatches',
    'processorBatches',
    'labBatches',
    'regulatoryBatches'
  ]
  
  mainKeys.forEach(key => {
    localStorage.setItem(key, JSON.stringify(emptyBatchArray))
    console.log(`✅ Initialized ${key} with empty array`)
  })
  
  console.log('\n✅ EMPTY STORAGE INITIALIZED')
}

// Function to trigger storage events to update UI
const triggerStorageEvents = () => {
  console.log('\n🔄 TRIGGERING STORAGE EVENTS TO UPDATE UI...')
  
  const mainKeys = [
    'farmerBatches',
    'traceHerbBatches',
    'processorBatches',
    'labBatches',
    'regulatoryBatches'
  ]
  
  mainKeys.forEach(key => {
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: '[]',
      oldValue: null,
      storageArea: localStorage
    }))
    console.log(`✅ Triggered storage event for ${key}`)
  })
  
  // Trigger custom batch events
  window.dispatchEvent(new CustomEvent('batchDataCleared', {
    detail: { message: 'All batch data has been cleared' }
  }))
  
  window.dispatchEvent(new CustomEvent('batchUpdated', {
    detail: { action: 'cleared', batches: [] }
  }))
  
  console.log('✅ STORAGE EVENTS TRIGGERED')
}

// Function to verify clearing
const verifyClearingComplete = () => {
  console.log('\n🔍 VERIFYING CLEARING IS COMPLETE...')
  
  let remainingData = 0
  
  batchStorageKeys.forEach(key => {
    const data = localStorage.getItem(key)
    if (data && data !== '[]' && data !== 'null') {
      console.log(`⚠️ ${key} still has data:`, data.substring(0, 100))
      remainingData++
    }
  })
  
  if (remainingData === 0) {
    console.log('✅ ALL BATCH DATA SUCCESSFULLY CLEARED')
    return true
  } else {
    console.log(`❌ ${remainingData} STORAGE KEYS STILL HAVE DATA`)
    return false
  }
}

// Main execution
console.log('🚀 STARTING COMPLETE BATCH DATA CLEARING...')

// Step 1: Clear localStorage
const localCleared = clearLocalStorage()

// Step 2: Clear sessionStorage
const sessionCleared = clearSessionStorage()

// Step 3: Initialize empty storage
initializeEmptyStorage()

// Step 4: Trigger storage events
triggerStorageEvents()

// Step 5: Verify clearing
const isComplete = verifyClearingComplete()

// Summary
console.log('\n🎉 BATCH DATA CLEARING COMPLETE!')
console.log(`📊 SUMMARY:`)
console.log(`   - Local Storage Keys Cleared: ${localCleared}`)
console.log(`   - Session Storage Keys Cleared: ${sessionCleared}`)
console.log(`   - Empty Storage Initialized: ✅`)
console.log(`   - Storage Events Triggered: ✅`)
console.log(`   - Verification: ${isComplete ? '✅ SUCCESS' : '❌ INCOMPLETE'}`)

console.log('\n📋 NEXT STEPS:')
console.log('1. Refresh all portal pages to see empty state')
console.log('2. Create new test batches')
console.log('3. Test real-time synchronization between portals')

// Auto-refresh current page
setTimeout(() => {
  console.log('🔄 Auto-refreshing page to show cleared state...')
  window.location.reload()
}, 3000)
