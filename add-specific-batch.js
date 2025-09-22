// Script to add the specific batch QR_COL_1758548022698_FC96EBBC
// Copy and paste this into the browser console on the farmer portal

console.log('🌿 Adding specific batch: QR_COL_1758548022698_FC96EBBC')

// Create the specific batch
const specificBatch = {
  id: 'batch_' + Date.now(),
  qrCode: 'QR_COL_1758548022698_FC96EBBC',
  commonName: 'Turmeric',
  botanicalName: 'Curcuma longa',
  status: 'processed', // Set to processed so it shows progress
  farmerName: 'Unknown', // This will ensure it shows up for all users
  location: 'Karnataka, India',
  harvestDate: '2024-01-15',
  quantity: '50 kg',
  qualityGrade: 'Premium',
  createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
  lastUpdated: new Date().toISOString(),
  
  // Processing data to show it's been through processor
  processingData: {
    processor: 'ABC Processing Ltd',
    processingMethod: 'Steam Distillation',
    processedDate: new Date('2024-01-16T14:20:00Z').toISOString(),
    yield: '45 kg',
    qualityAfterProcessing: 'Premium Grade A'
  },
  
  // Lab data to show it's been through lab
  testResults: {
    lab: 'Quality Labs India',
    testDate: new Date('2024-01-17T09:15:00Z').toISOString(),
    purity: '98.5%',
    grade: 'A+',
    contaminants: 'None detected',
    certificates: ['ISO 9001', 'FSSAI Certified']
  },
  
  // Additional metadata
  metadata: {
    blockchainTxId: 'tx_' + Math.random().toString(36).substr(2, 9),
    ipfsHash: 'Qm' + Math.random().toString(36).substr(2, 44),
    certificates: ['Organic', 'Fair Trade'],
    sustainabilityScore: 95
  }
}

// Add to farmer batches
const existingFarmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
const updatedFarmerBatches = existingFarmerBatches.filter(b => b.qrCode !== specificBatch.qrCode)
updatedFarmerBatches.push(specificBatch)
localStorage.setItem('farmerBatches', JSON.stringify(updatedFarmerBatches))

// Add to processor batches (to show it's been processed)
const existingProcessorBatches = JSON.parse(localStorage.getItem('processorBatches') || '[]')
const updatedProcessorBatches = existingProcessorBatches.filter(b => b.qrCode !== specificBatch.qrCode)
updatedProcessorBatches.push(specificBatch)
localStorage.setItem('processorBatches', JSON.stringify(updatedProcessorBatches))

// Add to lab batches (to show it's been tested)
const existingLabBatches = JSON.parse(localStorage.getItem('labBatches') || '[]')
const updatedLabBatches = existingLabBatches.filter(b => b.qrCode !== specificBatch.qrCode)
updatedLabBatches.push(specificBatch)
localStorage.setItem('labBatches', JSON.stringify(updatedLabBatches))

// Trigger storage event to update UI
window.dispatchEvent(new StorageEvent('storage', {
  key: 'farmerBatches',
  newValue: JSON.stringify(updatedFarmerBatches)
}))

console.log('✅ Batch QR_COL_1758548022698_FC96EBBC added successfully!')
console.log('📦 Batch details:', specificBatch)
console.log('🔄 Refresh the page or pull down to see the batch')

// Also add a few more test batches to make it look realistic
const additionalBatches = [
  {
    id: 'batch_' + (Date.now() + 1),
    qrCode: 'QR_COL_1758548100000_ABC123',
    commonName: 'Ginger',
    botanicalName: 'Zingiber officinale',
    status: 'testing',
    farmerName: 'Unknown',
    location: 'Kerala, India',
    harvestDate: '2024-01-20',
    quantity: '30 kg',
    qualityGrade: 'Premium',
    createdAt: new Date('2024-01-20T08:00:00Z').toISOString(),
    lastUpdated: new Date().toISOString(),
    processingData: {
      processor: 'Kerala Spice Processing',
      processingMethod: 'Traditional Drying',
      processedDate: new Date('2024-01-21T12:00:00Z').toISOString(),
      yield: '28 kg',
      qualityAfterProcessing: 'Premium Grade A'
    }
  },
  {
    id: 'batch_' + (Date.now() + 2),
    qrCode: 'QR_COL_1758548200000_DEF456',
    commonName: 'Black Pepper',
    botanicalName: 'Piper nigrum',
    status: 'approved',
    farmerName: 'Unknown',
    location: 'Karnataka, India',
    harvestDate: '2024-01-18',
    quantity: '25 kg',
    qualityGrade: 'Premium',
    createdAt: new Date('2024-01-18T06:30:00Z').toISOString(),
    lastUpdated: new Date().toISOString(),
    processingData: {
      processor: 'Spice Masters Ltd',
      processingMethod: 'Sun Drying',
      processedDate: new Date('2024-01-19T15:30:00Z').toISOString(),
      yield: '23 kg',
      qualityAfterProcessing: 'Premium Grade A+'
    },
    testResults: {
      lab: 'Spice Quality Labs',
      testDate: new Date('2024-01-20T11:00:00Z').toISOString(),
      purity: '99.2%',
      grade: 'A++',
      contaminants: 'None detected',
      certificates: ['ISO 22000', 'HACCP Certified']
    },
    regulatoryComments: 'Excellent quality, approved for export'
  }
]

// Add additional batches
additionalBatches.forEach(batch => {
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  const filtered = farmerBatches.filter(b => b.qrCode !== batch.qrCode)
  filtered.push(batch)
  localStorage.setItem('farmerBatches', JSON.stringify(filtered))
})

console.log('✅ Added 3 total batches including your specific one!')
console.log('🔄 Pull down to refresh and see all batches')
