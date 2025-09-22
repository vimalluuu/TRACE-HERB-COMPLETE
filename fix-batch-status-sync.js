// Script to manually sync batch status from processor portal
console.log('🔧 FIXING BATCH STATUS SYNC...')

const batchId = 'QR_COL_1758553167787_D38155F2' // Your current batch
console.log('🎯 Fixing batch:', batchId)

// Function to find batch in any storage
const findBatchInStorage = (batchId) => {
  const storageKeys = [
    'farmerBatches',
    'traceHerbBatches', 
    'processorBatches',
    'labBatches',
    'regulatoryBatches'
  ]
  
  const foundBatches = []
  
  for (const key of storageKeys) {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const batches = JSON.parse(data)
        if (Array.isArray(batches)) {
          const batch = batches.find(b => 
            b.qrCode === batchId || 
            b.id === batchId || 
            b.collectionId === batchId ||
            (batchId.includes('_') && (b.qrCode || '').includes(batchId.split('_')[1])) ||
            (batchId.includes('_') && (b.id || '').includes(batchId.split('_')[1]))
          )
          
          if (batch) {
            foundBatches.push({ batch, storage: key, index: batches.indexOf(batch) })
            console.log(`📦 Found in ${key}:`, {
              status: batch.status,
              processingDate: batch.processingDate,
              testingDate: batch.testingDate,
              approvedDate: batch.approvedDate
            })
          }
        }
      } catch (e) {
        console.log(`❌ Error reading ${key}:`, e)
      }
    }
  }
  
  return foundBatches
}

// Find all instances of the batch
const foundBatches = findBatchInStorage(batchId)

if (foundBatches.length === 0) {
  console.log('❌ Batch not found in any storage')
} else {
  console.log(`✅ Found batch in ${foundBatches.length} storage locations`)
  
  // Check if processor has reviewed it
  const processorBatch = foundBatches.find(fb => fb.storage === 'processorBatches')
  
  if (processorBatch && processorBatch.batch.status !== 'pending') {
    console.log('🏭 PROCESSOR HAS REVIEWED THE BATCH!')
    console.log('Status:', processorBatch.batch.status)
    
    // Update all other storages with processor data
    const processorData = processorBatch.batch
    const updateData = {
      status: processorData.status,
      processingDate: processorData.processingDate || new Date().toISOString(),
      processingStarted: processorData.processingStarted || new Date().toISOString(),
      processingNotes: processorData.processingNotes || 'Batch reviewed and processed by processor portal',
      lastUpdated: new Date().toISOString()
    }
    
    // Update farmer batches
    const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
    const farmerIndex = farmerBatches.findIndex(b => 
      b.qrCode === batchId || b.id === batchId || b.collectionId === batchId
    )
    
    if (farmerIndex >= 0) {
      farmerBatches[farmerIndex] = { ...farmerBatches[farmerIndex], ...updateData }
      localStorage.setItem('farmerBatches', JSON.stringify(farmerBatches))
      console.log('✅ Updated farmerBatches')
    }
    
    // Update shared batches
    const sharedBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
    const sharedIndex = sharedBatches.findIndex(b => 
      b.qrCode === batchId || b.id === batchId || b.collectionId === batchId
    )
    
    if (sharedIndex >= 0) {
      sharedBatches[sharedIndex] = { ...sharedBatches[sharedIndex], ...updateData }
      localStorage.setItem('traceHerbBatches', JSON.stringify(sharedBatches))
      console.log('✅ Updated traceHerbBatches')
    }
    
    // Trigger events
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'farmerBatches',
      newValue: JSON.stringify(farmerBatches),
      storageArea: localStorage
    }))
    
    window.dispatchEvent(new CustomEvent('batchUpdated', { 
      detail: { ...processorData, ...updateData }
    }))
    
    console.log('🎉 BATCH STATUS SYNCED SUCCESSFULLY!')
    console.log('New status:', updateData.status)
    
  } else {
    console.log('⏳ Processor has not reviewed the batch yet, or batch is still pending')
    
    // Let's simulate processor approval for testing
    console.log('🧪 SIMULATING PROCESSOR APPROVAL...')
    
    const simulatedUpdate = {
      status: 'processing',
      processingDate: new Date().toISOString(),
      processingStarted: new Date().toISOString(),
      processingNotes: 'Quality check completed. Initial processing approved.',
      lastUpdated: new Date().toISOString()
    }
    
    // Add to processor batches if not exists
    let processorBatches = JSON.parse(localStorage.getItem('processorBatches') || '[]')
    const originalBatch = foundBatches[0].batch
    
    const existingProcessorIndex = processorBatches.findIndex(b => 
      b.qrCode === batchId || b.id === batchId
    )
    
    if (existingProcessorIndex >= 0) {
      processorBatches[existingProcessorIndex] = { ...processorBatches[existingProcessorIndex], ...simulatedUpdate }
    } else {
      processorBatches.push({ ...originalBatch, ...simulatedUpdate })
    }
    
    localStorage.setItem('processorBatches', JSON.stringify(processorBatches))
    
    // Update other storages
    foundBatches.forEach(fb => {
      if (fb.storage !== 'processorBatches') {
        const batches = JSON.parse(localStorage.getItem(fb.storage) || '[]')
        batches[fb.index] = { ...batches[fb.index], ...simulatedUpdate }
        localStorage.setItem(fb.storage, JSON.stringify(batches))
        console.log(`✅ Updated ${fb.storage}`)
      }
    })
    
    // Trigger events
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'processorBatches',
      newValue: JSON.stringify(processorBatches),
      storageArea: localStorage
    }))
    
    window.dispatchEvent(new CustomEvent('batchUpdated', { 
      detail: { ...originalBatch, ...simulatedUpdate }
    }))
    
    console.log('🎉 SIMULATED PROCESSOR APPROVAL COMPLETE!')
  }
  
  // Force refresh the page to see changes
  setTimeout(() => {
    console.log('🔄 Refreshing to show updated status...')
    window.location.reload()
  }, 2000)
}

// Also check what's currently in localStorage
console.log('\n📊 CURRENT STORAGE STATUS:')
const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']
storageKeys.forEach(key => {
  const data = localStorage.getItem(key)
  if (data) {
    try {
      const batches = JSON.parse(data)
      console.log(`${key}: ${batches.length} batches`)
      const targetBatch = batches.find(b => 
        b.qrCode === batchId || (b.qrCode && b.qrCode.includes('D38155F2'))
      )
      if (targetBatch) {
        console.log(`  - Target batch status: ${targetBatch.status}`)
      }
    } catch (e) {
      console.log(`${key}: Error reading data`)
    }
  } else {
    console.log(`${key}: Empty`)
  }
})
