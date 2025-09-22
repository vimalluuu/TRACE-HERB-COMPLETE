// Script to add the rejected batch to the system
// Run this in the browser console on the farmer portal page

const addRejectedBatch = () => {
  const rejectedBatch = {
    id: 'COL_1758541401913_190C49F1',
    collectionId: 'COL_1758541401913_190C49F1',
    batchId: 'COL_1758541401913_190C49F1',
    qrCode: 'QR_COL_1758541401913_190C49F1',
    botanicalName: 'Curcuma longa',
    commonName: 'Turmeric',
    quantity: '25',
    unit: 'kg',
    farmerName: 'keerthana eli',
    farmLocation: 'Demo Farm, Karnataka, India',
    farmSize: '5 acres',
    collectionMethod: 'Hand-picked',
    season: 'Winter 2024',
    weatherConditions: 'Dry and sunny',
    soilType: 'Sandy loam',
    certifications: 'Organic (attempted)',
    status: 'rejected',
    rejectionReason: 'Quality standards not met during regulatory review. Pesticide residue detected above acceptable limits.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    lastUpdated: new Date().toISOString(),
    testResults: {
      purity: 75,
      potency: 68,
      moisture: 12.5,
      contaminants: 'Pesticide residue detected',
      heavyMetals: 'Above acceptable limits',
      microbiology: 'Contamination found',
      pesticides: 'Residue detected'
    },
    regulatoryDecision: 'rejected',
    regulatoryComments: 'Quality standards not met during regulatory review. Pesticide residue detected above acceptable limits.',
    regulatoryTimestamp: new Date().toISOString(),
    synced: false
  }

  // Add to farmer batches
  const existingFarmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  const existingBatch = existingFarmerBatches.find(b => b.qrCode === rejectedBatch.qrCode)
  
  if (!existingBatch) {
    existingFarmerBatches.push(rejectedBatch)
    localStorage.setItem('farmerBatches', JSON.stringify(existingFarmerBatches))
    console.log('Added to farmer batches')
  } else {
    // Update existing batch with rejection status
    const batchIndex = existingFarmerBatches.findIndex(b => b.qrCode === rejectedBatch.qrCode)
    existingFarmerBatches[batchIndex] = { ...existingFarmerBatches[batchIndex], ...rejectedBatch }
    localStorage.setItem('farmerBatches', JSON.stringify(existingFarmerBatches))
    console.log('Updated existing farmer batch with rejection status')
  }

  // Add to shared batch storage
  const existingSharedBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  const existingSharedBatch = existingSharedBatches.find(b => b.qrCode === rejectedBatch.qrCode)
  
  if (!existingSharedBatch) {
    existingSharedBatches.push(rejectedBatch)
    localStorage.setItem('traceHerbBatches', JSON.stringify(existingSharedBatches))
    console.log('Added to shared batches')
  } else {
    // Update existing batch with rejection status
    const batchIndex = existingSharedBatches.findIndex(b => b.qrCode === rejectedBatch.qrCode)
    existingSharedBatches[batchIndex] = { ...existingSharedBatches[batchIndex], ...rejectedBatch }
    localStorage.setItem('traceHerbBatches', JSON.stringify(existingSharedBatches))
    console.log('Updated existing shared batch with rejection status')
  }

  // Trigger storage event for real-time updates
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'traceHerbBatches',
    newValue: JSON.stringify(existingSharedBatches)
  }))

  console.log('✅ Rejected batch added successfully!')
  console.log('QR Code:', rejectedBatch.qrCode)
  console.log('Status:', rejectedBatch.status)
  console.log('Rejection Reason:', rejectedBatch.rejectionReason)
  
  // Refresh the page to see changes
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

// Run the function
addRejectedBatch()
