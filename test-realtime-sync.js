// Test script for real-time batch status synchronization
console.log('🧪 Testing Real-Time Batch Status Sync...')

// Add the user's specific batch with different statuses to test sync
const userBatch = {
  id: '1758543486967_D7F8868F',
  collectionId: '1758543486967_D7F8868F',
  qrCode: 'QR_COL_1758543486967_D7F8868F',
  botanicalName: 'Curcuma longa',
  commonName: 'Turmeric',
  quantity: '25',
  unit: 'kg',
  farmerName: 'Test Farmer',
  farmLocation: 'Karnataka, India',
  farmSize: '3 acres',
  collectionMethod: 'Hand-picked',
  season: 'Winter 2024',
  weatherConditions: 'Excellent',
  soilType: 'Red soil',
  certifications: 'Organic, Fair Trade',
  status: 'pending', // Start with pending
  rejectionReason: null,
  createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  lastUpdated: new Date().toISOString(),
  testResults: null,
  regulatoryDecision: null,
  regulatoryComments: null,
  regulatoryTimestamp: null,
  processingData: null,
  processingTimestamp: null,
  labTimestamp: null,
  statusHistory: [
    {
      status: 'pending',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      note: 'Batch created and submitted'
    }
  ],
  synced: true
}

// Function to update batch status and trigger real-time sync
function updateBatchStatus(newStatus, additionalData = {}) {
  console.log(`🔄 Updating batch status to: ${newStatus}`)
  
  userBatch.status = newStatus
  userBatch.lastUpdated = new Date().toISOString()
  
  // Add status-specific data
  if (additionalData.processingData) {
    userBatch.processingData = additionalData.processingData
    userBatch.processingTimestamp = new Date().toISOString()
  }
  
  if (additionalData.testResults) {
    userBatch.testResults = additionalData.testResults
    userBatch.labTimestamp = new Date().toISOString()
  }
  
  if (additionalData.regulatoryDecision) {
    userBatch.regulatoryDecision = additionalData.regulatoryDecision
    userBatch.regulatoryComments = additionalData.regulatoryComments
    userBatch.regulatoryTimestamp = new Date().toISOString()
  }
  
  if (additionalData.rejectionReason) {
    userBatch.rejectionReason = additionalData.rejectionReason
  }
  
  // Add to status history
  userBatch.statusHistory.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: additionalData.note || `Status updated to ${newStatus}`
  })
  
  // Update localStorage
  const existingBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  
  // Remove existing batch if present
  const filteredExisting = existingBatches.filter(b => b.qrCode !== userBatch.qrCode)
  const filteredFarmer = farmerBatches.filter(b => b.qrCode !== userBatch.qrCode)
  
  // Add updated batch
  filteredExisting.push(userBatch)
  filteredFarmer.push(userBatch)
  
  // Save to localStorage
  localStorage.setItem('traceHerbBatches', JSON.stringify(filteredExisting))
  localStorage.setItem('farmerBatches', JSON.stringify(filteredFarmer))
  
  // Trigger storage event for real-time updates
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'traceHerbBatches',
    newValue: JSON.stringify(filteredExisting)
  }))
  
  console.log(`✅ Batch status updated to: ${newStatus}`)
  return userBatch
}

// Initial batch creation
console.log('📝 Adding initial batch...')
updateBatchStatus('pending', { note: 'Batch created and ready for processing' })

// Simulate the complete workflow with delays
setTimeout(() => {
  updateBatchStatus('processing', { 
    note: 'Picked up by processor',
    processingData: { processor: 'ABC Processing Ltd', method: 'Steam distillation' }
  })
}, 3000)

setTimeout(() => {
  updateBatchStatus('processed', { 
    note: 'Processing completed successfully',
    processingData: { 
      processor: 'ABC Processing Ltd', 
      method: 'Steam distillation',
      yield: '85%',
      quality: 'Premium'
    }
  })
}, 6000)

setTimeout(() => {
  updateBatchStatus('testing', { 
    note: 'Sent to laboratory for quality testing'
  })
}, 9000)

setTimeout(() => {
  updateBatchStatus('tested', { 
    note: 'Laboratory testing completed',
    testResults: {
      purity: '98.5%',
      moisture: '8.2%',
      contaminants: 'None detected',
      grade: 'A+',
      lab: 'Quality Labs India'
    }
  })
}, 12000)

setTimeout(() => {
  updateBatchStatus('approved', { 
    note: 'Approved by regulatory authority',
    regulatoryDecision: 'approved',
    regulatoryComments: 'Excellent quality, meets all standards'
  })
}, 15000)

console.log('🚀 Real-time sync test started!')
console.log('Watch the farmer dashboard for live status updates every 3 seconds')
console.log('Status flow: pending → processing → processed → testing → tested → approved')
