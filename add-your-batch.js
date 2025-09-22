// Script to add your specific batch: QR_COL_1758535626723_E4F4EEE6
// Copy and paste this into the browser console on the farmer portal (http://localhost:3002)

console.log('🌿 Adding your specific batch: QR_COL_1758535626723_E4F4EEE6')

// Your specific batch data
const yourBatch = {
  id: 'batch_' + Date.now(),
  qrCode: 'QR_COL_1758535626723_E4F4EEE6',
  collectionId: 'COL_1758535626723_E4F4EEE6',
  commonName: 'Turmeric',
  botanicalName: 'Curcuma longa',
  status: 'approved',
  farmerName: 'Farmer User',
  location: 'Karnataka, India',
  harvestDate: new Date().toISOString().split('T')[0],
  quantity: '50 kg',
  qualityGrade: 'Premium',
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  
  // Processing details
  processingData: {
    processor: 'ABC Processing Ltd',
    processingMethod: 'Steam Distillation',
    processedDate: new Date().toISOString(),
    yield: '45 kg',
    qualityAfterProcessing: 'Premium Grade A'
  },
  
  // Lab test results
  testResults: {
    lab: 'Quality Labs India',
    testDate: new Date().toISOString(),
    purity: '98.5%',
    grade: 'A+',
    contaminants: 'None detected',
    certificates: ['ISO 9001', 'FSSAI Certified']
  },
  
  // Regulatory approval
  regulatoryComments: 'Excellent quality turmeric. Meets all export standards. Approved for international market.',
  
  // Additional metadata
  metadata: {
    blockchainTxId: 'tx_' + Math.random().toString(36).substr(2, 9),
    ipfsHash: 'Qm' + Math.random().toString(36).substr(2, 44),
    certificates: ['Organic', 'Fair Trade', 'Export Quality'],
    sustainabilityScore: 95
  }
}

console.log('📦 Your batch details:', yourBatch)

// Add to ALL possible storage locations
const allStorageKeys = [
  'traceHerbBatches',
  'farmerBatches',
  'processorBatches',
  'labBatches',
  'regulatoryBatches',
  'batches',
  'herbBatches',
  'collectionData'
]

allStorageKeys.forEach(key => {
  try {
    // Get existing data
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    
    // Remove any existing batch with same QR code
    const filtered = Array.isArray(existing) ? 
      existing.filter(b => b.qrCode !== yourBatch.qrCode) : []
    
    // Add your batch
    filtered.push(yourBatch)
    
    // Save back to storage
    localStorage.setItem(key, JSON.stringify(filtered))
    
    console.log(`✅ Added your batch to ${key} (total: ${filtered.length})`)
  } catch (error) {
    console.error(`❌ Error adding to ${key}:`, error)
  }
})

// Trigger storage events for all keys
allStorageKeys.forEach(key => {
  window.dispatchEvent(new StorageEvent('storage', {
    key: key,
    newValue: localStorage.getItem(key)
  }))
})

// Also trigger a custom event
window.dispatchEvent(new CustomEvent('batchAdded', {
  detail: { batch: yourBatch }
}))

console.log('🎉 YOUR BATCH HAS BEEN ADDED TO ALL STORAGE LOCATIONS!')
console.log('📱 The farmer portal should now show your batch: QR_COL_1758535626723_E4F4EEE6')
console.log('🔄 If not visible immediately, the page will refresh in 3 seconds...')

// Force page refresh after 3 seconds to ensure it shows up
setTimeout(() => {
  console.log('🔄 Refreshing page to ensure your batch appears...')
  window.location.reload()
}, 3000)

// Also try to manually trigger a re-render
setTimeout(() => {
  const event = new Event('storage')
  window.dispatchEvent(event)
}, 1000)
