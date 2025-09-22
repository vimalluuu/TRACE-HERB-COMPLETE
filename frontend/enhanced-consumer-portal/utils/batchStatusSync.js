// Shared batch status synchronization utility for consumer portal
// This utility manages real-time batch status updates across all portals

export const BATCH_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing', 
  PROCESSED: 'processed',
  TESTING: 'testing',
  TESTED: 'tested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
}

export const STATUS_COLORS = {
  [BATCH_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [BATCH_STATUSES.PROCESSING]: 'bg-blue-100 text-blue-800',
  [BATCH_STATUSES.PROCESSED]: 'bg-indigo-100 text-indigo-800',
  [BATCH_STATUSES.TESTING]: 'bg-purple-100 text-purple-800',
  [BATCH_STATUSES.TESTED]: 'bg-cyan-100 text-cyan-800',
  [BATCH_STATUSES.APPROVED]: 'bg-green-100 text-green-800',
  [BATCH_STATUSES.REJECTED]: 'bg-red-100 text-red-800',
  [BATCH_STATUSES.COMPLETED]: 'bg-emerald-100 text-emerald-800'
}

export const STATUS_ICONS = {
  [BATCH_STATUSES.PENDING]: '🟡',
  [BATCH_STATUSES.PROCESSING]: '🔵',
  [BATCH_STATUSES.PROCESSED]: '🟣',
  [BATCH_STATUSES.TESTING]: '🔬',
  [BATCH_STATUSES.TESTED]: '🧪',
  [BATCH_STATUSES.APPROVED]: '✅',
  [BATCH_STATUSES.REJECTED]: '❌',
  [BATCH_STATUSES.COMPLETED]: '🎉'
}

export const STATUS_LABELS = {
  [BATCH_STATUSES.PENDING]: 'Pending',
  [BATCH_STATUSES.PROCESSING]: 'Processing',
  [BATCH_STATUSES.PROCESSED]: 'Processed',
  [BATCH_STATUSES.TESTING]: 'Lab Testing',
  [BATCH_STATUSES.TESTED]: 'Lab Tested',
  [BATCH_STATUSES.APPROVED]: 'Approved',
  [BATCH_STATUSES.REJECTED]: 'Rejected',
  [BATCH_STATUSES.COMPLETED]: 'Completed'
}

// Storage keys for different portals
const STORAGE_KEYS = {
  BATCHES: 'traceHerbBatches',
  BATCH_UPDATES: 'traceHerbBatchUpdates',
  SYNC_TIMESTAMP: 'traceHerbSyncTimestamp'
}

// Get all batches from localStorage
export const getAllBatches = () => {
  try {
    const batches = localStorage.getItem(STORAGE_KEYS.BATCHES)
    return batches ? JSON.parse(batches) : []
  } catch (error) {
    console.error('Error loading batches:', error)
    return []
  }
}

// Get batch by QR code or ID
export const getBatchByQRCode = (qrCode) => {
  try {
    const batches = getAllBatches()
    return batches.find(batch => 
      batch.qrCode === qrCode || 
      batch.collectionId === qrCode ||
      batch.id === qrCode
    ) || null
  } catch (error) {
    console.error('Error getting batch by QR code:', error)
    return null
  }
}

// Get batch by ID
export const getBatchById = (batchId) => {
  try {
    const batches = getAllBatches()
    return batches.find(batch => batch.id === batchId || batch.collectionId === batchId) || null
  } catch (error) {
    console.error('Error getting batch:', error)
    return null
  }
}

// Listen for batch status changes across tabs/windows
export const subscribeToBatchUpdates = (callback) => {
  const handleStorageChange = (event) => {
    if (event.key === STORAGE_KEYS.BATCHES && event.newValue) {
      try {
        const updatedBatches = JSON.parse(event.newValue)
        callback(updatedBatches)
      } catch (error) {
        console.error('Error parsing batch updates:', error)
      }
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}

// Convert batch data to sustainability metrics
export const batchToSustainabilityMetrics = (batch) => {
  if (!batch) {
    return {
      carbonFootprint: 2.4,
      waterUsage: 150,
      organicCertified: false,
      fairTrade: false,
      biodiversityScore: 6.0
    }
  }

  // Extract real data from batch
  const isOrganic = batch.certifications?.includes('Organic') || 
                   batch.certifications?.toLowerCase().includes('organic') ||
                   false
  
  const isFairTrade = batch.certifications?.includes('Fair Trade') || 
                     batch.certifications?.toLowerCase().includes('fair trade') ||
                     false

  // Calculate metrics based on batch data
  const carbonFootprint = batch.carbonFootprint || (isOrganic ? 1.8 : 2.4)
  const waterUsage = batch.waterUsage || (isOrganic ? 120 : 150)
  const biodiversityScore = batch.biodiversityScore || (isOrganic ? 8.5 : 6.0)

  return {
    carbonFootprint,
    waterUsage,
    organicCertified: isOrganic,
    fairTrade: isFairTrade,
    biodiversityScore
  }
}

// Convert batch data to quality metrics
export const batchToQualityMetrics = (batch) => {
  if (!batch) {
    return {
      purity: 85,
      potency: 78,
      contaminants: 'None detected',
      testsPassed: false,
      certificationLevel: 'Standard'
    }
  }

  // Extract real test results
  const testResults = batch.testResults || {}
  const isApproved = batch.status === BATCH_STATUSES.APPROVED
  const isTested = batch.status === BATCH_STATUSES.TESTED || isApproved

  return {
    purity: testResults.purity || (isApproved ? 95 : 85),
    potency: testResults.potency || (isApproved ? 92 : 78),
    contaminants: testResults.contaminants || (isApproved ? 'None detected' : 'Testing in progress'),
    testsPassed: isApproved,
    certificationLevel: isApproved ? 'Premium' : (isTested ? 'Standard' : 'Pending'),
    moistureContent: testResults.moisture || (isApproved ? 8.5 : 12.0),
    heavyMetals: testResults.heavyMetals || (isApproved ? 'Below limits' : 'Testing'),
    microbiology: testResults.microbiology || (isApproved ? 'Safe' : 'Testing'),
    pesticides: testResults.pesticides || (isApproved ? 'None detected' : 'Testing')
  }
}

// Convert batch data to advanced insights
export const batchToAdvancedInsights = (batch) => {
  if (!batch) {
    return {
      herbName: 'Unknown Herb',
      botanicalName: 'Unknown',
      origin: 'Unknown Location',
      harvestDate: 'Unknown',
      processingMethod: 'Unknown',
      qualityGrade: 'Standard',
      recommendations: ['Consult healthcare provider before use']
    }
  }

  const isApproved = batch.status === BATCH_STATUSES.APPROVED
  const qualityGrade = isApproved ? 'Premium' : 'Standard'

  return {
    herbName: batch.commonName || batch.botanicalName || 'Herb Product',
    botanicalName: batch.botanicalName || 'Unknown',
    origin: batch.farmLocation || 'Unknown Location',
    harvestDate: batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : 'Unknown',
    processingMethod: batch.processingData?.method || 'Traditional',
    qualityGrade,
    farmer: batch.farmerName || 'Unknown Farmer',
    farmSize: batch.farmSize || 'Unknown',
    collectionMethod: batch.collectionMethod || 'Hand-picked',
    season: batch.season || 'Unknown',
    weatherConditions: batch.weatherConditions || 'Optimal',
    soilType: batch.soilType || 'Rich loam',
    recommendations: isApproved ? [
      'High-quality product suitable for regular use',
      'Store in cool, dry place',
      'Follow recommended dosage'
    ] : [
      'Product quality verification in progress',
      'Consult healthcare provider before use',
      'Check for updates on batch status'
    ]
  }
}

// Initialize demo batches if none exist
export const initializeDemoBatches = () => {
  const existingBatches = getAllBatches()
  
  if (existingBatches.length === 0) {
    const demoBatches = [
      {
        id: 'DEMO_001',
        collectionId: 'COL_DEMO_001',
        qrCode: 'QR_COL_DEMO_001',
        botanicalName: 'Curcuma longa',
        commonName: 'Turmeric',
        quantity: '50',
        unit: 'kg',
        farmerName: 'Demo Farmer',
        farmLocation: 'Demo Farm, Karnataka',
        farmSize: '5 acres',
        collectionMethod: 'Hand-picked',
        season: 'Winter',
        weatherConditions: 'Optimal',
        soilType: 'Rich loam',
        certifications: 'Organic, Fair Trade',
        status: BATCH_STATUSES.APPROVED,
        testResults: {
          purity: 95,
          potency: 92,
          moisture: 8.5,
          contaminants: 'None detected',
          heavyMetals: 'Below limits',
          microbiology: 'Safe',
          pesticides: 'None detected'
        },
        processingData: {
          method: 'Sun-dried',
          temperature: '35°C',
          duration: '7 days'
        },
        carbonFootprint: 1.8,
        waterUsage: 120,
        biodiversityScore: 8.5,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'DEMO_002',
        collectionId: 'COL_DEMO_002',
        qrCode: 'QR_COL_DEMO_002',
        botanicalName: 'Withania somnifera',
        commonName: 'Ashwagandha',
        quantity: '25',
        unit: 'kg',
        farmerName: 'Demo Farmer',
        farmLocation: 'Demo Farm, Karnataka',
        farmSize: '5 acres',
        collectionMethod: 'Hand-picked',
        season: 'Monsoon',
        weatherConditions: 'Good',
        soilType: 'Sandy loam',
        certifications: 'Organic',
        status: BATCH_STATUSES.TESTED,
        testResults: {
          purity: 88,
          potency: 85,
          moisture: 9.2,
          contaminants: 'None detected',
          heavyMetals: 'Below limits',
          microbiology: 'Safe',
          pesticides: 'None detected'
        },
        carbonFootprint: 2.1,
        waterUsage: 135,
        biodiversityScore: 7.8,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        lastUpdated: new Date().toISOString()
      }
    ]
    
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(demoBatches))
    return demoBatches
  }
  
  return existingBatches
}
