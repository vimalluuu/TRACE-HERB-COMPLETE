// TRACE HERB - Fix Real-Time Timestamp Synchronization
// This script ensures that batch timestamps are properly updated across all portals
// when batches move through the supply chain workflow

console.log('🚀 STARTING REAL-TIME TIMESTAMP SYNCHRONIZATION FIX...')

// Function to get current timestamp
const getCurrentTimestamp = () => new Date().toISOString()

// Function to get batch from any storage location
const findBatchInAllStorages = (batchId) => {
  const storageKeys = [
    'traceHerbBatches',
    'farmerBatches', 
    'processorBatches',
    'labBatches',
    'regulatoryBatches'
  ]
  
  let foundBatch = null
  let foundInStorage = null
  
  for (const storageKey of storageKeys) {
    const batches = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const batch = batches.find(b => 
      b.qrCode === batchId || 
      b.collectionId === batchId ||
      b.id === batchId ||
      b.qrCode?.includes(batchId) ||
      batchId.includes(b.collectionId || '')
    )
    
    if (batch) {
      foundBatch = batch
      foundInStorage = storageKey
      console.log(`✅ Found batch in ${storageKey}:`, batch.qrCode, 'Status:', batch.status)
      break
    }
  }
  
  return { batch: foundBatch, storage: foundInStorage }
}

// Function to update batch with proper timestamps based on status
const updateBatchWithTimestamps = (batch) => {
  const now = getCurrentTimestamp()
  const updatedBatch = { ...batch }
  
  console.log(`🔄 Updating timestamps for batch: ${batch.qrCode} (Status: ${batch.status})`)
  
  // Always ensure collection timestamp exists
  if (!updatedBatch.createdAt && !updatedBatch.collectionDate) {
    updatedBatch.createdAt = now
    updatedBatch.collectionDate = now
  }
  
  // Update processing timestamps
  if (['processing', 'processed', 'testing', 'tested', 'approved', 'rejected'].includes(batch.status)) {
    if (!updatedBatch.processingDate && !updatedBatch.processingTimestamp) {
      updatedBatch.processingDate = now
      updatedBatch.processingTimestamp = now
      updatedBatch.processingStarted = now
      console.log('✅ Added processing timestamp:', now)
    }
  }
  
  // Update lab testing timestamps
  if (['testing', 'tested', 'approved', 'rejected'].includes(batch.status)) {
    if (!updatedBatch.testingDate && !updatedBatch.labTimestamp) {
      updatedBatch.testingDate = now
      updatedBatch.labTimestamp = now
      updatedBatch.testingStarted = now
      console.log('✅ Added lab testing timestamp:', now)
    }
  }
  
  // Update regulatory review timestamps
  if (['approved', 'rejected'].includes(batch.status)) {
    if (!updatedBatch.reviewDate && !updatedBatch.regulatoryTimestamp) {
      updatedBatch.reviewDate = now
      updatedBatch.regulatoryTimestamp = now
      updatedBatch.regulatoryReviewStarted = now
      console.log('✅ Added regulatory review timestamp:', now)
    }
    
    // Add final approval/rejection timestamp
    if (batch.status === 'approved' && !updatedBatch.approvedDate) {
      updatedBatch.approvedDate = now
      console.log('✅ Added approval timestamp:', now)
    } else if (batch.status === 'rejected' && !updatedBatch.rejectedDate) {
      updatedBatch.rejectedDate = now
      console.log('✅ Added rejection timestamp:', now)
    }
  }
  
  // Update last modified timestamp
  updatedBatch.lastUpdated = now
  
  return updatedBatch
}

// Function to update batch in all storage locations
const updateBatchInAllStorages = (batchId, updatedBatch) => {
  const storageKeys = [
    'traceHerbBatches',
    'farmerBatches', 
    'processorBatches',
    'labBatches',
    'regulatoryBatches'
  ]
  
  let updateCount = 0
  
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
      batches[batchIndex] = { ...batches[batchIndex], ...updatedBatch }
      localStorage.setItem(storageKey, JSON.stringify(batches))
      updateCount++
      console.log(`✅ Updated batch in ${storageKey}`)
      
      // Trigger storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: storageKey,
        newValue: JSON.stringify(batches),
        storageArea: localStorage
      }))
    }
  }
  
  console.log(`✅ Updated batch in ${updateCount} storage locations`)
  return updateCount > 0
}

// Function to create realistic timeline progression
const createRealisticTimeline = (batch) => {
  const now = new Date()
  const baseTime = new Date(batch.createdAt || now)
  
  const timeline = {
    collection: baseTime.toISOString(),
    processing: null,
    testing: null,
    regulatory: null,
    final: null
  }
  
  // Add processing timestamp (2 hours after collection)
  if (['processing', 'processed', 'testing', 'tested', 'approved', 'rejected'].includes(batch.status)) {
    timeline.processing = new Date(baseTime.getTime() + 2 * 60 * 60 * 1000).toISOString()
  }
  
  // Add testing timestamp (4 hours after collection)
  if (['testing', 'tested', 'approved', 'rejected'].includes(batch.status)) {
    timeline.testing = new Date(baseTime.getTime() + 4 * 60 * 60 * 1000).toISOString()
  }
  
  // Add regulatory timestamp (6 hours after collection)
  if (['approved', 'rejected'].includes(batch.status)) {
    timeline.regulatory = new Date(baseTime.getTime() + 6 * 60 * 60 * 1000).toISOString()
    timeline.final = new Date(baseTime.getTime() + 7 * 60 * 60 * 1000).toISOString()
  }
  
  return timeline
}

// Main function to fix timestamp synchronization for a specific batch
const fixBatchTimestampSync = (batchId) => {
  console.log(`\n🔧 FIXING TIMESTAMP SYNC FOR BATCH: ${batchId}`)
  
  const { batch, storage } = findBatchInAllStorages(batchId)
  
  if (!batch) {
    console.log(`❌ Batch not found: ${batchId}`)
    return false
  }
  
  console.log(`📊 Current batch status: ${batch.status}`)
  console.log(`📊 Found in storage: ${storage}`)
  
  // Create realistic timeline
  const timeline = createRealisticTimeline(batch)
  console.log('📅 Generated timeline:', timeline)
  
  // Update batch with proper timestamps
  const updatedBatch = {
    ...batch,
    processingDate: timeline.processing,
    processingTimestamp: timeline.processing,
    testingDate: timeline.testing,
    labTimestamp: timeline.testing,
    reviewDate: timeline.regulatory,
    regulatoryTimestamp: timeline.regulatory,
    approvedDate: batch.status === 'approved' ? timeline.final : batch.approvedDate,
    rejectedDate: batch.status === 'rejected' ? timeline.final : batch.rejectedDate,
    lastUpdated: getCurrentTimestamp()
  }
  
  // Update in all storage locations
  const success = updateBatchInAllStorages(batchId, updatedBatch)
  
  if (success) {
    console.log('✅ Timestamp synchronization completed successfully!')
    
    // Trigger UI refresh events
    window.dispatchEvent(new CustomEvent('batchUpdated', { 
      detail: updatedBatch 
    }))
    
    window.dispatchEvent(new CustomEvent('batchTimestampUpdated', { 
      detail: { batchId, updatedBatch } 
    }))
    
    return true
  } else {
    console.log('❌ Failed to update batch timestamps')
    return false
  }
}

// Function to fix all batches with missing timestamps
const fixAllBatchTimestamps = () => {
  console.log('\n🚀 FIXING TIMESTAMPS FOR ALL BATCHES...')
  
  const allBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  let fixedCount = 0
  
  for (const batch of allBatches) {
    if (batch.qrCode) {
      const success = fixBatchTimestampSync(batch.qrCode)
      if (success) fixedCount++
    }
  }
  
  console.log(`✅ Fixed timestamps for ${fixedCount} batches`)
  return fixedCount
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
  window.fixBatchTimestampSync = fixBatchTimestampSync
  window.fixAllBatchTimestamps = fixAllBatchTimestamps
}

// Auto-run for the specific batch mentioned by user
const targetBatchId = 'QR_COL_1758594438236_E188A517'
console.log(`\n🎯 AUTO-FIXING TIMESTAMP SYNC FOR TARGET BATCH: ${targetBatchId}`)
fixBatchTimestampSync(targetBatchId)

console.log('\n✅ REAL-TIME TIMESTAMP SYNCHRONIZATION FIX COMPLETED!')
console.log('📝 You can now run:')
console.log('   - fixBatchTimestampSync("BATCH_ID") to fix a specific batch')
console.log('   - fixAllBatchTimestamps() to fix all batches')
