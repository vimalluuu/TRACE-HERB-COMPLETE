// Script to update the specific batch status that user mentioned
console.log('🔄 Updating batch status for COL_1758545983060_62E8E47A...')

const batchQRCode = 'QR_COL_1758545983060_62E8E47A'
const batchId = 'COL_1758545983060_62E8E47A'

// Function to update batch across all storage locations
function updateBatchStatus(qrCode, updates) {
  console.log(`🔄 Updating batch ${qrCode} with status: ${updates.status}`)
  
  // Update in traceHerbBatches (main storage)
  const traceHerbBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  const traceIndex = traceHerbBatches.findIndex(b => b.qrCode === qrCode || b.collectionId === batchId)
  
  if (traceIndex >= 0) {
    traceHerbBatches[traceIndex] = { ...traceHerbBatches[traceIndex], ...updates }
    localStorage.setItem('traceHerbBatches', JSON.stringify(traceHerbBatches))
    console.log('✅ Updated traceHerbBatches')
  } else {
    // Create new batch if not found
    const newBatch = {
      id: batchId,
      collectionId: batchId,
      qrCode: qrCode,
      botanicalName: 'ash',
      commonName: 'ash',
      quantity: '0.1',
      unit: 'kg',
      farmerName: 'N/A',
      farmLocation: '',
      farmSize: '0 acres',
      collectionMethod: 'Cultivated',
      season: 'Spring',
      weatherConditions: 'ads',
      soilType: 'Loamy',
      certifications: 'None',
      createdAt: '2025-09-22T18:29:43.000Z',
      ...updates
    }
    traceHerbBatches.push(newBatch)
    localStorage.setItem('traceHerbBatches', JSON.stringify(traceHerbBatches))
    console.log('✅ Created new batch in traceHerbBatches')
  }
  
  // Update in farmerBatches
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  const farmerIndex = farmerBatches.findIndex(b => b.qrCode === qrCode || b.collectionId === batchId)
  
  if (farmerIndex >= 0) {
    farmerBatches[farmerIndex] = { ...farmerBatches[farmerIndex], ...updates }
    localStorage.setItem('farmerBatches', JSON.stringify(farmerBatches))
    console.log('✅ Updated farmerBatches')
  } else {
    // Create new batch if not found
    const newBatch = {
      id: batchId,
      collectionId: batchId,
      qrCode: qrCode,
      botanicalName: 'ash',
      commonName: 'ash',
      quantity: '0.1',
      unit: 'kg',
      farmerName: 'N/A',
      farmLocation: '',
      farmSize: '0 acres',
      collectionMethod: 'Cultivated',
      season: 'Spring',
      weatherConditions: 'ads',
      soilType: 'Loamy',
      certifications: 'None',
      createdAt: '2025-09-22T18:29:43.000Z',
      ...updates
    }
    farmerBatches.push(newBatch)
    localStorage.setItem('farmerBatches', JSON.stringify(farmerBatches))
    console.log('✅ Created new batch in farmerBatches')
  }
  
  // Simulate processor portal storage
  const processorBatches = JSON.parse(localStorage.getItem('processorBatches') || '[]')
  const processorIndex = processorBatches.findIndex(b => b.qrCode === qrCode || b.collectionId === batchId)
  
  if (updates.status === 'processed' || updates.status === 'processing') {
    const processorBatch = {
      id: batchId,
      collectionId: batchId,
      qrCode: qrCode,
      status: updates.status,
      processingData: updates.processingData || {
        processor: 'ABC Processing Ltd',
        method: 'Steam distillation',
        timestamp: new Date().toISOString()
      },
      processingTimestamp: updates.processingTimestamp || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
    
    if (processorIndex >= 0) {
      processorBatches[processorIndex] = { ...processorBatches[processorIndex], ...processorBatch }
    } else {
      processorBatches.push(processorBatch)
    }
    localStorage.setItem('processorBatches', JSON.stringify(processorBatches))
    console.log('✅ Updated processorBatches')
  }
  
  // Simulate lab portal storage
  const labBatches = JSON.parse(localStorage.getItem('labBatches') || '[]')
  const labIndex = labBatches.findIndex(b => b.qrCode === qrCode || b.collectionId === batchId)
  
  if (updates.status === 'tested' || updates.status === 'testing') {
    const labBatch = {
      id: batchId,
      collectionId: batchId,
      qrCode: qrCode,
      status: updates.status,
      testResults: updates.testResults || {
        purity: '98.5%',
        moisture: '8.2%',
        contaminants: 'None detected',
        grade: 'A+',
        lab: 'Quality Labs India'
      },
      labTimestamp: updates.labTimestamp || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
    
    if (labIndex >= 0) {
      labBatches[labIndex] = { ...labBatches[labIndex], ...labBatch }
    } else {
      labBatches.push(labBatch)
    }
    localStorage.setItem('labBatches', JSON.stringify(labBatches))
    console.log('✅ Updated labBatches')
  }
  
  // Simulate regulatory portal storage
  const regulatoryBatches = JSON.parse(localStorage.getItem('regulatoryBatches') || '[]')
  const regulatoryIndex = regulatoryBatches.findIndex(b => b.qrCode === qrCode || b.collectionId === batchId)
  
  if (updates.status === 'approved' || updates.status === 'rejected') {
    const regulatoryBatch = {
      id: batchId,
      collectionId: batchId,
      qrCode: qrCode,
      status: updates.status,
      regulatoryDecision: updates.regulatoryDecision || updates.status,
      regulatoryComments: updates.regulatoryComments || 'Regulatory decision made',
      regulatoryTimestamp: updates.regulatoryTimestamp || new Date().toISOString(),
      rejectionReason: updates.rejectionReason || null,
      lastUpdated: new Date().toISOString()
    }
    
    if (regulatoryIndex >= 0) {
      regulatoryBatches[regulatoryIndex] = { ...regulatoryBatches[regulatoryIndex], ...regulatoryBatch }
    } else {
      regulatoryBatches.push(regulatoryBatch)
    }
    localStorage.setItem('regulatoryBatches', JSON.stringify(regulatoryBatches))
    console.log('✅ Updated regulatoryBatches')
  }
  
  // Trigger storage event for real-time updates
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'traceHerbBatches',
    newValue: localStorage.getItem('traceHerbBatches')
  }))
  
  console.log(`✅ Batch ${qrCode} updated to status: ${updates.status}`)
}

// Update the batch through the complete workflow with detailed status updates
console.log('📝 Step 1: Processor Review Started...')
updateBatchStatus(batchQRCode, {
  status: 'processing',
  processingData: {
    processor: 'ABC Processing Ltd',
    method: 'Initial quality assessment',
    status: 'Under review',
    startTime: new Date().toISOString()
  },
  processingTimestamp: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  statusHistory: [
    { status: 'pending', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Batch created and submitted' },
    { status: 'processing', timestamp: new Date().toISOString(), note: 'Currently under processor review - ABC Processing Ltd' }
  ]
})

setTimeout(() => {
  console.log('📝 Step 2: Approved by Processor...')
  updateBatchStatus(batchQRCode, {
    status: 'processed',
    processingData: {
      processor: 'ABC Processing Ltd',
      method: 'Steam distillation',
      yield: '85%',
      quality: 'Premium Grade',
      decision: 'Approved',
      completedTime: new Date().toISOString(),
      notes: 'Excellent quality herbs, processing completed successfully'
    },
    processingTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    statusHistory: [
      { status: 'pending', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Batch created and submitted' },
      { status: 'processing', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Currently under processor review - ABC Processing Ltd' },
      { status: 'processed', timestamp: new Date().toISOString(), note: 'Approved by processor - ABC Processing Ltd. Processing completed successfully.' }
    ]
  })
}, 3000)

setTimeout(() => {
  console.log('📝 Step 3: Currently Under Lab Testing...')
  updateBatchStatus(batchQRCode, {
    status: 'testing',
    labTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    statusHistory: [
      { status: 'pending', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Batch created and submitted' },
      { status: 'processing', timestamp: new Date(Date.now() - 7200000).toISOString(), note: 'Currently under processor review - ABC Processing Ltd' },
      { status: 'processed', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Approved by processor - ABC Processing Ltd. Processing completed successfully.' },
      { status: 'testing', timestamp: new Date().toISOString(), note: 'Currently under lab testing - Quality Labs India conducting analysis' }
    ]
  })
}, 6000)

setTimeout(() => {
  console.log('📝 Step 4: Approved by Laboratory...')
  updateBatchStatus(batchQRCode, {
    status: 'tested',
    testResults: {
      purity: '98.5%',
      moisture: '8.2%',
      contaminants: 'None detected',
      grade: 'A+',
      quality: 'Premium',
      lab: 'Quality Labs India',
      decision: 'Approved',
      testDate: new Date().toISOString(),
      notes: 'Excellent quality parameters, all tests passed'
    },
    labTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    statusHistory: [
      { status: 'pending', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Batch created and submitted' },
      { status: 'processing', timestamp: new Date(Date.now() - 10800000).toISOString(), note: 'Currently under processor review - ABC Processing Ltd' },
      { status: 'processed', timestamp: new Date(Date.now() - 7200000).toISOString(), note: 'Approved by processor - ABC Processing Ltd. Processing completed successfully.' },
      { status: 'testing', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Currently under lab testing - Quality Labs India conducting analysis' },
      { status: 'tested', timestamp: new Date().toISOString(), note: 'Approved by laboratory - Quality Labs India. All quality tests passed successfully.' }
    ]
  })
}, 9000)

setTimeout(() => {
  console.log('📝 Step 5: Approved by Regulatory Authority...')
  updateBatchStatus(batchQRCode, {
    status: 'approved',
    regulatoryDecision: 'approved',
    regulatoryComments: 'Excellent quality herbs, meets all regulatory standards and safety requirements. Approved for market distribution.',
    regulatoryTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    statusHistory: [
      { status: 'pending', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Batch created and submitted' },
      { status: 'processing', timestamp: new Date(Date.now() - 14400000).toISOString(), note: 'Currently under processor review - ABC Processing Ltd' },
      { status: 'processed', timestamp: new Date(Date.now() - 10800000).toISOString(), note: 'Approved by processor - ABC Processing Ltd. Processing completed successfully.' },
      { status: 'testing', timestamp: new Date(Date.now() - 7200000).toISOString(), note: 'Currently under lab testing - Quality Labs India conducting analysis' },
      { status: 'tested', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Approved by laboratory - Quality Labs India. All quality tests passed successfully.' },
      { status: 'approved', timestamp: new Date().toISOString(), note: 'Approved by regulatory authority - Meets all standards and safety requirements. Ready for market distribution.' }
    ]
  })
}, 12000)

console.log('🚀 Batch status update sequence started!')
console.log('Watch the farmer dashboard for live updates every 2 seconds')
console.log('Status flow: pending → processing → processed → testing → tested → approved')
