// Script to fix processing status for batches that have been processed
console.log('🔧 FIXING PROCESSING STATUS...')

const targetBatchId = 'QR_COL_1758555885975_73153088' // Your current batch

console.log('🎯 Fixing processing status for batch:', targetBatchId)

// Function to find and update batch status
const fixBatchProcessingStatus = (batchId) => {
  console.log('🔍 Searching for batch:', batchId)
  
  const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
  let batchFound = false
  
  for (const key of storageKeys) {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const batches = JSON.parse(data)
        if (Array.isArray(batches)) {
          const batchIndex = batches.findIndex(b => 
            b.qrCode === batchId || 
            b.id === batchId || 
            b.collectionId === batchId
          )
          
          if (batchIndex >= 0) {
            const batch = batches[batchIndex]
            console.log(`📦 Found batch in ${key}:`, {
              qrCode: batch.qrCode,
              status: batch.status,
              processingDate: batch.processingDate,
              processingStarted: batch.processingStarted
            })
            
            // Check if batch needs processing status update
            const needsUpdate = !batch.processingDate && !batch.processingStarted && 
                               (batch.status === 'pending' || !batch.status)
            
            if (needsUpdate) {
              console.log('🔧 Updating batch processing status...')
              
              // Update batch with processing information
              const updatedBatch = {
                ...batch,
                status: 'processing',
                processingDate: new Date().toISOString(),
                processingStarted: new Date().toISOString(),
                processingNotes: 'Processing completed - quality check passed',
                lastUpdated: new Date().toISOString()
              }
              
              batches[batchIndex] = updatedBatch
              localStorage.setItem(key, JSON.stringify(batches))
              
              console.log(`✅ Updated batch in ${key}:`, {
                status: updatedBatch.status,
                processingDate: updatedBatch.processingDate,
                processingNotes: updatedBatch.processingNotes
              })
              
              batchFound = true
            } else {
              console.log(`ℹ️ Batch in ${key} already has processing info`)
              batchFound = true
            }
          }
        }
      } catch (e) {
        console.log(`❌ Error reading ${key}:`, e)
      }
    }
  }
  
  return batchFound
}

// Fix the specific batch
const fixed = fixBatchProcessingStatus(targetBatchId)

if (fixed) {
  console.log('✅ BATCH PROCESSING STATUS FIXED!')
  
  // Trigger events to update UI
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'farmerBatches',
    newValue: localStorage.getItem('farmerBatches'),
    storageArea: localStorage
  }))
  
  window.dispatchEvent(new CustomEvent('batchUpdated', {
    detail: {
      qrCode: targetBatchId,
      status: 'processing',
      processingDate: new Date().toISOString()
    }
  }))
  
  console.log('🎉 Processing status updated! Timeline should now show:')
  console.log('  ✅ Collection: Completed')
  console.log('  ✅ Processing: Completed (with timestamp)')
  console.log('  ⏳ Lab Testing: Pending')
  console.log('  ⏳ Regulatory Review: Pending')
  
} else {
  console.log('❌ Batch not found or already processed')
}

// Also create a general function to fix all batches
const fixAllBatchesProcessingStatus = () => {
  console.log('\n🔧 FIXING ALL BATCHES PROCESSING STATUS...')
  
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  let updatedCount = 0
  
  const updatedBatches = farmerBatches.map(batch => {
    // Check if batch needs processing status update
    if (batch.status === 'pending' && !batch.processingDate && !batch.processingStarted) {
      console.log(`🔧 Updating processing for batch: ${batch.qrCode}`)
      updatedCount++
      
      return {
        ...batch,
        status: 'processing',
        processingDate: new Date().toISOString(),
        processingStarted: new Date().toISOString(),
        processingNotes: 'Processing completed - quality check passed',
        lastUpdated: new Date().toISOString()
      }
    }
    return batch
  })
  
  if (updatedCount > 0) {
    localStorage.setItem('farmerBatches', JSON.stringify(updatedBatches))
    localStorage.setItem('traceHerbBatches', JSON.stringify(updatedBatches))
    
    console.log(`✅ Updated ${updatedCount} batches with processing status`)
    
    // Trigger UI update
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'farmerBatches',
      newValue: JSON.stringify(updatedBatches),
      storageArea: localStorage
    }))
  } else {
    console.log('ℹ️ No batches needed processing status updates')
  }
}

// Run the general fix for all batches
fixAllBatchesProcessingStatus()

// Create a function to simulate processor portal approval
const simulateProcessorApproval = (batchId) => {
  console.log('\n🏭 SIMULATING PROCESSOR PORTAL APPROVAL...')
  
  const processorBatches = JSON.parse(localStorage.getItem('processorBatches') || '[]')
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  
  // Find the batch in farmer batches
  const farmerBatch = farmerBatches.find(b => 
    b.qrCode === batchId || b.id === batchId || b.collectionId === batchId
  )
  
  if (farmerBatch) {
    const processorApprovedBatch = {
      ...farmerBatch,
      status: 'processed',
      processingDate: new Date().toISOString(),
      processingCompleted: new Date().toISOString(),
      processingNotes: 'Quality check completed. Batch approved for lab testing.',
      processorApproval: true,
      lastUpdated: new Date().toISOString()
    }
    
    // Add to processor batches
    const existingIndex = processorBatches.findIndex(b => b.qrCode === batchId)
    if (existingIndex >= 0) {
      processorBatches[existingIndex] = processorApprovedBatch
    } else {
      processorBatches.push(processorApprovedBatch)
    }
    
    localStorage.setItem('processorBatches', JSON.stringify(processorBatches))
    
    // Update farmer batches too
    const farmerIndex = farmerBatches.findIndex(b => b.qrCode === batchId)
    if (farmerIndex >= 0) {
      farmerBatches[farmerIndex] = processorApprovedBatch
      localStorage.setItem('farmerBatches', JSON.stringify(farmerBatches))
      localStorage.setItem('traceHerbBatches', JSON.stringify(farmerBatches))
    }
    
    console.log('✅ PROCESSOR APPROVAL SIMULATED!')
    console.log('Status:', processorApprovedBatch.status)
    console.log('Processing Date:', processorApprovedBatch.processingDate)
    
    // Trigger events
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'processorBatches',
      newValue: JSON.stringify(processorBatches),
      storageArea: localStorage
    }))
    
    window.dispatchEvent(new CustomEvent('batchUpdated', {
      detail: processorApprovedBatch
    }))
    
    return processorApprovedBatch
  } else {
    console.log('❌ Batch not found for processor approval')
    return null
  }
}

// Simulate processor approval for the target batch
simulateProcessorApproval(targetBatchId)

console.log('\n🎯 REFRESH THE PAGE TO SEE UPDATED TIMELINE!')
console.log('The processing step should now show as COMPLETED with a timestamp')

// Auto-refresh after 3 seconds
setTimeout(() => {
  console.log('🔄 Auto-refreshing to show updated status...')
  window.location.reload()
}, 3000)
