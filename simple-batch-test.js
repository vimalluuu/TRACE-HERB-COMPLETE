// Simple test to add a batch and see if it shows up in farmer portal
// Copy and paste this into the browser console on the farmer portal (http://localhost:3002)

console.log('🌿 Adding a simple test batch...')

// Clear all existing data first
const storageKeys = [
  'traceHerbBatches',
  'farmerBatches', 
  'processorBatches',
  'labBatches',
  'regulatoryBatches',
  'batches'
]

storageKeys.forEach(key => {
  localStorage.removeItem(key)
  console.log(`🗑️ Cleared ${key}`)
})

// Create a simple test batch
const testBatch = {
  id: 'test_batch_001',
  qrCode: 'QR_COL_1758548022698_FC96EBBC',
  commonName: 'Turmeric',
  botanicalName: 'Curcuma longa',
  status: 'approved',
  farmerName: 'Test Farmer',
  location: 'Karnataka, India',
  harvestDate: '2024-01-15',
  quantity: '50 kg',
  qualityGrade: 'Premium',
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  regulatoryComments: 'Excellent quality turmeric. Approved for market.'
}

// Add to all possible storage locations
storageKeys.forEach(key => {
  const batches = [testBatch]
  localStorage.setItem(key, JSON.stringify(batches))
  console.log(`✅ Added batch to ${key}`)
})

// Trigger storage events
storageKeys.forEach(key => {
  window.dispatchEvent(new StorageEvent('storage', {
    key: key,
    newValue: JSON.stringify([testBatch])
  }))
})

console.log('✅ Test batch added to all storage locations!')
console.log('📦 Batch details:', testBatch)
console.log('🔄 The farmer portal should now show this batch!')
console.log('📱 If not visible, try refreshing the page or pulling down to refresh')

// Also force a page reload after 2 seconds
setTimeout(() => {
  console.log('🔄 Force reloading page to ensure batch appears...')
  window.location.reload()
}, 2000)
