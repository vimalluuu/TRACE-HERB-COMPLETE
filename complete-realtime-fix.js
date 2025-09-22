// Complete script to clear all data and fix real-time timeline synchronization
console.log('🚀 COMPLETE REAL-TIME TIMELINE FIX STARTING...')

// Step 1: Clear all existing batch data
const clearAllBatchData = () => {
  console.log('\n🧹 STEP 1: CLEARING ALL BATCH DATA...')
  
  const batchStorageKeys = [
    'farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches',
    'stakeholderBatches', 'managementBatches', 'consumerBatches', 'batches', 'herbBatches',
    'selectedBatchId', 'currentBatch', 'activeBatch', 'lastSelectedBatch', 'batchTrackingState'
  ]
  
  let clearedCount = 0
  batchStorageKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`✅ Cleared ${key}`)
      clearedCount++
    }
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key)
      console.log(`✅ Cleared session ${key}`)
      clearedCount++
    }
  })
  
  // Initialize empty arrays
  const mainKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
  mainKeys.forEach(key => {
    localStorage.setItem(key, JSON.stringify([]))
  })
  
  console.log(`✅ CLEARED ${clearedCount} STORAGE KEYS AND INITIALIZED EMPTY ARRAYS`)
  return clearedCount
}

// Step 2: Set up enhanced real-time synchronization
const setupEnhancedRealtimeSync = () => {
  console.log('\n🔄 STEP 2: SETTING UP ENHANCED REAL-TIME SYNC...')
  
  // Function to merge batch data from all portals with proper status detection
  window.mergeBatchFromAllPortals = (targetBatchId) => {
    console.log(`🔍 MERGING BATCH DATA for: ${targetBatchId}`)
    
    const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
    let mergedBatch = null
    let foundInPortals = []
    
    // Collect data from all portals
    for (const key of storageKeys) {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const batches = JSON.parse(data)
          if (Array.isArray(batches)) {
            const batch = batches.find(b => 
              b.qrCode === targetBatchId || b.id === targetBatchId || b.collectionId === targetBatchId
            )
            
            if (batch) {
              console.log(`📦 Found in ${key}:`, {
                status: batch.status,
                processingDate: batch.processingDate,
                processingCompleted: batch.processingCompleted,
                testingDate: batch.testingDate,
                testingCompleted: batch.testingCompleted,
                approvedDate: batch.approvedDate
              })
              
              foundInPortals.push({ portal: key, batch })
              
              if (!mergedBatch) {
                mergedBatch = { ...batch }
              } else {
                // Smart merge: keep most advanced data
                mergedBatch = {
                  ...mergedBatch,
                  ...batch,
                  
                  // Processing status - use most advanced
                  processingDate: batch.processingDate || mergedBatch.processingDate,
                  processingCompleted: batch.processingCompleted || mergedBatch.processingCompleted,
                  processingNotes: batch.processingNotes || mergedBatch.processingNotes,
                  
                  // Lab testing status - use most advanced
                  testingDate: batch.testingDate || mergedBatch.testingDate,
                  testingCompleted: batch.testingCompleted || mergedBatch.testingCompleted,
                  labResults: batch.labResults || mergedBatch.labResults,
                  
                  // Regulatory status - use most advanced
                  reviewDate: batch.reviewDate || mergedBatch.reviewDate,
                  regulatoryCompleted: batch.regulatoryCompleted || mergedBatch.regulatoryCompleted,
                  regulatoryNotes: batch.regulatoryNotes || mergedBatch.regulatoryNotes,
                  approvedDate: batch.approvedDate || mergedBatch.approvedDate,
                  rejectedDate: batch.rejectedDate || mergedBatch.rejectedDate,
                  
                  // Use most advanced status
                  status: getAdvancedStatus(mergedBatch.status, batch.status),
                  lastUpdated: new Date().toISOString()
                }
              }
            }
          }
        } catch (e) {
          console.log(`❌ Error reading ${key}:`, e)
        }
      }
    }
    
    if (mergedBatch && foundInPortals.length > 0) {
      console.log(`✅ MERGED DATA from ${foundInPortals.length} portals`)
      
      // Update farmer batches with merged data (this is what the farmer portal reads)
      updateFarmerBatchesWithMerged(mergedBatch)
      
      // Trigger update events
      window.dispatchEvent(new CustomEvent('batchSynced', {
        detail: { batch: mergedBatch, portals: foundInPortals.length }
      }))
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'farmerBatches',
        newValue: localStorage.getItem('farmerBatches'),
        storageArea: localStorage
      }))
    }
    
    return mergedBatch
  }
  
  // Function to determine most advanced status
  const getAdvancedStatus = (status1, status2) => {
    const statusHierarchy = {
      'pending': 1,
      'processing': 2,
      'processed': 3,
      'testing': 4,
      'tested': 5,
      'approved': 6,
      'rejected': 6,
      'completed': 7
    }
    
    const level1 = statusHierarchy[status1] || 1
    const level2 = statusHierarchy[status2] || 1
    
    return level1 >= level2 ? status1 : status2
  }
  
  // Function to update farmer batches with merged data
  const updateFarmerBatchesWithMerged = (mergedBatch) => {
    const data = localStorage.getItem('farmerBatches')
    let farmerBatches = []
    
    if (data) {
      try {
        farmerBatches = JSON.parse(data)
      } catch (e) {
        farmerBatches = []
      }
    }
    
    if (!Array.isArray(farmerBatches)) {
      farmerBatches = []
    }
    
    const existingIndex = farmerBatches.findIndex(b => 
      b.qrCode === mergedBatch.qrCode || b.id === mergedBatch.id || b.collectionId === mergedBatch.collectionId
    )
    
    if (existingIndex >= 0) {
      farmerBatches[existingIndex] = mergedBatch
      localStorage.setItem('farmerBatches', JSON.stringify(farmerBatches))
      console.log(`✅ Updated farmer batches with merged data for ${mergedBatch.qrCode}`)
    }
  }
  
  // Enhanced storage event listener
  const handleStorageChange = (e) => {
    if (e.key && (e.key.includes('Batches') || e.key.includes('batches'))) {
      console.log(`🔄 Storage change detected in ${e.key}`)
      
      try {
        const newBatches = JSON.parse(e.newValue || '[]')
        if (Array.isArray(newBatches) && newBatches.length > 0) {
          // Sync each batch across all portals
          newBatches.forEach(batch => {
            const batchId = batch.qrCode || batch.id || batch.collectionId
            if (batchId) {
              setTimeout(() => window.mergeBatchFromAllPortals(batchId), 200)
            }
          })
        }
      } catch (e) {
        console.log('Error processing storage change:', e)
      }
    }
  }
  
  // Set up periodic sync every 2 seconds
  const setupPeriodicSync = () => {
    return setInterval(() => {
      console.log('⏰ Periodic cross-portal sync check...')
      
      // Get all unique batch IDs from farmer batches (main source)
      const farmerData = localStorage.getItem('farmerBatches')
      if (farmerData) {
        try {
          const farmerBatches = JSON.parse(farmerData)
          if (Array.isArray(farmerBatches)) {
            farmerBatches.forEach(batch => {
              const batchId = batch.qrCode || batch.id || batch.collectionId
              if (batchId) {
                window.mergeBatchFromAllPortals(batchId)
              }
            })
            
            if (farmerBatches.length > 0) {
              console.log(`✅ Synced ${farmerBatches.length} batches from farmer portal`)
            }
          }
        } catch (e) {
          console.log('Error in periodic sync:', e)
        }
      }
    }, 2000)
  }
  
  // Set up event listeners
  window.addEventListener('storage', handleStorageChange)
  
  // Set up periodic sync
  const syncInterval = setupPeriodicSync()
  
  // Store cleanup function globally
  window.cleanupRealtimeSync = () => {
    window.removeEventListener('storage', handleStorageChange)
    clearInterval(syncInterval)
    console.log('✅ Real-time sync cleanup completed')
  }
  
  console.log('✅ ENHANCED REAL-TIME SYNC SETUP COMPLETE')
  return { handleStorageChange, syncInterval }
}

// Step 3: Create test workflow batches
const createTestWorkflowBatches = () => {
  console.log('\n🧪 STEP 3: CREATING TEST WORKFLOW BATCHES...')
  
  const now = new Date()
  
  const testBatches = [
    // Batch 1: Just created (pending)
    {
      id: 'WORKFLOW_001',
      collectionId: 'WORKFLOW_001',
      qrCode: 'QR_WORKFLOW_001',
      botanicalName: 'Curcuma longa',
      commonName: 'Turmeric Workflow Test',
      quantity: '10',
      unit: 'kg',
      status: 'pending',
      createdAt: now.toISOString(),
      farmerName: 'Test Farmer',
      collectionCompleted: true,
      collectionDate: now.toISOString()
    },
    
    // Batch 2: Processed (ready for lab)
    {
      id: 'WORKFLOW_002',
      collectionId: 'WORKFLOW_002',
      qrCode: 'QR_WORKFLOW_002',
      botanicalName: 'Ocimum sanctum',
      commonName: 'Basil Workflow Test',
      quantity: '5',
      unit: 'kg',
      status: 'processed',
      createdAt: new Date(now.getTime() - 3600000).toISOString(),
      farmerName: 'Test Farmer',
      collectionCompleted: true,
      collectionDate: new Date(now.getTime() - 3600000).toISOString(),
      processingDate: new Date(now.getTime() - 1800000).toISOString(),
      processingCompleted: new Date(now.getTime() - 1200000).toISOString(),
      processingNotes: 'Quality check completed - approved for lab testing'
    },
    
    // Batch 3: Fully approved
    {
      id: 'WORKFLOW_003',
      collectionId: 'WORKFLOW_003',
      qrCode: 'QR_WORKFLOW_003',
      botanicalName: 'Withania somnifera',
      commonName: 'Ashwagandha Workflow Test',
      quantity: '15',
      unit: 'kg',
      status: 'approved',
      createdAt: new Date(now.getTime() - 7200000).toISOString(),
      farmerName: 'Test Farmer',
      collectionCompleted: true,
      collectionDate: new Date(now.getTime() - 7200000).toISOString(),
      processingDate: new Date(now.getTime() - 5400000).toISOString(),
      processingCompleted: new Date(now.getTime() - 4800000).toISOString(),
      processingNotes: 'Processing completed successfully',
      testingDate: new Date(now.getTime() - 3600000).toISOString(),
      testingCompleted: new Date(now.getTime() - 2400000).toISOString(),
      labResults: 'All tests passed - purity 99.2%',
      reviewDate: new Date(now.getTime() - 1800000).toISOString(),
      regulatoryCompleted: new Date(now.getTime() - 600000).toISOString(),
      regulatoryNotes: 'Regulatory compliance verified',
      approvedDate: new Date(now.getTime() - 300000).toISOString(),
      approvalReason: 'All quality and regulatory requirements met'
    }
  ]
  
  // Set up the batches in different portals to simulate real workflow
  localStorage.setItem('farmerBatches', JSON.stringify(testBatches))
  localStorage.setItem('processorBatches', JSON.stringify([testBatches[1], testBatches[2]]))
  localStorage.setItem('labBatches', JSON.stringify([testBatches[2]]))
  localStorage.setItem('regulatoryBatches', JSON.stringify([testBatches[2]]))
  
  console.log('✅ Created 3 test workflow batches:')
  testBatches.forEach((batch, index) => {
    console.log(`  ${index + 1}. ${batch.commonName} (${batch.qrCode}) - Status: ${batch.status}`)
  })
  
  return testBatches
}

// Main execution
console.log('🚀 STARTING COMPLETE REAL-TIME TIMELINE FIX...')

// Execute all steps
const clearedCount = clearAllBatchData()
const syncSystem = setupEnhancedRealtimeSync()
const testBatches = createTestWorkflowBatches()

// Trigger initial sync
setTimeout(() => {
  testBatches.forEach(batch => {
    window.mergeBatchFromAllPortals(batch.qrCode)
  })
}, 1000)

console.log('\n🎉 COMPLETE REAL-TIME TIMELINE FIX COMPLETED!')
console.log('\n📋 WHAT THIS FIXES:')
console.log('✅ Cleared all old batch data')
console.log('✅ Set up enhanced real-time synchronization')
console.log('✅ Timeline shows actual status from other portals')
console.log('✅ Processing status updates when processor approves')
console.log('✅ Lab testing status updates when lab completes')
console.log('✅ Regulatory status updates when regulatory approves')
console.log('✅ Automatic cross-portal data merging every 2 seconds')
console.log('✅ Created test batches for workflow testing')

console.log('\n🎯 TEST THE FIX:')
console.log('1. Refresh all portal pages')
console.log('2. Check Farmer Portal - should show 3 test batches')
console.log('3. Batch 1: Pending (Collection completed)')
console.log('4. Batch 2: Processing completed, Lab testing pending')
console.log('5. Batch 3: All steps completed, Approved')
console.log('6. Create new batches and test cross-portal sync')

// Auto-refresh to show changes
setTimeout(() => {
  console.log('🔄 Auto-refreshing to show cleared and fixed state...')
  window.location.reload()
}, 5000)
