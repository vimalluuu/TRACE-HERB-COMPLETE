// Script to add test batch for real-time sync testing
console.log('Adding test batch for real-time sync...')

// Add the specific batch mentioned by user
const testBatch = {
  id: '1758543486967_D7F8868F',
  collectionId: '1758543486967_D7F8868F',
  qrCode: 'QR_COL_1758543486967_D7F8868F',
  botanicalName: 'Curcuma longa',
  commonName: 'Turmeric',
  quantity: '50',
  unit: 'kg',
  farmerName: 'Test Farmer',
  farmLocation: 'Test Farm Location',
  farmSize: '5 acres',
  collectionMethod: 'Hand-picked',
  season: 'Winter 2024',
  weatherConditions: 'Good',
  soilType: 'Clay loam',
  certifications: 'Organic',
  status: 'processed', // Changed from pending to processed to test real-time sync
  rejectionReason: null,
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  testResults: null,
  regulatoryDecision: null,
  regulatoryComments: null,
  regulatoryTimestamp: null,
  processingData: {
    processedBy: 'Test Processor',
    processedAt: new Date().toISOString(),
    method: 'Steam distillation'
  },
  processingTimestamp: new Date().toISOString(),
  labTimestamp: null,
  statusHistory: [
    {
      status: 'pending',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      note: 'Batch created'
    },
    {
      status: 'processing',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      note: 'Picked up by processor'
    },
    {
      status: 'processed',
      timestamp: new Date().toISOString(),
      note: 'Processing completed'
    }
  ],
  synced: true
}

// Add to both storage locations
const existingBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')

// Remove existing batch if present
const filteredExisting = existingBatches.filter(b => b.qrCode !== testBatch.qrCode)
const filteredFarmer = farmerBatches.filter(b => b.qrCode !== testBatch.qrCode)

// Add the test batch
filteredExisting.push(testBatch)
filteredFarmer.push(testBatch)

// Save to localStorage
localStorage.setItem('traceHerbBatches', JSON.stringify(filteredExisting))
localStorage.setItem('farmerBatches', JSON.stringify(filteredFarmer))

// Trigger storage event for real-time updates
window.dispatchEvent(new StorageEvent('storage', {
  key: 'traceHerbBatches',
  newValue: JSON.stringify(filteredExisting)
}))

console.log('✅ Test batch added successfully!')
console.log('Batch Status:', testBatch.status)
console.log('QR Code:', testBatch.qrCode)
console.log('Processing Data:', testBatch.processingData)

// Simulate regulatory approval after 5 seconds
setTimeout(() => {
  console.log('🔄 Simulating regulatory approval...')
  
  testBatch.status = 'approved'
  testBatch.regulatoryDecision = 'approved'
  testBatch.regulatoryComments = 'Quality standards met'
  testBatch.regulatoryTimestamp = new Date().toISOString()
  testBatch.lastUpdated = new Date().toISOString()
  testBatch.statusHistory.push({
    status: 'approved',
    timestamp: new Date().toISOString(),
    note: 'Approved by regulatory authority'
  })
  
  // Update storage
  const currentBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  const currentFarmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  
  const batchIndex = currentBatches.findIndex(b => b.qrCode === testBatch.qrCode)
  const farmerBatchIndex = currentFarmerBatches.findIndex(b => b.qrCode === testBatch.qrCode)
  
  if (batchIndex >= 0) currentBatches[batchIndex] = testBatch
  if (farmerBatchIndex >= 0) currentFarmerBatches[farmerBatchIndex] = testBatch
  
  localStorage.setItem('traceHerbBatches', JSON.stringify(currentBatches))
  localStorage.setItem('farmerBatches', JSON.stringify(currentFarmerBatches))
  
  // Trigger storage event
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'traceHerbBatches',
    newValue: JSON.stringify(currentBatches)
  }))
  
  console.log('✅ Batch approved! Status updated to:', testBatch.status)
}, 5000)
