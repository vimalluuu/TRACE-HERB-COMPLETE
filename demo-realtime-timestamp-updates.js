// TRACE HERB - Demo Real-Time Timestamp Updates
// This script demonstrates the real-time timestamp updates in the farmer portal

console.log('🎬 STARTING REAL-TIME TIMESTAMP UPDATES DEMO...')

// Target batch ID from user's screenshot
const targetBatchId = 'QR_COL_1758594438236_E188A517'

// Function to display current batch status
const displayBatchStatus = (batchId) => {
  const allBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  const batch = allBatches.find(b => 
    b.qrCode === batchId || 
    b.collectionId === batchId ||
    batchId.includes(b.collectionId || '')
  )
  
  if (batch) {
    console.log(`\n📊 BATCH STATUS: ${batch.qrCode}`)
    console.log(`   Status: ${batch.status}`)
    console.log(`   Collection: ${batch.createdAt || batch.collectionDate || 'Not set'}`)
    console.log(`   Processing: ${batch.processingDate || batch.processingTimestamp || 'Pending'}`)
    console.log(`   Lab Testing: ${batch.testingDate || batch.labTimestamp || 'Pending'}`)
    console.log(`   Regulatory: ${batch.reviewDate || batch.regulatoryTimestamp || 'Pending'}`)
    console.log(`   Final: ${batch.approvedDate || batch.rejectedDate || 'Pending'}`)
    return batch
  } else {
    console.log(`❌ Batch not found: ${batchId}`)
    return null
  }
}

// Function to create a test batch if it doesn't exist
const createTestBatch = (batchId) => {
  console.log(`🔧 Creating test batch: ${batchId}`)
  
  const testBatch = {
    id: batchId.replace('QR_COL_', ''),
    collectionId: batchId.replace('QR_COL_', ''),
    qrCode: batchId,
    botanicalName: 'Curcuma longa',
    commonName: 'Turmeric',
    quantity: '0.2',
    unit: 'kg',
    farmerName: 'Demo Farmer',
    farmLocation: 'Demo Farm',
    status: 'pending',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    synced: true
  }
  
  // Add to all storage locations
  const storageKeys = ['traceHerbBatches', 'farmerBatches']
  
  for (const storageKey of storageKeys) {
    const batches = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const existingIndex = batches.findIndex(b => b.qrCode === batchId)
    
    if (existingIndex >= 0) {
      batches[existingIndex] = { ...batches[existingIndex], ...testBatch }
    } else {
      batches.push(testBatch)
    }
    
    localStorage.setItem(storageKey, JSON.stringify(batches))
    console.log(`✅ Added test batch to ${storageKey}`)
  }
  
  return testBatch
}

// Function to simulate step-by-step workflow with real-time updates
const simulateStepByStepWorkflow = (batchId) => {
  console.log(`\n🎬 STARTING STEP-BY-STEP WORKFLOW SIMULATION FOR: ${batchId}`)
  
  // Step 1: Initial status check
  console.log('\n📝 STEP 1: Initial Status Check')
  let batch = displayBatchStatus(batchId)
  
  if (!batch) {
    batch = createTestBatch(batchId)
    displayBatchStatus(batchId)
  }
  
  // Step 2: Processor picks up batch (after 3 seconds)
  setTimeout(() => {
    console.log('\n📝 STEP 2: Processor Pickup & Processing')
    console.log('🏭 Processor is now processing the batch...')
    
    // Update batch status to processing
    const storageKeys = ['traceHerbBatches', 'farmerBatches', 'processorBatches']
    const now = new Date().toISOString()
    
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
          processingNotes: 'Quality check in progress - ABC Processing Ltd',
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
        // Add to processor batches
        const processorBatch = {
          ...batch,
          status: 'processing',
          processingDate: now,
          processingTimestamp: now,
          processingStarted: now,
          processingNotes: 'Quality check in progress - ABC Processing Ltd',
          lastUpdated: now
        }
        batches.push(processorBatch)
        localStorage.setItem(storageKey, JSON.stringify(batches))
      }
    }
    
    displayBatchStatus(batchId)
    console.log('✅ Processing timestamp updated! Check farmer portal now.')
    
  }, 3000)
  
  // Step 3: Processing completed, sent to lab (after 6 seconds)
  setTimeout(() => {
    console.log('\n📝 STEP 3: Processing Completed - Sent to Lab')
    console.log('🧪 Lab is now testing the batch...')
    
    const storageKeys = ['traceHerbBatches', 'farmerBatches', 'processorBatches', 'labBatches']
    const now = new Date().toISOString()
    
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
          testingNotes: 'Comprehensive lab analysis in progress',
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
        // Add to lab batches
        const labBatch = {
          ...batch,
          status: 'testing',
          testingDate: now,
          labTimestamp: now,
          testingStarted: now,
          testingNotes: 'Comprehensive lab analysis in progress',
          lastUpdated: now
        }
        batches.push(labBatch)
        localStorage.setItem(storageKey, JSON.stringify(batches))
      }
    }
    
    displayBatchStatus(batchId)
    console.log('✅ Lab testing timestamp updated! Check farmer portal now.')
    
  }, 6000)
  
  // Step 4: Lab testing completed, sent to regulatory (after 9 seconds)
  setTimeout(() => {
    console.log('\n📝 STEP 4: Lab Testing Completed - Regulatory Review')
    console.log('📋 Regulatory is now reviewing the batch...')
    
    const storageKeys = ['traceHerbBatches', 'farmerBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
    const now = new Date().toISOString()
    
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
          regulatoryNotes: 'All regulatory requirements met',
          approvalReason: 'Excellent quality - all standards exceeded',
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
        // Add to regulatory batches
        const regulatoryBatch = {
          ...batch,
          status: 'approved',
          reviewDate: now,
          regulatoryTimestamp: now,
          regulatoryReviewStarted: now,
          approvedDate: now,
          regulatoryNotes: 'All regulatory requirements met',
          approvalReason: 'Excellent quality - all standards exceeded',
          lastUpdated: now
        }
        batches.push(regulatoryBatch)
        localStorage.setItem(storageKey, JSON.stringify(batches))
      }
    }
    
    displayBatchStatus(batchId)
    console.log('✅ Regulatory approval timestamp updated! Check farmer portal now.')
    console.log('\n🎉 WORKFLOW COMPLETE! All timestamps should now show real dates/times in farmer portal.')
    
  }, 9000)
}

// Function to trigger UI refresh
const triggerUIRefresh = () => {
  console.log('🔄 Triggering UI refresh...')
  
  // Trigger multiple events to ensure UI updates
  window.dispatchEvent(new CustomEvent('batchUpdated'))
  window.dispatchEvent(new CustomEvent('batchStatusChanged'))
  window.dispatchEvent(new CustomEvent('timestampUpdated'))
  
  // Force page refresh if needed
  setTimeout(() => {
    if (window.location.pathname.includes('farmer')) {
      console.log('🔄 Refreshing farmer portal page...')
      window.location.reload()
    }
  }, 1000)
}

// Main demo execution
console.log(`\n🎯 TARGET BATCH: ${targetBatchId}`)
console.log('📝 This demo will show real-time timestamp updates in the farmer portal')
console.log('📝 Watch the Progress Timeline section for timestamp changes')
console.log('\n⏱️ Timeline:')
console.log('   0s: Initial status check')
console.log('   3s: Processing starts (timestamp appears)')
console.log('   6s: Lab testing starts (timestamp appears)')
console.log('   9s: Regulatory approval (timestamp appears)')

// Start the demo
simulateStepByStepWorkflow(targetBatchId)

// Trigger UI refresh
triggerUIRefresh()

console.log('\n✅ REAL-TIME TIMESTAMP UPDATES DEMO STARTED!')
console.log('👀 Watch your farmer portal - timestamps will update automatically!')
console.log('🔄 If timestamps don\'t appear, refresh the farmer portal page.')
