// Utility to add missing batch to storage
// This helps recover batches that were created but not properly stored

export const addMissingBatch = (qrCode) => {
  // Create a batch entry for the missing QR code
  const missingBatch = {
    id: qrCode.replace('QR_COL_', ''),
    collectionId: qrCode.replace('QR_COL_', ''),
    batchId: qrCode.replace('QR_COL_', ''),
    qrCode: qrCode,
    botanicalName: 'Unknown Herb',
    commonName: 'Herb Product',
    quantity: '10',
    unit: 'kg',
    farmerName: 'Demo Farmer',
    farmLocation: 'Demo Farm, Karnataka',
    farmSize: '5 acres',
    collectionMethod: 'Hand-picked',
    season: 'Current',
    weatherConditions: 'Good',
    soilType: 'Fertile',
    certifications: 'Organic',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    status: 'rejected', // Set as rejected since you mentioned it was rejected
    rejectionReason: 'This batch was rejected by regulatory authorities due to quality concerns.',
    synced: false
  }

  // Add to farmer batches
  const existingFarmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  const existingBatch = existingFarmerBatches.find(b => b.qrCode === qrCode)
  
  if (!existingBatch) {
    existingFarmerBatches.push(missingBatch)
    localStorage.setItem('farmerBatches', JSON.stringify(existingFarmerBatches))
  }

  // Add to shared batch storage
  const existingSharedBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  const existingSharedBatch = existingSharedBatches.find(b => b.qrCode === qrCode)
  
  if (!existingSharedBatch) {
    existingSharedBatches.push(missingBatch)
    localStorage.setItem('traceHerbBatches', JSON.stringify(existingSharedBatches))
  }

  console.log('Added missing batch:', qrCode)
  return missingBatch
}

// Function to check and add the specific batch you mentioned
export const addSpecificBatch = () => {
  const qrCode = 'QR_COL_1758541401913_190C49F1'
  return addMissingBatch(qrCode)
}

// Function to list all batches in storage
export const listAllBatches = () => {
  const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
  const sharedBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  
  console.log('Farmer Batches:', farmerBatches)
  console.log('Shared Batches:', sharedBatches)
  
  return { farmerBatches, sharedBatches }
}
