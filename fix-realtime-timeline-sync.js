// Script to fix real-time timeline synchronization between all portals
console.log('🔧 FIXING REAL-TIME TIMELINE SYNCHRONIZATION...')

// Enhanced cross-portal batch synchronization system
const setupRealtimeSync = () => {
  console.log('🔄 SETTING UP ENHANCED REAL-TIME SYNC...')
  
  // Function to merge batch data from all portals
  const mergeBatchFromAllPortals = (targetBatchId) => {
    console.log(`🔍 MERGING BATCH DATA for: ${targetBatchId}`)
    
    const storageKeys = [
      'farmerBatches',
      'traceHerbBatches', 
      'processorBatches',
      'labBatches',
      'regulatoryBatches'
    ]
    
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
              b.qrCode === targetBatchId || 
              b.id === targetBatchId || 
              b.collectionId === targetBatchId
            )
            
            if (batch) {
              console.log(`📦 Found in ${key}:`, {
                status: batch.status,
                processingDate: batch.processingDate,
                testingDate: batch.testingDate,
                approvedDate: batch.approvedDate
              })
              
              foundInPortals.push({ portal: key, batch })
              
              if (!mergedBatch) {
                mergedBatch = { ...batch }
              } else {
                // Merge with priority: keep most recent timestamps and advanced status
                mergedBatch = {
                  ...mergedBatch,
                  ...batch,
                  
                  // Processing data
                  processingDate: batch.processingDate || mergedBatch.processingDate,
                  processingCompleted: batch.processingCompleted || mergedBatch.processingCompleted,
                  processingNotes: batch.processingNotes || mergedBatch.processingNotes,
                  processingApproved: batch.processingApproved || mergedBatch.processingApproved,
                  
                  // Lab testing data
                  testingDate: batch.testingDate || mergedBatch.testingDate,
                  testingCompleted: batch.testingCompleted || mergedBatch.testingCompleted,
                  labResults: batch.labResults || mergedBatch.labResults,
                  testingApproved: batch.testingApproved || mergedBatch.testingApproved,
                  
                  // Regulatory data
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
    
    if (mergedBatch && foundInPortals.length > 1) {
      console.log(`✅ MERGED DATA from ${foundInPortals.length} portals`)
      
      // Update all portals with merged data
      updateAllPortalsWithMergedBatch(mergedBatch)
      
      // Trigger update events
      window.dispatchEvent(new CustomEvent('batchSynced', {
        detail: { batch: mergedBatch, portals: foundInPortals.length }
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
  
  // Function to update all portals with merged batch
  const updateAllPortalsWithMergedBatch = (mergedBatch) => {
    const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
    
    storageKeys.forEach(key => {
      const data = localStorage.getItem(key)
      let batches = []
      
      if (data) {
        try {
          batches = JSON.parse(data)
        } catch (e) {
          batches = []
        }
      }
      
      if (!Array.isArray(batches)) {
        batches = []
      }
      
      const existingIndex = batches.findIndex(b => 
        b.qrCode === mergedBatch.qrCode || 
        b.id === mergedBatch.id || 
        b.collectionId === mergedBatch.collectionId
      )
      
      if (existingIndex >= 0) {
        batches[existingIndex] = mergedBatch
        localStorage.setItem(key, JSON.stringify(batches))
        console.log(`✅ Updated ${key} with merged batch`)
      }
    })
  }
  
  // Enhanced storage event listener
  const handleStorageChange = (e) => {
    if (e.key && e.key.includes('Batches')) {
      console.log(`🔄 Storage change detected in ${e.key}`)
      
      try {
        const newBatches = JSON.parse(e.newValue || '[]')
        if (Array.isArray(newBatches) && newBatches.length > 0) {
          // Sync each batch across all portals
          newBatches.forEach(batch => {
            const batchId = batch.qrCode || batch.id || batch.collectionId
            if (batchId) {
              setTimeout(() => mergeBatchFromAllPortals(batchId), 100)
            }
          })
        }
      } catch (e) {
        console.log('Error processing storage change:', e)
      }
    }
  }
  
  // Set up periodic sync every 3 seconds
  const setupPeriodicSync = () => {
    return setInterval(() => {
      console.log('⏰ Periodic cross-portal sync check...')
      
      // Get all unique batch IDs from all portals
      const allBatchIds = new Set()
      const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
      
      storageKeys.forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const batches = JSON.parse(data)
            if (Array.isArray(batches)) {
              batches.forEach(batch => {
                const batchId = batch.qrCode || batch.id || batch.collectionId
                if (batchId) {
                  allBatchIds.add(batchId)
                }
              })
            }
          } catch (e) {
            console.log(`Error reading ${key} for periodic sync:`, e)
          }
        }
      })
      
      // Sync each unique batch
      allBatchIds.forEach(batchId => {
        mergeBatchFromAllPortals(batchId)
      })
      
      if (allBatchIds.size > 0) {
        console.log(`✅ Synced ${allBatchIds.size} batches across all portals`)
      }
    }, 3000)
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
  
  console.log('✅ REAL-TIME SYNC SETUP COMPLETE')
  return { handleStorageChange, syncInterval }
}

// Function to create test batches for different stages
const createTestBatchesForSync = () => {
  console.log('\n🧪 CREATING TEST BATCHES FOR SYNC TESTING...')
  
  const testBatches = [
    {
      id: 'TEST_001',
      collectionId: 'TEST_001',
      qrCode: 'QR_TEST_001',
      botanicalName: 'Curcuma longa',
      commonName: 'Turmeric Test',
      quantity: '10',
      unit: 'kg',
      status: 'pending',
      createdAt: new Date().toISOString(),
      farmerName: 'Test Farmer'
    },
    {
      id: 'TEST_002',
      collectionId: 'TEST_002',
      qrCode: 'QR_TEST_002',
      botanicalName: 'Ocimum sanctum',
      commonName: 'Basil Test',
      quantity: '5',
      unit: 'kg',
      status: 'processed',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      farmerName: 'Test Farmer',
      processingDate: new Date().toISOString(),
      processingCompleted: new Date().toISOString(),
      processingNotes: 'Processing completed successfully'
    },
    {
      id: 'TEST_003',
      collectionId: 'TEST_003',
      qrCode: 'QR_TEST_003',
      botanicalName: 'Withania somnifera',
      commonName: 'Ashwagandha Test',
      quantity: '15',
      unit: 'kg',
      status: 'approved',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      farmerName: 'Test Farmer',
      processingDate: new Date(Date.now() - 3600000).toISOString(),
      processingCompleted: new Date(Date.now() - 3000000).toISOString(),
      testingDate: new Date(Date.now() - 1800000).toISOString(),
      testingCompleted: new Date(Date.now() - 900000).toISOString(),
      labResults: 'All tests passed',
      approvedDate: new Date().toISOString(),
      approvalReason: 'Meets all quality standards'
    }
  ]
  
  // Add to farmer batches
  localStorage.setItem('farmerBatches', JSON.stringify(testBatches))
  
  // Add processed batch to processor storage
  localStorage.setItem('processorBatches', JSON.stringify([testBatches[1], testBatches[2]]))
  
  // Add tested batch to lab storage
  localStorage.setItem('labBatches', JSON.stringify([testBatches[2]]))
  
  // Add approved batch to regulatory storage
  localStorage.setItem('regulatoryBatches', JSON.stringify([testBatches[2]]))
  
  console.log('✅ Created 3 test batches with different stages')
  return testBatches
}

// Main execution
console.log('🚀 STARTING REAL-TIME TIMELINE SYNC FIX...')

// Step 1: Setup real-time synchronization
const syncSystem = setupRealtimeSync()

// Step 2: Create test batches (optional)
// const testBatches = createTestBatchesForSync()

// Step 3: Trigger initial sync
window.dispatchEvent(new StorageEvent('storage', {
  key: 'farmerBatches',
  newValue: localStorage.getItem('farmerBatches'),
  storageArea: localStorage
}))

console.log('\n🎉 REAL-TIME TIMELINE SYNC FIX COMPLETE!')
console.log('\n📋 WHAT THIS FIXES:')
console.log('✅ Real-time synchronization between all portals')
console.log('✅ Timeline shows actual status from other portals')
console.log('✅ Processing status updates when processor approves')
console.log('✅ Lab testing status updates when lab completes')
console.log('✅ Regulatory status updates when regulatory approves')
console.log('✅ Automatic cross-portal data merging')
console.log('✅ Periodic sync every 3 seconds')

console.log('\n🎯 HOW TO TEST:')
console.log('1. Create a batch in Farmer Portal')
console.log('2. Approve it in Processor Portal')
console.log('3. Check Farmer Portal - should show "Processing: Completed"')
console.log('4. Add lab results in Lab Portal')
console.log('5. Check Farmer Portal - should show "Lab Testing: Completed"')
console.log('6. Approve in Regulatory Portal')
console.log('7. Check Farmer Portal - should show "Regulatory: Completed"')

console.log('\n⚡ REAL-TIME SYNC IS NOW ACTIVE!')
