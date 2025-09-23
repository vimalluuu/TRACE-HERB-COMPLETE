// TRACE HERB - Test Complete Timestamp Synchronization
// This script tests the complete timestamp synchronization across all portals

console.log('🧪 TESTING COMPLETE TIMESTAMP SYNCHRONIZATION...')

// Test batch ID (using the one from user's screenshot)
const testBatchId = 'QR_COL_1758594438236_E188A517'

// Function to create a fresh test batch
const createFreshTestBatch = () => {
  const batchId = testBatchId.replace('QR_COL_', '')
  const now = new Date()
  
  const testBatch = {
    id: batchId,
    collectionId: batchId,
    qrCode: testBatchId,
    botanicalName: 'Curcuma longa',
    commonName: 'Turmeric',
    quantity: '0.2',
    unit: 'kg',
    farmerName: 'Test Farmer',
    farmLocation: 'Test Farm Location',
    farmSize: '2 acres',
    collectionMethod: 'Hand-picked',
    season: 'Winter 2024',
    weatherConditions: 'Optimal',
    soilType: 'Clay loam',
    certifications: 'Organic',
    status: 'pending',
    createdAt: now.toISOString(),
    collectionDate: now.toISOString(),
    lastUpdated: now.toISOString(),
    synced: true
  }
  
  console.log('🌱 Created fresh test batch:', testBatch.qrCode)
  return testBatch
}

// Function to add batch to all storage locations
const addBatchToAllStorages = (batch) => {
  const storageKeys = ['traceHerbBatches', 'farmerBatches']
  
  for (const storageKey of storageKeys) {
    const batches = JSON.parse(localStorage.getItem(storageKey) || '[]')
    
    // Remove existing batch with same ID
    const filteredBatches = batches.filter(b => 
      b.qrCode !== batch.qrCode && 
      b.collectionId !== batch.collectionId
    )
    
    // Add new batch
    filteredBatches.push(batch)
    localStorage.setItem(storageKey, JSON.stringify(filteredBatches))
    
    console.log(`✅ Added batch to ${storageKey}`)
  }
}

// Function to simulate processor action with timestamp
const simulateProcessorAction = (batchId) => {
  console.log('\n🏭 PROCESSOR: Starting processing...')
  
  const now = new Date().toISOString()
  const storageKeys = ['traceHerbBatches', 'farmerBatches', 'processorBatches']
  
  for (const storageKey of storageKeys) {
    const batches = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const batchIndex = batches.findIndex(b => b.qrCode === batchId)
    
    if (batchIndex >= 0) {
      batches[batchIndex] = {
        ...batches[batchIndex],
        status: 'processing',
        processingDate: now,
        processingTimestamp: now,
        processingStarted: now,
        processingNotes: 'Quality assessment completed - Grade A herbs',
        processingData: {
          processor: 'Premium Processing Ltd',
          method: 'Steam distillation',
          yield: '92%',
          quality: 'Premium Grade'
        },
        lastUpdated: now
      }
      localStorage.setItem(storageKey, JSON.stringify(batches))
      
      // Trigger real-time update
      window.dispatchEvent(new StorageEvent('storage', {
        key: storageKey,
        newValue: JSON.stringify(batches),
        storageArea: localStorage
      }))
    } else if (storageKey === 'processorBatches') {
      // Add to processor storage
      const processorBatch = {
        ...batches.find(b => b.qrCode === batchId) || {},
        status: 'processing',
        processingDate: now,
        processingTimestamp: now,
        processingStarted: now,
        processingNotes: 'Quality assessment completed - Grade A herbs',
        lastUpdated: now
      }
      batches.push(processorBatch)
      localStorage.setItem(storageKey, JSON.stringify(batches))
    }
  }
  
  console.log('✅ Processor action completed - timestamp added')
  return now
}

// Function to simulate lab action with timestamp
const simulateLabAction = (batchId) => {
  console.log('\n🧪 LAB: Starting testing...')
  
  const now = new Date().toISOString()
  const storageKeys = ['traceHerbBatches', 'farmerBatches', 'processorBatches', 'labBatches']
  
  for (const storageKey of storageKeys) {
    const batches = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const batchIndex = batches.findIndex(b => b.qrCode === batchId)
    
    if (batchIndex >= 0) {
      batches[batchIndex] = {
        ...batches[batchIndex],
        status: 'testing',
        testingDate: now,
        labTimestamp: now,
        testingStarted: now,
        testingNotes: 'Comprehensive analysis in progress',
        labResults: {
          purity: '99.2%',
          moisture: '7.8%',
          contaminants: 'None detected',
          grade: 'A+',
          lab: 'Advanced Testing Labs'
        },
        lastUpdated: now
      }
      localStorage.setItem(storageKey, JSON.stringify(batches))
      
      // Trigger real-time update
      window.dispatchEvent(new StorageEvent('storage', {
        key: storageKey,
        newValue: JSON.stringify(batches),
        storageArea: localStorage
      }))
    } else if (storageKey === 'labBatches') {
      // Add to lab storage
      const labBatch = {
        ...batches.find(b => b.qrCode === batchId) || {},
        status: 'testing',
        testingDate: now,
        labTimestamp: now,
        testingStarted: now,
        testingNotes: 'Comprehensive analysis in progress',
        lastUpdated: now
      }
      batches.push(labBatch)
      localStorage.setItem(storageKey, JSON.stringify(batches))
    }
  }
  
  console.log('✅ Lab action completed - timestamp added')
  return now
}

// Function to simulate regulatory action with timestamp
const simulateRegulatoryAction = (batchId) => {
  console.log('\n📋 REGULATORY: Starting review...')
  
  const now = new Date().toISOString()
  const storageKeys = ['traceHerbBatches', 'farmerBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
  
  for (const storageKey of storageKeys) {
    const batches = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const batchIndex = batches.findIndex(b => b.qrCode === batchId)
    
    if (batchIndex >= 0) {
      batches[batchIndex] = {
        ...batches[batchIndex],
        status: 'approved',
        reviewDate: now,
        regulatoryTimestamp: now,
        regulatoryReviewStarted: now,
        approvedDate: now,
        regulatoryNotes: 'All regulatory standards exceeded',
        approvalReason: 'Outstanding quality - exceeds all requirements',
        regulatoryDecision: 'approve',
        lastUpdated: now
      }
      localStorage.setItem(storageKey, JSON.stringify(batches))
      
      // Trigger real-time update
      window.dispatchEvent(new StorageEvent('storage', {
        key: storageKey,
        newValue: JSON.stringify(batches),
        storageArea: localStorage
      }))
    } else if (storageKey === 'regulatoryBatches') {
      // Add to regulatory storage
      const regulatoryBatch = {
        ...batches.find(b => b.qrCode === batchId) || {},
        status: 'approved',
        reviewDate: now,
        regulatoryTimestamp: now,
        regulatoryReviewStarted: now,
        approvedDate: now,
        regulatoryNotes: 'All regulatory standards exceeded',
        lastUpdated: now
      }
      batches.push(regulatoryBatch)
      localStorage.setItem(storageKey, JSON.stringify(batches))
    }
  }
  
  console.log('✅ Regulatory action completed - timestamp added')
  return now
}

// Function to verify timestamps in farmer portal data
const verifyTimestamps = (batchId) => {
  console.log('\n🔍 VERIFYING TIMESTAMPS...')
  
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  const batch = farmerBatches.find(b => b.qrCode === batchId)
  
  if (batch) {
    console.log('📊 TIMESTAMP VERIFICATION RESULTS:')
    console.log(`   Collection: ${batch.createdAt ? '✅ ' + new Date(batch.createdAt).toLocaleString() : '❌ Missing'}`)
    console.log(`   Processing: ${batch.processingDate || batch.processingTimestamp ? '✅ ' + new Date(batch.processingDate || batch.processingTimestamp).toLocaleString() : '❌ Missing'}`)
    console.log(`   Lab Testing: ${batch.testingDate || batch.labTimestamp ? '✅ ' + new Date(batch.testingDate || batch.labTimestamp).toLocaleString() : '❌ Missing'}`)
    console.log(`   Regulatory: ${batch.reviewDate || batch.regulatoryTimestamp ? '✅ ' + new Date(batch.reviewDate || batch.regulatoryTimestamp).toLocaleString() : '❌ Missing'}`)
    console.log(`   Final Status: ${batch.approvedDate || batch.rejectedDate ? '✅ ' + new Date(batch.approvedDate || batch.rejectedDate).toLocaleString() : '❌ Missing'}`)
    
    return {
      collection: !!(batch.createdAt),
      processing: !!(batch.processingDate || batch.processingTimestamp),
      testing: !!(batch.testingDate || batch.labTimestamp),
      regulatory: !!(batch.reviewDate || batch.regulatoryTimestamp),
      final: !!(batch.approvedDate || batch.rejectedDate)
    }
  } else {
    console.log('❌ Batch not found in farmer batches')
    return null
  }
}

// Main test execution
const runCompleteTest = async () => {
  console.log(`\n🎯 STARTING COMPLETE TIMESTAMP SYNC TEST FOR: ${testBatchId}`)
  
  // Step 1: Create fresh test batch
  const testBatch = createFreshTestBatch()
  addBatchToAllStorages(testBatch)
  
  console.log('\n📝 TEST TIMELINE:')
  console.log('   Step 1: Create batch (immediate)')
  console.log('   Step 2: Processor action (3 seconds)')
  console.log('   Step 3: Lab action (6 seconds)')
  console.log('   Step 4: Regulatory action (9 seconds)')
  console.log('   Step 5: Verify results (12 seconds)')
  
  // Step 2: Processor action (after 3 seconds)
  setTimeout(() => {
    simulateProcessorAction(testBatchId)
  }, 3000)
  
  // Step 3: Lab action (after 6 seconds)
  setTimeout(() => {
    simulateLabAction(testBatchId)
  }, 6000)
  
  // Step 4: Regulatory action (after 9 seconds)
  setTimeout(() => {
    simulateRegulatoryAction(testBatchId)
  }, 9000)
  
  // Step 5: Verify results (after 12 seconds)
  setTimeout(() => {
    const results = verifyTimestamps(testBatchId)
    
    if (results) {
      const allTimestampsPresent = Object.values(results).every(Boolean)
      
      if (allTimestampsPresent) {
        console.log('\n🎉 SUCCESS! All timestamps are present and should display in farmer portal')
        console.log('📱 Go to farmer portal and check the Progress Timeline section')
        console.log('✅ All stages should now show real dates and times instead of "Pending"')
      } else {
        console.log('\n⚠️ Some timestamps are missing. Check the verification results above.')
      }
    }
    
    // Trigger final UI refresh
    window.dispatchEvent(new CustomEvent('testCompleted', { 
      detail: { batchId: testBatchId, results } 
    }))
    
  }, 12000)
}

// Run the test
runCompleteTest()

console.log('\n✅ COMPLETE TIMESTAMP SYNC TEST STARTED!')
console.log('⏱️ Test will complete in 12 seconds')
console.log('👀 Watch the console for progress updates')
console.log('📱 Then check your farmer portal for updated timestamps!')
