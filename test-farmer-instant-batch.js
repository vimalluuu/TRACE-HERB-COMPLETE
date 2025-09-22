// Test script to verify instant batch loading in farmer portal
console.log('🧪 Testing Farmer Portal Instant Batch Loading...')

// Create a test batch that should appear instantly
const testBatch = {
  id: 'COL_1758550427695_4790B62D',
  collectionId: 'COL_1758550427695_4790B62D',
  qrCode: 'QR_COL_1758550427695_4790B62D',
  botanicalName: 'Curcuma longa',
  commonName: 'Turmeric',
  ayurvedicName: 'Haridra',
  partUsed: 'Rhizome',
  quantity: '50',
  unit: 'kg',
  farmerName: 'Test Farmer',
  status: 'pending',
  createdAt: new Date().toISOString(),
  location: {
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'Bangalore, Karnataka'
  },
  collectionMethod: 'Hand-picked',
  season: 'Post-monsoon',
  weatherConditions: 'Sunny',
  soilType: 'Red soil',
  notes: 'High quality turmeric with good color'
}

// Add to farmer batches
const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
const existingIndex = farmerBatches.findIndex(b => b.qrCode === testBatch.qrCode)

if (existingIndex >= 0) {
  farmerBatches[existingIndex] = testBatch
  console.log('✅ Updated existing batch in farmerBatches')
} else {
  farmerBatches.push(testBatch)
  console.log('✅ Added new batch to farmerBatches')
}

localStorage.setItem('farmerBatches', JSON.stringify(farmerBatches))

// Add to shared batches
const sharedBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
const existingSharedIndex = sharedBatches.findIndex(b => b.qrCode === testBatch.qrCode)

if (existingSharedIndex >= 0) {
  sharedBatches[existingSharedIndex] = testBatch
  console.log('✅ Updated existing batch in traceHerbBatches')
} else {
  sharedBatches.push(testBatch)
  console.log('✅ Added new batch to traceHerbBatches')
}

localStorage.setItem('traceHerbBatches', JSON.stringify(sharedBatches))

// Trigger the custom event
window.dispatchEvent(new CustomEvent('batchAdded', { detail: testBatch }))
console.log('🎉 Batch added event dispatched!')

// Trigger storage event
window.dispatchEvent(new StorageEvent('storage', {
  key: 'farmerBatches',
  newValue: JSON.stringify(farmerBatches),
  storageArea: localStorage
}))

console.log('📊 Test batch created and events triggered!')
console.log('🔍 Batch QR Code:', testBatch.qrCode)
console.log('📦 Total farmer batches:', farmerBatches.length)
console.log('📦 Total shared batches:', sharedBatches.length)

// Test different statuses
const statusTests = [
  { ...testBatch, qrCode: 'QR_COL_TEST_PROCESSING', status: 'processing' },
  { ...testBatch, qrCode: 'QR_COL_TEST_TESTING', status: 'testing' },
  { ...testBatch, qrCode: 'QR_COL_TEST_APPROVED', status: 'approved', approvalReason: 'Excellent quality, all tests passed' },
  { ...testBatch, qrCode: 'QR_COL_TEST_REJECTED', status: 'rejected', rejectionReason: 'Contamination detected in lab tests' }
]

statusTests.forEach(batch => {
  farmerBatches.push(batch)
  sharedBatches.push(batch)
})

localStorage.setItem('farmerBatches', JSON.stringify(farmerBatches))
localStorage.setItem('traceHerbBatches', JSON.stringify(sharedBatches))

console.log('✅ Added test batches with different statuses')
console.log('🎯 Total batches now:', farmerBatches.length)

// Force a page refresh to see the changes
setTimeout(() => {
  console.log('🔄 Refreshing page to show instant loading...')
  window.location.reload()
}, 1000)
