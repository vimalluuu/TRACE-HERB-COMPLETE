// Test script for rejected batch scenario
console.log('❌ Testing Rejected Batch Scenario...')

// Create a batch that will be rejected
const rejectedBatch = {
  id: '1758541401913_190C49F1',
  collectionId: '1758541401913_190C49F1',
  qrCode: 'QR_COL_1758541401913_190C49F1',
  botanicalName: 'Withania somnifera',
  commonName: 'Ashwagandha',
  quantity: '15',
  unit: 'kg',
  farmerName: 'Test Farmer',
  farmLocation: 'Rajasthan, India',
  farmSize: '2 acres',
  collectionMethod: 'Hand-picked',
  season: 'Winter 2024',
  weatherConditions: 'Good',
  soilType: 'Sandy loam',
  certifications: 'Organic',
  status: 'rejected',
  rejectionReason: 'Quality standards not met - moisture content too high',
  createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  lastUpdated: new Date().toISOString(),
  testResults: {
    purity: '85.2%',
    moisture: '15.8%', // Too high
    contaminants: 'Trace pesticides detected',
    grade: 'C',
    lab: 'Quality Labs India'
  },
  regulatoryDecision: 'rejected',
  regulatoryComments: 'Moisture content exceeds 12% limit. Trace pesticides detected despite organic certification.',
  regulatoryTimestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  processingData: {
    processor: 'XYZ Processing Co',
    method: 'Air drying',
    yield: '78%',
    quality: 'Below standard'
  },
  processingTimestamp: new Date(Date.now() - 86400000).toISOString(),
  labTimestamp: new Date(Date.now() - 7200000).toISOString(),
  statusHistory: [
    {
      status: 'pending',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      note: 'Batch created and submitted'
    },
    {
      status: 'processing',
      timestamp: new Date(Date.now() - 129600000).toISOString(),
      note: 'Picked up by processor'
    },
    {
      status: 'processed',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      note: 'Processing completed'
    },
    {
      status: 'testing',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      note: 'Sent to laboratory'
    },
    {
      status: 'tested',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      note: 'Laboratory testing completed'
    },
    {
      status: 'rejected',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      note: 'Rejected by regulatory authority'
    }
  ],
  synced: true
}

// Add rejected batch to storage
function addRejectedBatch() {
  console.log('📝 Adding rejected batch...')
  
  // Update localStorage
  const existingBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  
  // Remove existing batch if present
  const filteredExisting = existingBatches.filter(b => b.qrCode !== rejectedBatch.qrCode)
  const filteredFarmer = farmerBatches.filter(b => b.qrCode !== rejectedBatch.qrCode)
  
  // Add rejected batch
  filteredExisting.push(rejectedBatch)
  filteredFarmer.push(rejectedBatch)
  
  // Save to localStorage
  localStorage.setItem('traceHerbBatches', JSON.stringify(filteredExisting))
  localStorage.setItem('farmerBatches', JSON.stringify(filteredFarmer))
  
  // Trigger storage event for real-time updates
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'traceHerbBatches',
    newValue: JSON.stringify(filteredExisting)
  }))
  
  console.log('❌ Rejected batch added successfully!')
  console.log('QR Code:', rejectedBatch.qrCode)
  console.log('Rejection Reason:', rejectedBatch.rejectionReason)
  console.log('Test Results:', rejectedBatch.testResults)
  
  return rejectedBatch
}

// Add the rejected batch
addRejectedBatch()

console.log('🔍 Check the farmer dashboard to see:')
console.log('- Red status indicator for rejected batch')
console.log('- 0% progress bar (red color)')
console.log('- Rejection reason displayed')
console.log('- "Review rejection reason" as next step')
