// Direct batch addition script - run this in farmer portal console
// This will directly add a batch and force the UI to update

console.log('🌿 DIRECT BATCH ADDITION - FARMER PORTAL')

// Step 1: Clear everything first
console.log('🗑️ Clearing all existing data...')
localStorage.clear()

// Step 2: Create a simple batch
const batch = {
  id: 'direct_batch_001',
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
  regulatoryComments: 'Excellent quality. Approved for market.'
}

console.log('📦 Created batch:', batch)

// Step 3: Add to all possible storage locations
const storageLocations = [
  'traceHerbBatches',
  'farmerBatches',
  'processorBatches', 
  'labBatches',
  'regulatoryBatches',
  'batches'
]

storageLocations.forEach(location => {
  localStorage.setItem(location, JSON.stringify([batch]))
  console.log(`✅ Added to ${location}`)
})

// Step 4: Trigger storage events
storageLocations.forEach(location => {
  window.dispatchEvent(new StorageEvent('storage', {
    key: location,
    newValue: JSON.stringify([batch])
  }))
  console.log(`📡 Triggered storage event for ${location}`)
})

// Step 5: Force component re-render by dispatching a custom event
window.dispatchEvent(new CustomEvent('batchDataUpdated', {
  detail: { batches: [batch] }
}))

console.log('🎉 BATCH ADDED SUCCESSFULLY!')
console.log('📱 Check the farmer portal - it should show 1 batch now')
console.log('🔄 If not visible, refresh the page')

// Step 6: Also try to directly update React state if possible
setTimeout(() => {
  console.log('🔄 Attempting page refresh to ensure batch appears...')
  window.location.reload()
}, 3000)
