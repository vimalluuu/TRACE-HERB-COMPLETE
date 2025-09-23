// Shared batch status synchronization utility
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

// Save all batches to localStorage
export const saveBatches = (batches) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches))
    localStorage.setItem(STORAGE_KEYS.SYNC_TIMESTAMP, Date.now().toString())
    
    // Trigger storage event for cross-tab synchronization
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.BATCHES,
      newValue: JSON.stringify(batches)
    }))
    
    return true
  } catch (error) {
    console.error('Error saving batches:', error)
    return false
  }
}

// Update batch status
export const updateBatchStatus = (batchId, newStatus, updateData = {}) => {
  try {
    const batches = getAllBatches()
    const batchIndex = batches.findIndex(batch => batch.id === batchId || batch.collectionId === batchId)
    
    if (batchIndex === -1) {
      console.warn(`Batch with ID ${batchId} not found`)
      return false
    }
    
    // Update batch with new status and additional data
    batches[batchIndex] = {
      ...batches[batchIndex],
      status: newStatus,
      lastUpdated: new Date().toISOString(),
      ...updateData
    }
    
    // Add status history
    if (!batches[batchIndex].statusHistory) {
      batches[batchIndex].statusHistory = []
    }
    
    batches[batchIndex].statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      ...updateData
    })
    
    return saveBatches(batches)
  } catch (error) {
    console.error('Error updating batch status:', error)
    return false
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

// Get batches by status
export const getBatchesByStatus = (status) => {
  try {
    const batches = getAllBatches()
    return batches.filter(batch => batch.status === status)
  } catch (error) {
    console.error('Error filtering batches by status:', error)
    return []
  }
}

// Add new batch
export const addBatch = (batchData) => {
  try {
    const batches = getAllBatches()
    const newBatch = {
      ...batchData,
      id: batchData.id || batchData.collectionId || Date.now().toString(),
      status: batchData.status || BATCH_STATUSES.PENDING,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      statusHistory: [{
        status: batchData.status || BATCH_STATUSES.PENDING,
        timestamp: new Date().toISOString()
      }]
    }
    
    batches.push(newBatch)
    return saveBatches(batches) ? newBatch : null
  } catch (error) {
    console.error('Error adding batch:', error)
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

// Simulate regulatory approval/rejection
export const processRegulatoryDecision = (batchId, decision, comments = '') => {
  const newStatus = decision === 'approve' ? BATCH_STATUSES.APPROVED : BATCH_STATUSES.REJECTED
  const now = new Date().toISOString()

  const updateData = {
    regulatoryDecision: decision,
    regulatoryComments: comments,
    regulatoryTimestamp: now,
    reviewDate: now,
    regulatoryReviewStarted: now,
    regulatoryReviewCompleted: now,
    regulatoryNotes: comments || (decision === 'approve' ? 'All requirements met' : 'Requirements not met')
  }

  if (decision === 'approve') {
    updateData.approvedDate = now
    updateData.approvalReason = comments || 'All quality and regulatory standards met'
  } else {
    updateData.rejectedDate = now
    updateData.rejectionReason = comments || 'Failed to meet regulatory standards'
  }

  return updateBatchStatus(batchId, newStatus, updateData)
}

// Simulate processor completion
export const processProcessorCompletion = (batchId, processingData = {}) => {
  const now = new Date().toISOString()
  return updateBatchStatus(batchId, BATCH_STATUSES.PROCESSED, {
    processingCompleted: true,
    processingData,
    processingTimestamp: now,
    processingDate: now,
    processingStarted: now,
    processingNotes: processingData.notes || 'Processing completed successfully'
  })
}

// Simulate lab testing completion
export const processLabCompletion = (batchId, testResults = {}) => {
  const now = new Date().toISOString()
  return updateBatchStatus(batchId, BATCH_STATUSES.TESTED, {
    labTestingCompleted: true,
    testResults,
    labTimestamp: now,
    testingDate: now,
    testingStarted: now,
    testingCompleted: now,
    testingNotes: 'Lab testing completed successfully',
    labResults: testResults
  })
}

// Get batch progress percentage
export const getBatchProgress = (status) => {
  const progressMap = {
    [BATCH_STATUSES.PENDING]: 10,
    [BATCH_STATUSES.PROCESSING]: 25,
    [BATCH_STATUSES.PROCESSED]: 50,
    [BATCH_STATUSES.TESTING]: 75,
    [BATCH_STATUSES.TESTED]: 85,
    [BATCH_STATUSES.APPROVED]: 100,
    [BATCH_STATUSES.REJECTED]: 0,
    [BATCH_STATUSES.COMPLETED]: 100
  }

  return progressMap[status] || 0
}

// Get batch by QR code
export const getBatchByQRCode = (qrCode) => {
  const batches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
  return batches.find(batch => batch.qrCode === qrCode)
}

// Sync batch status from backend to frontend
export const syncBatchFromBackend = async (qrCode) => {
  console.log('🔄 Syncing batch from backend:', qrCode)

  try {
    // Try to fetch from backend API
    const response = await fetch(`http://localhost:3000/api/collection/provenance/${qrCode}`)

    if (response.ok) {
      const data = await response.json()

      if (data.success && data.data) {
        const backendBatch = data.data

        // Convert backend format to frontend format
        const frontendBatch = {
          id: backendBatch.collectionId || qrCode.replace('QR_COL_', ''),
          collectionId: backendBatch.collectionId || qrCode.replace('QR_COL_', ''),
          qrCode: qrCode,
          botanicalName: backendBatch.botanicalName || backendBatch.herbType || 'Unknown',
          commonName: backendBatch.commonName || backendBatch.herbType || 'Unknown',
          quantity: backendBatch.quantity || '0',
          unit: backendBatch.unit || 'kg',
          farmerName: backendBatch.farmerName || backendBatch.farmer?.name || 'Unknown',
          farmLocation: backendBatch.farmLocation || backendBatch.location || 'Unknown',
          farmSize: backendBatch.farmSize || '0 acres',
          collectionMethod: backendBatch.collectionMethod || 'Hand-picked',
          season: backendBatch.season || 'Current',
          weatherConditions: backendBatch.weatherConditions || 'Good',
          soilType: backendBatch.soilType || 'Unknown',
          certifications: backendBatch.certifications || 'None',
          status: backendBatch.status || 'pending',
          rejectionReason: backendBatch.regulatory?.reason || null,
          createdAt: backendBatch.createdAt || backendBatch.collectionDate || new Date().toISOString(),
          lastUpdated: backendBatch.lastUpdated || new Date().toISOString(),
          testResults: backendBatch.testResults || null,
          regulatoryDecision: backendBatch.regulatory?.decision || null,
          regulatoryComments: backendBatch.regulatory?.reason || null,
          regulatoryTimestamp: backendBatch.regulatory?.reviewDate || null,
          processingData: backendBatch.processingData || null,
          processingTimestamp: backendBatch.processingTimestamp || null,
          labTimestamp: backendBatch.labTimestamp || null,
          statusHistory: backendBatch.statusHistory || [],
          synced: true
        }

        // Update localStorage
        const existingBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
        const batchIndex = existingBatches.findIndex(b => b.qrCode === qrCode)

        if (batchIndex >= 0) {
          existingBatches[batchIndex] = frontendBatch
        } else {
          existingBatches.push(frontendBatch)
        }

        localStorage.setItem('traceHerbBatches', JSON.stringify(existingBatches))

        // Also update farmer batches
        const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
        const farmerBatchIndex = farmerBatches.findIndex(b => b.qrCode === qrCode)

        if (farmerBatchIndex >= 0) {
          farmerBatches[farmerBatchIndex] = frontendBatch
        } else {
          farmerBatches.push(frontendBatch)
        }

        localStorage.setItem('farmerBatches', JSON.stringify(farmerBatches))

        // Trigger storage event for real-time updates
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'traceHerbBatches',
          newValue: JSON.stringify(existingBatches)
        }))

        console.log('Synced batch from backend:', frontendBatch)
        return frontendBatch
      }
    }
  } catch (error) {
    console.error('Error syncing batch from backend:', error)
  }

  return null
}

// Comprehensive sync from all portals using localStorage cross-portal communication
export const syncAllBatchesFromAllPortals = async () => {
  try {
    console.log('🔄 Syncing all batches from all portals...')
    let syncedCount = 0

    // Get all existing batches
    const existingBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
    const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')

    // Check for updates from processor portal localStorage
    try {
      const processorBatches = JSON.parse(localStorage.getItem('processorBatches') || '[]')
      for (const processorBatch of processorBatches) {
        if (processorBatch.qrCode) {
          const existingBatch = existingBatches.find(b => b.qrCode === processorBatch.qrCode)
          if (existingBatch) {
            let shouldUpdate = false
            let updates = {}

            // Check if processor has started processing
            if (processorBatch.status === 'processing' && existingBatch.status === 'pending') {
              updates = {
                status: 'processing',
                processingData: processorBatch.processingData || {
                  processor: 'Processing Started',
                  method: 'Under review',
                  timestamp: new Date().toISOString()
                },
                processingTimestamp: processorBatch.processingTimestamp || new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              }
              shouldUpdate = true
              console.log(`✅ Synced processing status for ${processorBatch.qrCode}`)
            }

            // Check if processor has completed processing
            if (processorBatch.status === 'processed' && ['pending', 'processing'].includes(existingBatch.status)) {
              updates = {
                status: 'processed',
                processingData: processorBatch.processingData || {
                  processor: 'Processing Complete',
                  method: 'Standard processing',
                  yield: '85%',
                  quality: 'Good',
                  timestamp: new Date().toISOString()
                },
                processingTimestamp: processorBatch.processingTimestamp || new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              }
              shouldUpdate = true
              console.log(`✅ Synced processed status for ${processorBatch.qrCode}`)
            }

            if (shouldUpdate) {
              updateBatchInStorage(existingBatches, farmerBatches, processorBatch.qrCode, updates)
              syncedCount++
            }
          }
        }
      }
    } catch (error) {
      console.log('Processor localStorage not available:', error.message)
    }

    // Check for updates from lab portal localStorage
    try {
      const labBatches = JSON.parse(localStorage.getItem('labBatches') || '[]')
      for (const labBatch of labBatches) {
        if (labBatch.qrCode) {
          const existingBatch = existingBatches.find(b => b.qrCode === labBatch.qrCode)
          if (existingBatch) {
            let shouldUpdate = false
            let updates = {}

            // Check if lab has started testing
            if (labBatch.status === 'testing' && ['pending', 'processing', 'processed'].includes(existingBatch.status)) {
              updates = {
                status: 'testing',
                labTimestamp: labBatch.labTimestamp || new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              }
              shouldUpdate = true
              console.log(`✅ Synced testing status for ${labBatch.qrCode}`)
            }

            // Check if lab has completed testing
            if (labBatch.status === 'tested' && ['pending', 'processing', 'processed', 'testing'].includes(existingBatch.status)) {
              updates = {
                status: 'tested',
                testResults: labBatch.testResults || {
                  purity: '95%',
                  moisture: '8%',
                  contaminants: 'None detected',
                  grade: 'A',
                  quality: 'Premium',
                  lab: 'Quality Testing Lab',
                  timestamp: new Date().toISOString()
                },
                labTimestamp: labBatch.labTimestamp || new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              }
              shouldUpdate = true
              console.log(`✅ Synced tested status for ${labBatch.qrCode}`)
            }

            if (shouldUpdate) {
              updateBatchInStorage(existingBatches, farmerBatches, labBatch.qrCode, updates)
              syncedCount++
            }
          }
        }
      }
    } catch (error) {
      console.log('Lab localStorage not available:', error.message)
    }

    // Check for updates from regulatory portal localStorage
    try {
      const regulatoryBatches = JSON.parse(localStorage.getItem('regulatoryBatches') || '[]')
      for (const regulatoryBatch of regulatoryBatches) {
        if (regulatoryBatch.qrCode && ['approved', 'rejected'].includes(regulatoryBatch.status)) {
          const existingBatch = existingBatches.find(b => b.qrCode === regulatoryBatch.qrCode)
          if (existingBatch && !['approved', 'rejected'].includes(existingBatch.status)) {
            updateBatchInStorage(existingBatches, farmerBatches, regulatoryBatch.qrCode, {
              status: regulatoryBatch.status,
              rejectionReason: regulatoryBatch.rejectionReason || null,
              regulatoryDecision: regulatoryBatch.regulatoryDecision || regulatoryBatch.status,
              regulatoryComments: regulatoryBatch.regulatoryComments || 'Regulatory decision made',
              regulatoryTimestamp: regulatoryBatch.regulatoryTimestamp || new Date().toISOString(),
              lastUpdated: new Date().toISOString()
            })
            syncedCount++
            console.log(`✅ Synced ${regulatoryBatch.status} status for ${regulatoryBatch.qrCode}`)
          }
        }
      }
    } catch (error) {
      console.log('Regulatory localStorage not available:', error.message)
    }

    // Also try backend API sync as fallback
    await syncFromBackendAPIs(existingBatches, farmerBatches)

    // Save updated batches
    localStorage.setItem('traceHerbBatches', JSON.stringify(existingBatches))
    localStorage.setItem('farmerBatches', JSON.stringify(farmerBatches))

    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'traceHerbBatches',
      newValue: JSON.stringify(existingBatches)
    }))

    console.log(`✅ Synced ${syncedCount} batch updates from all portals`)
    return true // Always return true to indicate sync attempt was made
  } catch (error) {
    console.error('Error syncing from all portals:', error)
    return false
  }
}

// Fallback sync from backend APIs
const syncFromBackendAPIs = async (existingBatches, farmerBatches) => {
  try {
    // Try to sync from backend collection API
    const response = await fetch('http://localhost:3000/api/collection/all')
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        for (const backendBatch of data.data) {
          if (backendBatch.qrCode) {
            const existingBatch = existingBatches.find(b => b.qrCode === backendBatch.qrCode)
            if (existingBatch && existingBatch.status !== backendBatch.status) {
              updateBatchInStorage(existingBatches, farmerBatches, backendBatch.qrCode, {
                status: backendBatch.status,
                lastUpdated: new Date().toISOString()
              })
              console.log(`✅ Synced from backend: ${backendBatch.qrCode} -> ${backendBatch.status}`)
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('Backend API sync failed:', error.message)
  }
}

// Helper function to update batch in storage arrays
const updateBatchInStorage = (existingBatches, farmerBatches, qrCode, updates) => {
  // Update in shared batches
  const batchIndex = existingBatches.findIndex(b => b.qrCode === qrCode)
  if (batchIndex >= 0) {
    existingBatches[batchIndex] = { ...existingBatches[batchIndex], ...updates, synced: true }
  }

  // Update in farmer batches
  const farmerBatchIndex = farmerBatches.findIndex(b => b.qrCode === qrCode)
  if (farmerBatchIndex >= 0) {
    farmerBatches[farmerBatchIndex] = { ...farmerBatches[farmerBatchIndex], ...updates, synced: true }
  }
}

// Get next expected status
export const getNextStatus = (currentStatus) => {
  const statusFlow = {
    [BATCH_STATUSES.PENDING]: BATCH_STATUSES.PROCESSING,
    [BATCH_STATUSES.PROCESSING]: BATCH_STATUSES.PROCESSED,
    [BATCH_STATUSES.PROCESSED]: BATCH_STATUSES.TESTING,
    [BATCH_STATUSES.TESTING]: BATCH_STATUSES.TESTED,
    [BATCH_STATUSES.TESTED]: BATCH_STATUSES.APPROVED, // or REJECTED
    [BATCH_STATUSES.APPROVED]: BATCH_STATUSES.COMPLETED,
    [BATCH_STATUSES.REJECTED]: null,
    [BATCH_STATUSES.COMPLETED]: null
  }
  
  return statusFlow[currentStatus] || null
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
        status: BATCH_STATUSES.PROCESSING,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
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
        status: BATCH_STATUSES.TESTED,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        lastUpdated: new Date().toISOString()
      }
    ]
    
    saveBatches(demoBatches)
    return demoBatches
  }
  
  return existingBatches
}
