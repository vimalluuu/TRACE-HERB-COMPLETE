// TRACE HERB - Setup Portal Timestamp Automation
// This script sets up automatic timestamp updates when batches are processed in different portals

console.log('🚀 SETTING UP PORTAL TIMESTAMP AUTOMATION...')

// Function to get current timestamp
const getCurrentTimestamp = () => new Date().toISOString()

// Function to update batch with portal-specific timestamp
const updateBatchWithPortalTimestamp = (batchId, portalType, additionalData = {}) => {
  console.log(`🔄 Updating ${portalType} timestamp for batch: ${batchId}`)
  
  const storageKeys = [
    'traceHerbBatches',
    'farmerBatches', 
    'processorBatches',
    'labBatches',
    'regulatoryBatches'
  ]
  
  const now = getCurrentTimestamp()
  let updateCount = 0
  
  // Determine timestamp fields based on portal type
  let timestampFields = {}
  
  switch (portalType) {
    case 'processor':
      timestampFields = {
        processingDate: now,
        processingTimestamp: now,
        processingStarted: now,
        processingNotes: additionalData.notes || 'Processing completed by processor portal',
        ...additionalData
      }
      break
      
    case 'lab':
      timestampFields = {
        testingDate: now,
        labTimestamp: now,
        testingStarted: now,
        testingNotes: additionalData.notes || 'Lab testing completed',
        labResults: additionalData.results || 'Testing completed successfully',
        ...additionalData
      }
      break
      
    case 'regulatory':
      timestampFields = {
        reviewDate: now,
        regulatoryTimestamp: now,
        regulatoryReviewStarted: now,
        regulatoryNotes: additionalData.notes || 'Regulatory review completed',
        ...additionalData
      }
      
      // Add approval/rejection timestamp
      if (additionalData.status === 'approved') {
        timestampFields.approvedDate = now
        timestampFields.approvalReason = additionalData.reason || 'All requirements met'
      } else if (additionalData.status === 'rejected') {
        timestampFields.rejectedDate = now
        timestampFields.rejectionReason = additionalData.reason || 'Failed to meet requirements'
      }
      break
  }
  
  // Update batch in all storage locations
  for (const storageKey of storageKeys) {
    const batches = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const batchIndex = batches.findIndex(b => 
      b.qrCode === batchId || 
      b.collectionId === batchId ||
      b.id === batchId ||
      b.qrCode?.includes(batchId) ||
      batchId.includes(b.collectionId || '')
    )
    
    if (batchIndex >= 0) {
      batches[batchIndex] = { 
        ...batches[batchIndex], 
        ...timestampFields,
        lastUpdated: now
      }
      localStorage.setItem(storageKey, JSON.stringify(batches))
      updateCount++
      console.log(`✅ Updated ${portalType} timestamp in ${storageKey}`)
      
      // Trigger storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: storageKey,
        newValue: JSON.stringify(batches),
        storageArea: localStorage
      }))
    }
  }
  
  console.log(`✅ Updated ${portalType} timestamp in ${updateCount} storage locations`)
  return updateCount > 0
}

// Function to simulate processor completing a batch
const simulateProcessorCompletion = (batchId, processorData = {}) => {
  console.log(`🏭 PROCESSOR: Completing batch ${batchId}`)
  
  const defaultData = {
    status: 'processed',
    notes: 'Quality check completed. Batch approved for lab testing.',
    processor: 'ABC Processing Ltd',
    method: 'Steam distillation',
    yield: '85%',
    quality: 'Premium Grade'
  }
  
  return updateBatchWithPortalTimestamp(batchId, 'processor', { ...defaultData, ...processorData })
}

// Function to simulate lab completing testing
const simulateLabCompletion = (batchId, labData = {}) => {
  console.log(`🧪 LAB: Completing testing for batch ${batchId}`)
  
  const defaultData = {
    status: 'tested',
    notes: 'All lab tests completed successfully',
    results: {
      purity: '98.5%',
      moisture: '8.2%',
      contaminants: 'None detected',
      grade: 'A+',
      lab: 'Quality Labs India'
    },
    testType: 'Comprehensive Analysis',
    labTechnician: 'Dr. Smith'
  }
  
  return updateBatchWithPortalTimestamp(batchId, 'lab', { ...defaultData, ...labData })
}

// Function to simulate regulatory approval/rejection
const simulateRegulatoryDecision = (batchId, decision = 'approved', regulatoryData = {}) => {
  console.log(`📋 REGULATORY: Making ${decision} decision for batch ${batchId}`)
  
  const defaultData = {
    status: decision,
    notes: decision === 'approved' 
      ? 'All regulatory requirements met. Batch approved for distribution.'
      : 'Failed to meet regulatory standards. Batch rejected.',
    reason: decision === 'approved'
      ? 'Complies with all quality and safety standards'
      : 'Quality standards not met',
    reviewer: 'Regulatory Officer',
    complianceCheck: decision === 'approved' ? 'Passed' : 'Failed'
  }
  
  return updateBatchWithPortalTimestamp(batchId, 'regulatory', { ...defaultData, ...regulatoryData })
}

// Function to create a complete workflow progression for a batch
const simulateCompleteWorkflow = (batchId, delayBetweenSteps = 2000) => {
  console.log(`\n🔄 SIMULATING COMPLETE WORKFLOW FOR BATCH: ${batchId}`)
  
  // Step 1: Processor completion (immediate)
  setTimeout(() => {
    simulateProcessorCompletion(batchId)
  }, 0)
  
  // Step 2: Lab testing completion (after delay)
  setTimeout(() => {
    simulateLabCompletion(batchId)
  }, delayBetweenSteps)
  
  // Step 3: Regulatory approval (after another delay)
  setTimeout(() => {
    simulateRegulatoryDecision(batchId, 'approved')
  }, delayBetweenSteps * 2)
  
  console.log(`✅ Complete workflow simulation started for ${batchId}`)
  console.log(`⏱️ Total completion time: ${(delayBetweenSteps * 2) / 1000} seconds`)
}

// Function to setup automatic timestamp updates for portal actions
const setupPortalAutomation = () => {
  console.log('🔧 SETTING UP PORTAL AUTOMATION...')
  
  // Listen for processor actions
  window.addEventListener('processorAction', (event) => {
    const { batchId, action, data } = event.detail
    if (action === 'complete' || action === 'approve') {
      simulateProcessorCompletion(batchId, data)
    }
  })
  
  // Listen for lab actions
  window.addEventListener('labAction', (event) => {
    const { batchId, action, data } = event.detail
    if (action === 'complete' || action === 'test') {
      simulateLabCompletion(batchId, data)
    }
  })
  
  // Listen for regulatory actions
  window.addEventListener('regulatoryAction', (event) => {
    const { batchId, action, decision, data } = event.detail
    if (action === 'decide' || action === 'review') {
      simulateRegulatoryDecision(batchId, decision || 'approved', data)
    }
  })
  
  console.log('✅ Portal automation event listeners setup complete')
}

// Function to trigger portal actions for existing batches
const triggerPortalActionsForExistingBatches = () => {
  console.log('\n🔄 TRIGGERING PORTAL ACTIONS FOR EXISTING BATCHES...')
  
  const allBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  let processedCount = 0
  
  for (const batch of allBatches) {
    if (batch.qrCode && batch.status !== 'approved' && batch.status !== 'rejected') {
      console.log(`🔄 Processing batch: ${batch.qrCode} (Current status: ${batch.status})`)
      
      // Simulate complete workflow with staggered timing
      setTimeout(() => {
        simulateCompleteWorkflow(batch.qrCode, 1000)
      }, processedCount * 3000) // Stagger by 3 seconds per batch
      
      processedCount++
    }
  }
  
  console.log(`✅ Triggered portal actions for ${processedCount} batches`)
}

// Export functions for global use
if (typeof window !== 'undefined') {
  window.simulateProcessorCompletion = simulateProcessorCompletion
  window.simulateLabCompletion = simulateLabCompletion
  window.simulateRegulatoryDecision = simulateRegulatoryDecision
  window.simulateCompleteWorkflow = simulateCompleteWorkflow
  window.setupPortalAutomation = setupPortalAutomation
  window.triggerPortalActionsForExistingBatches = triggerPortalActionsForExistingBatches
}

// Auto-setup
setupPortalAutomation()

// Auto-trigger for the specific batch mentioned by user
const targetBatchId = 'QR_COL_1758594438236_E188A517'
console.log(`\n🎯 AUTO-TRIGGERING COMPLETE WORKFLOW FOR TARGET BATCH: ${targetBatchId}`)
simulateCompleteWorkflow(targetBatchId, 1500)

console.log('\n✅ PORTAL TIMESTAMP AUTOMATION SETUP COMPLETED!')
console.log('📝 Available functions:')
console.log('   - simulateProcessorCompletion("BATCH_ID")')
console.log('   - simulateLabCompletion("BATCH_ID")')
console.log('   - simulateRegulatoryDecision("BATCH_ID", "approved")')
console.log('   - simulateCompleteWorkflow("BATCH_ID")')
console.log('   - triggerPortalActionsForExistingBatches()')
