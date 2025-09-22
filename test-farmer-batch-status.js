// Enhanced test script to show batch data with different approval/rejection statuses
// Copy and paste this into the browser console on the farmer portal (http://localhost:3002)

console.log('🌿 Adding batch data with different statuses for farmer tracking...')

// Clear existing data first
localStorage.removeItem('farmerBatches')
localStorage.removeItem('processorBatches')
localStorage.removeItem('labBatches')
localStorage.removeItem('regulatoryBatches')

const testBatches = [
  // 1. Your specific batch - APPROVED
  {
    id: 'batch_1',
    qrCode: 'QR_COL_1758548022698_FC96EBBC',
    commonName: 'Turmeric',
    botanicalName: 'Curcuma longa',
    status: 'approved',
    farmerName: 'Unknown',
    location: 'Karnataka, India',
    harvestDate: '2024-01-15',
    quantity: '50 kg',
    qualityGrade: 'Premium',
    createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
    lastUpdated: new Date().toISOString(),
    
    processingData: {
      processor: 'ABC Processing Ltd',
      processingMethod: 'Steam Distillation',
      processedDate: new Date('2024-01-16T14:20:00Z').toISOString(),
      yield: '45 kg',
      qualityAfterProcessing: 'Premium Grade A'
    },
    
    testResults: {
      lab: 'Quality Labs India',
      testDate: new Date('2024-01-17T09:15:00Z').toISOString(),
      purity: '98.5%',
      grade: 'A+',
      contaminants: 'None detected',
      certificates: ['ISO 9001', 'FSSAI Certified']
    },
    
    regulatoryComments: 'Excellent quality turmeric. Meets all export standards. Approved for international market.',
    
    metadata: {
      blockchainTxId: 'tx_approved_001',
      ipfsHash: 'QmApproved001',
      certificates: ['Organic', 'Fair Trade', 'Export Quality'],
      sustainabilityScore: 95
    }
  },

  // 2. REJECTED batch
  {
    id: 'batch_2',
    qrCode: 'QR_COL_1758548100000_REJECTED',
    commonName: 'Ginger',
    botanicalName: 'Zingiber officinale',
    status: 'rejected',
    farmerName: 'Unknown',
    location: 'Kerala, India',
    harvestDate: '2024-01-20',
    quantity: '30 kg',
    qualityGrade: 'Standard',
    createdAt: new Date('2024-01-20T08:00:00Z').toISOString(),
    lastUpdated: new Date().toISOString(),
    
    processingData: {
      processor: 'Kerala Spice Processing',
      processingMethod: 'Traditional Drying',
      processedDate: new Date('2024-01-21T12:00:00Z').toISOString(),
      yield: '25 kg',
      qualityAfterProcessing: 'Below Standard'
    },
    
    testResults: {
      lab: 'Quality Labs India',
      testDate: new Date('2024-01-22T10:00:00Z').toISOString(),
      purity: '85.2%',
      grade: 'C',
      contaminants: 'Trace pesticide residue detected',
      certificates: []
    },
    
    rejectionReason: 'Pesticide residue levels exceed acceptable limits. Purity below 90% threshold. Does not meet organic certification requirements.',
    regulatoryComments: 'REJECTED: Quality standards not met. Pesticide contamination detected.',
    
    metadata: {
      blockchainTxId: 'tx_rejected_001',
      ipfsHash: 'QmRejected001',
      certificates: [],
      sustainabilityScore: 45
    }
  },

  // 3. Currently under PROCESSING
  {
    id: 'batch_3',
    qrCode: 'QR_COL_1758548200000_PROCESSING',
    commonName: 'Black Pepper',
    botanicalName: 'Piper nigrum',
    status: 'processing',
    farmerName: 'Unknown',
    location: 'Karnataka, India',
    harvestDate: '2024-01-25',
    quantity: '40 kg',
    qualityGrade: 'Premium',
    createdAt: new Date('2024-01-25T06:30:00Z').toISOString(),
    lastUpdated: new Date().toISOString(),
    
    processingData: {
      processor: 'Spice Masters Ltd',
      processingMethod: 'Sun Drying',
      processedDate: null,
      yield: null,
      qualityAfterProcessing: null
    },
    
    metadata: {
      blockchainTxId: 'tx_processing_001',
      ipfsHash: 'QmProcessing001',
      certificates: ['Organic'],
      sustainabilityScore: 88
    }
  },

  // 4. Currently under LAB TESTING
  {
    id: 'batch_4',
    qrCode: 'QR_COL_1758548300000_TESTING',
    commonName: 'Cardamom',
    botanicalName: 'Elettaria cardamomum',
    status: 'testing',
    farmerName: 'Unknown',
    location: 'Tamil Nadu, India',
    harvestDate: '2024-01-22',
    quantity: '15 kg',
    qualityGrade: 'Premium',
    createdAt: new Date('2024-01-22T07:00:00Z').toISOString(),
    lastUpdated: new Date().toISOString(),
    
    processingData: {
      processor: 'Premium Spice Co',
      processingMethod: 'Controlled Drying',
      processedDate: new Date('2024-01-23T16:00:00Z').toISOString(),
      yield: '14 kg',
      qualityAfterProcessing: 'Premium Grade A'
    },
    
    metadata: {
      blockchainTxId: 'tx_testing_001',
      ipfsHash: 'QmTesting001',
      certificates: ['Organic', 'Fair Trade'],
      sustainabilityScore: 92
    }
  },

  // 5. PENDING - just submitted
  {
    id: 'batch_5',
    qrCode: 'QR_COL_1758548400000_PENDING',
    commonName: 'Coriander',
    botanicalName: 'Coriandrum sativum',
    status: 'pending',
    farmerName: 'Unknown',
    location: 'Rajasthan, India',
    harvestDate: '2024-01-28',
    quantity: '35 kg',
    qualityGrade: 'Premium',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    
    metadata: {
      blockchainTxId: 'tx_pending_001',
      ipfsHash: 'QmPending001',
      certificates: ['Organic'],
      sustainabilityScore: 85
    }
  }
]

// Add all batches to storage
testBatches.forEach(batch => {
  // Add to farmer batches
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  const filtered = farmerBatches.filter(b => b.qrCode !== batch.qrCode)
  filtered.push(batch)
  localStorage.setItem('farmerBatches', JSON.stringify(filtered))
  
  // Add to appropriate portal storage based on status
  if (['processing', 'processed', 'testing', 'tested', 'approved', 'rejected'].includes(batch.status)) {
    const processorBatches = JSON.parse(localStorage.getItem('processorBatches') || '[]')
    const filteredProcessor = processorBatches.filter(b => b.qrCode !== batch.qrCode)
    filteredProcessor.push(batch)
    localStorage.setItem('processorBatches', JSON.stringify(filteredProcessor))
  }
  
  if (['testing', 'tested', 'approved', 'rejected'].includes(batch.status)) {
    const labBatches = JSON.parse(localStorage.getItem('labBatches') || '[]')
    const filteredLab = labBatches.filter(b => b.qrCode !== batch.qrCode)
    filteredLab.push(batch)
    localStorage.setItem('labBatches', JSON.stringify(filteredLab))
  }
  
  if (['approved', 'rejected'].includes(batch.status)) {
    const regulatoryBatches = JSON.parse(localStorage.getItem('regulatoryBatches') || '[]')
    const filteredRegulatory = regulatoryBatches.filter(b => b.qrCode !== batch.qrCode)
    filteredRegulatory.push(batch)
    localStorage.setItem('regulatoryBatches', JSON.stringify(filteredRegulatory))
  }
})

// Trigger storage event to update UI
window.dispatchEvent(new StorageEvent('storage', {
  key: 'farmerBatches',
  newValue: localStorage.getItem('farmerBatches')
}))

console.log('✅ Added 5 test batches with different statuses:')
console.log('📦 1. QR_COL_1758548022698_FC96EBBC - APPROVED ✅')
console.log('📦 2. QR_COL_1758548100000_REJECTED - REJECTED ❌')
console.log('📦 3. QR_COL_1758548200000_PROCESSING - PROCESSING 🔄')
console.log('📦 4. QR_COL_1758548300000_TESTING - TESTING 🧪')
console.log('📦 5. QR_COL_1758548400000_PENDING - PENDING ⏳')
console.log('')
console.log('🔄 Pull down to refresh or wait for auto-refresh to see all batches!')
console.log('✅ Farmers can now track approval/rejection status of their batches!')
