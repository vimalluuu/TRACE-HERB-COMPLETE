// Test script to simulate real-time batch updates from different portals
console.log('🧪 TESTING REAL-TIME BATCH UPDATES...')

const batchId = 'QR_COL_1758552171383_723730B5'
console.log('🎯 Testing batch:', batchId)

// Function to update batch in specific portal storage
const updateBatchInPortal = (portalKey, batchId, updates) => {
  const batches = JSON.parse(localStorage.getItem(portalKey) || '[]')
  const batchIndex = batches.findIndex(b => 
    b.qrCode === batchId || b.id === batchId || b.collectionId === batchId
  )
  
  if (batchIndex >= 0) {
    // Update existing batch
    batches[batchIndex] = { ...batches[batchIndex], ...updates, lastUpdated: new Date().toISOString() }
    localStorage.setItem(portalKey, JSON.stringify(batches))
    console.log(`✅ Updated batch in ${portalKey}:`, updates)
    
    // Trigger events
    window.dispatchEvent(new StorageEvent('storage', {
      key: portalKey,
      newValue: JSON.stringify(batches),
      storageArea: localStorage
    }))
    
    window.dispatchEvent(new CustomEvent('batchUpdated', { 
      detail: batches[batchIndex] 
    }))
    
    return batches[batchIndex]
  } else {
    console.log(`❌ Batch not found in ${portalKey}`)
    return null
  }
}

// Function to add batch to portal if it doesn't exist
const ensureBatchInPortal = (portalKey, batchData) => {
  const batches = JSON.parse(localStorage.getItem(portalKey) || '[]')
  const existingIndex = batches.findIndex(b => 
    b.qrCode === batchData.qrCode || b.id === batchData.id
  )
  
  if (existingIndex === -1) {
    batches.push(batchData)
    localStorage.setItem(portalKey, JSON.stringify(batches))
    console.log(`➕ Added batch to ${portalKey}`)
  }
}

// Get the original batch data
const originalBatch = (() => {
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  return farmerBatches.find(b => 
    b.qrCode === batchId || b.id === batchId || b.collectionId === batchId
  )
})()

if (!originalBatch) {
  console.log('❌ Original batch not found. Please create the batch first.')
} else {
  console.log('✅ Found original batch:', originalBatch)
  
  // Simulate real-time updates with delays
  console.log('🚀 Starting real-time update simulation...')
  
  // Step 1: Processor picks up the batch (after 3 seconds)
  setTimeout(() => {
    console.log('🏭 PROCESSOR: Starting processing...')
    
    // Add batch to processor storage
    ensureBatchInPortal('processorBatches', originalBatch)
    
    // Update status to processing
    updateBatchInPortal('processorBatches', batchId, {
      status: 'processing',
      processingStarted: new Date().toISOString(),
      processingDate: new Date().toISOString(),
      processingNotes: 'Initial quality check completed. Cleaning and sorting in progress.',
      lastUpdated: new Date().toISOString()
    })
    
    // Also update in shared storage
    updateBatchInPortal('traceHerbBatches', batchId, {
      status: 'processing',
      processingStarted: new Date().toISOString(),
      processingDate: new Date().toISOString(),
      processingNotes: 'Initial quality check completed. Cleaning and sorting in progress.'
    })
    
  }, 3000)
  
  // Step 2: Processing completed, sent to lab (after 8 seconds)
  setTimeout(() => {
    console.log('🧪 LAB: Starting testing...')
    
    // Add batch to lab storage
    ensureBatchInPortal('labBatches', originalBatch)
    
    // Update status to testing
    updateBatchInPortal('labBatches', batchId, {
      status: 'testing',
      processed: true,
      processingCompleted: new Date().toISOString(),
      testingStarted: new Date().toISOString(),
      testingDate: new Date().toISOString(),
      testingNotes: 'Chemical composition analysis in progress. Purity and safety tests initiated.',
      lastUpdated: new Date().toISOString()
    })
    
    // Update shared storage
    updateBatchInPortal('traceHerbBatches', batchId, {
      status: 'testing',
      processed: true,
      processingCompleted: new Date().toISOString(),
      testingStarted: new Date().toISOString(),
      testingDate: new Date().toISOString(),
      testingNotes: 'Chemical composition analysis in progress. Purity and safety tests initiated.'
    })
    
  }, 8000)
  
  // Step 3: Lab testing completed, sent to regulatory (after 15 seconds)
  setTimeout(() => {
    console.log('📋 REGULATORY: Starting review...')
    
    // Add batch to regulatory storage
    ensureBatchInPortal('regulatoryBatches', originalBatch)
    
    // Update status to regulatory review
    updateBatchInPortal('regulatoryBatches', batchId, {
      status: 'tested',
      testingCompleted: new Date().toISOString(),
      labResults: 'All chemical tests passed. Purity: 98.5%. No contaminants detected.',
      regulatoryReviewStarted: new Date().toISOString(),
      reviewDate: new Date().toISOString(),
      regulatoryNotes: 'Documentation review in progress. Compliance verification initiated.',
      lastUpdated: new Date().toISOString()
    })
    
    // Update shared storage
    updateBatchInPortal('traceHerbBatches', batchId, {
      status: 'tested',
      testingCompleted: new Date().toISOString(),
      labResults: 'All chemical tests passed. Purity: 98.5%. No contaminants detected.',
      regulatoryReviewStarted: new Date().toISOString(),
      reviewDate: new Date().toISOString(),
      regulatoryNotes: 'Documentation review in progress. Compliance verification initiated.'
    })
    
  }, 15000)
  
  // Step 4: Final approval (after 22 seconds)
  setTimeout(() => {
    console.log('✅ REGULATORY: BATCH APPROVED!')
    
    // Final approval
    updateBatchInPortal('regulatoryBatches', batchId, {
      status: 'approved',
      regulatoryReviewCompleted: new Date().toISOString(),
      approvedDate: new Date().toISOString(),
      finalReviewDate: new Date().toISOString(),
      approvalReason: 'All quality standards met. Documentation complete. Batch cleared for market distribution.',
      finalNotes: 'Excellent quality batch. Recommended for premium market segment.',
      approvedBy: 'Regulatory Portal',
      lastUpdated: new Date().toISOString()
    })
    
    // Update all storages with final approval
    const finalUpdate = {
      status: 'approved',
      regulatoryReviewCompleted: new Date().toISOString(),
      approvedDate: new Date().toISOString(),
      finalReviewDate: new Date().toISOString(),
      approvalReason: 'All quality standards met. Documentation complete. Batch cleared for market distribution.',
      finalNotes: 'Excellent quality batch. Recommended for premium market segment.',
      approvedBy: 'Regulatory Portal'
    }
    
    updateBatchInPortal('traceHerbBatches', batchId, finalUpdate)
    updateBatchInPortal('farmerBatches', batchId, finalUpdate)
    
    console.log('🎉 BATCH APPROVAL COMPLETE! Check the tracking timeline for real-time updates.')
    
  }, 22000)
  
  console.log('⏰ Timeline:')
  console.log('  3s  - Processing starts')
  console.log('  8s  - Lab testing starts') 
  console.log('  15s - Regulatory review starts')
  console.log('  22s - Final approval')
  console.log('')
  console.log('🔍 Watch the batch tracking page for real-time updates!')
}
