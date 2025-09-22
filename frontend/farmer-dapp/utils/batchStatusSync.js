// Real-time batch status synchronization utility for farmer portal
// Uses the same working logic as the enhanced consumer portal

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

// Helper function to get status icon
export const getStatusIcon = (status) => {
  return STATUS_ICONS[status] || STATUS_ICONS[BATCH_STATUSES.PENDING]
}

// Storage keys
const STORAGE_KEYS = {
  BATCHES: 'traceHerbBatches',
  FARMER_BATCHES: 'farmerBatches'
}

// Get all batches from storage (check all possible locations)
export const getAllBatches = () => {
  try {
    // Check multiple storage locations for batch data
    const locations = [
      'traceHerbBatches',
      'farmerBatches',
      'processorBatches',
      'labBatches',
      'regulatoryBatches',
      'batches'
    ]

    let allBatches = []
    const seenQRCodes = new Set()

    locations.forEach(location => {
      try {
        const batches = JSON.parse(localStorage.getItem(location) || '[]')
        batches.forEach(batch => {
          if (batch.qrCode && !seenQRCodes.has(batch.qrCode)) {
            seenQRCodes.add(batch.qrCode)
            allBatches.push(batch)
          }
        })
      } catch (error) {
        console.warn(`Error loading from ${location}:`, error)
      }
    })

    console.log('📦 Loaded batches from all storage locations:', allBatches.length)
    return allBatches
  } catch (error) {
    console.error('Error loading batches:', error)
    return []
  }
}

// Get batch by QR code or ID
export const getBatchByQRCode = (qrCode) => {
  try {
    const batches = getAllBatches()
    const batch = batches.find(batch => 
      batch.qrCode === qrCode || 
      batch.collectionId === qrCode ||
      batch.id === qrCode ||
      qrCode.includes(batch.collectionId) ||
      batch.collectionId === qrCode.replace('QR_COL_', '')
    )
    console.log('🔍 Found batch for QR code:', qrCode, batch ? 'YES' : 'NO')
    return batch || null
  } catch (error) {
    console.error('Error getting batch by QR code:', error)
    return null
  }
}

// Listen for batch status changes across tabs/windows
export const subscribeToBatchUpdates = (callback) => {
  const handleStorageChange = (event) => {
    if (event.key === STORAGE_KEYS.BATCHES && event.newValue) {
      try {
        const updatedBatches = JSON.parse(event.newValue)
        console.log('🔄 Batch updates received:', updatedBatches.length)
        callback(updatedBatches)
      } catch (error) {
        console.error('Error parsing batch updates:', error)
      }
    }
  }

  window.addEventListener('storage', handleStorageChange)
  
  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}

// Clear all demo data and initialize fresh storage
export const clearAllDemoData = () => {
  console.log('🧹 Clearing all demo data...')
  localStorage.removeItem(STORAGE_KEYS.BATCHES)
  localStorage.removeItem(STORAGE_KEYS.FARMER_BATCHES)
  localStorage.removeItem('processorBatches')
  localStorage.removeItem('labBatches')
  localStorage.removeItem('regulatoryBatches')
  console.log('✅ All demo data cleared')
}

// Real-time sync from backend and other portals
export const syncBatchesFromAllSources = async () => {
  console.log('🔄 Syncing batches from all sources...')
  let syncedCount = 0
  
  try {
    // Get current batches
    const currentBatches = getAllBatches()
    let updatedBatches = [...currentBatches]
    
    // Try to sync from backend API
    try {
      const response = await fetch('http://localhost:3000/api/collection/all')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          console.log('📡 Backend API response:', data.data.length, 'batches')
          
          for (const backendBatch of data.data) {
            if (backendBatch.qrCode || backendBatch.collectionId) {
              const qrCode = backendBatch.qrCode || `QR_COL_${backendBatch.collectionId}`
              const existingIndex = updatedBatches.findIndex(b => 
                b.qrCode === qrCode || 
                b.collectionId === backendBatch.collectionId
              )
              
              const syncedBatch = {
                id: backendBatch.collectionId || backendBatch.id,
                collectionId: backendBatch.collectionId || backendBatch.id,
                qrCode: qrCode,
                botanicalName: backendBatch.botanicalName || backendBatch.herbType || 'Unknown',
                commonName: backendBatch.commonName || backendBatch.herbType || 'Unknown',
                quantity: backendBatch.quantity || '0',
                unit: backendBatch.unit || 'kg',
                farmerName: backendBatch.farmerName || backendBatch.farmer?.name || 'Unknown',
                farmLocation: backendBatch.farmLocation || backendBatch.location || 'Unknown',
                status: backendBatch.status || 'pending',
                createdAt: backendBatch.createdAt || backendBatch.collectionDate || new Date().toISOString(),
                lastUpdated: backendBatch.lastUpdated || new Date().toISOString(),
                processingData: backendBatch.processingData || null,
                testResults: backendBatch.testResults || null,
                regulatoryDecision: backendBatch.regulatory?.decision || null,
                regulatoryComments: backendBatch.regulatory?.reason || null,
                rejectionReason: backendBatch.regulatory?.reason || null,
                synced: true
              }
              
              if (existingIndex >= 0) {
                updatedBatches[existingIndex] = syncedBatch
              } else {
                updatedBatches.push(syncedBatch)
              }
              syncedCount++
            }
          }
        }
      }
    } catch (error) {
      console.log('Backend API not available:', error.message)
    }
    
    // Sync from other portals' localStorage
    const portalStorageKeys = ['processorBatches', 'labBatches', 'regulatoryBatches']
    
    for (const storageKey of portalStorageKeys) {
      try {
        const portalBatches = JSON.parse(localStorage.getItem(storageKey) || '[]')
        console.log(`📦 ${storageKey}:`, portalBatches.length, 'batches')
        
        for (const portalBatch of portalBatches) {
          if (portalBatch.qrCode) {
            const existingIndex = updatedBatches.findIndex(b => 
              b.qrCode === portalBatch.qrCode || 
              b.collectionId === portalBatch.collectionId
            )
            
            if (existingIndex >= 0) {
              // Update existing batch with portal data
              updatedBatches[existingIndex] = {
                ...updatedBatches[existingIndex],
                status: portalBatch.status || updatedBatches[existingIndex].status,
                processingData: portalBatch.processingData || updatedBatches[existingIndex].processingData,
                testResults: portalBatch.testResults || updatedBatches[existingIndex].testResults,
                regulatoryDecision: portalBatch.regulatoryDecision || updatedBatches[existingIndex].regulatoryDecision,
                regulatoryComments: portalBatch.regulatoryComments || updatedBatches[existingIndex].regulatoryComments,
                rejectionReason: portalBatch.rejectionReason || updatedBatches[existingIndex].rejectionReason,
                lastUpdated: portalBatch.lastUpdated || new Date().toISOString(),
                synced: true
              }
              syncedCount++
            }
          }
        }
      } catch (error) {
        console.log(`${storageKey} not available:`, error.message)
      }
    }
    
    // Save updated batches
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(updatedBatches))
    localStorage.setItem(STORAGE_KEYS.FARMER_BATCHES, JSON.stringify(updatedBatches))
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.BATCHES,
      newValue: JSON.stringify(updatedBatches)
    }))
    
    console.log(`✅ Synced ${syncedCount} batch updates from all sources`)
    return updatedBatches
    
  } catch (error) {
    console.error('Error syncing batches:', error)
    return getAllBatches()
  }
}

// Get status progress percentage
export const getStatusProgress = (status) => {
  const progressMap = {
    'pending': 10,
    'processing': 25,
    'processed': 50,
    'testing': 75,
    'tested': 85,
    'approved': 100,
    'rejected': 0,
    'completed': 100
  }
  return progressMap[status] || 0
}

// Initialize fresh data (no demo data)
export const initializeFreshData = () => {
  console.log('🆕 Initializing fresh data (no demo batches)')
  clearAllDemoData()
  return []
}
