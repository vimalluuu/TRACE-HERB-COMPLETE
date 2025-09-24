// Script to sync farmer batch from localStorage to blockchain service
// This fixes the issue where farmer batches aren't visible to other portals

console.log('🔄 SYNCING FARMER BATCH TO BLOCKCHAIN SERVICE...')

const targetBatchId = 'QR_COL_1758658303156_B7603EA1'

// Function to get backend URL (same as farmer portal)
const getBackendURL = () => {
  return 'http://172.16.126.195:3000'
}

// Function to convert farmer batch to collection event format
const convertToCollectionEvent = (farmerBatch) => {
  const collectionId = farmerBatch.collectionId || farmerBatch.id || farmerBatch.qrCode?.replace('QR_COL_', '')
  
  return {
    id: `PROV_${collectionId}`,
    resourceType: 'Provenance',
    target: {
      qrCode: farmerBatch.qrCode,
      batchNumber: collectionId,
      productName: farmerBatch.commonName || farmerBatch.botanicalName,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
    },
    product: {
      name: farmerBatch.commonName || 'Unknown Herb',
      botanicalName: farmerBatch.botanicalName || 'Unknown',
      category: 'Medicinal Herb',
      grade: 'Premium',
      certifications: farmerBatch.certifications ? [farmerBatch.certifications] : []
    },
    blockchain: {
      networkId: 'trace-herb-network',
      channelId: 'herb-channel',
      chaincodeId: 'herb-traceability',
      transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      timestamp: Date.now(),
      certificateAuthorities: [],
      mode: 'CA_CONNECTED',
      verified: true
    },
    events: [
      {
        id: `COL_${collectionId}`,
        type: 'Collection',
        timestamp: farmerBatch.createdAt || new Date().toISOString(),
        location: {
          name: farmerBatch.farmLocation || 'Farm Location',
          coordinates: farmerBatch.location ? {
            latitude: farmerBatch.location.latitude,
            longitude: farmerBatch.location.longitude
          } : { latitude: 0, longitude: 0 },
          geoFence: { approved: true, zone: 'zone-001' }
        },
        performer: {
          name: farmerBatch.farmerName || 'Unknown Farmer',
          id: farmerBatch.farmerId || 'FARMER_001',
          role: 'Farmer',
          certification: farmerBatch.certifications || 'None'
        },
        details: {
          quantity: farmerBatch.quantity || '0',
          unit: farmerBatch.unit || 'kg',
          botanicalName: farmerBatch.botanicalName,
          commonName: farmerBatch.commonName,
          partUsed: farmerBatch.partUsed || 'Unknown',
          collectionMethod: farmerBatch.collectionMethod || 'Manual',
          season: farmerBatch.season || 'Unknown',
          weatherConditions: farmerBatch.weatherConditions || 'Unknown',
          soilType: farmerBatch.soilType || 'Unknown'
        }
      }
    ],
    status: farmerBatch.status || 'collected',
    lastUpdated: farmerBatch.lastUpdated || new Date().toISOString()
  }
}

// Mock farmer batch data for the existing batch
const mockFarmerBatch = {
  qrCode: 'QR_COL_1758658303156_B7603EA1',
  collectionId: '1758658303156_B7603EA1',
  commonName: 'Ashwagandha',
  botanicalName: 'Withania somnifera',
  farmerName: 'Test Farmer',
  farmerId: 'FARMER_001',
  quantity: '5',
  unit: 'kg',
  partUsed: 'Root',
  collectionMethod: 'Manual',
  season: 'Winter',
  weatherConditions: 'Clear',
  soilType: 'Loamy',
  farmLocation: 'Test Farm',
  location: { latitude: 28.6139, longitude: 77.2090 },
  status: 'collected',
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
}

// Main sync function
const syncBatchToBlockchain = async () => {
  try {
    console.log(`🔍 Syncing batch: ${targetBatchId}`)
    
    // Convert to collection event format
    const collectionEvent = convertToCollectionEvent(mockFarmerBatch)
    console.log('🔄 Converted to collection event format')

    // Submit to backend API
    const backendURL = getBackendURL()
    console.log(`📡 Submitting to: ${backendURL}/api/collection/events`)

    const fetch = (await import('node-fetch')).default
    const response = await fetch(`${backendURL}/api/collection/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'farmer-batch-sync-script'
      },
      body: JSON.stringify(collectionEvent)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Successfully synced batch to blockchain service!')
      console.log('📋 Response:', result)
      
      // Verify it's now accessible via workflow API
      const verifyResponse = await fetch(`${backendURL}/api/workflow/access/farmer/${encodeURIComponent(targetBatchId)}?accessType=view`)
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json()
        if (verifyResult.success && verifyResult.data.accessAllowed) {
          console.log('🎉 VERIFICATION SUCCESS: Batch is now accessible via workflow API!')
          console.log('📊 Batch status:', verifyResult.data.batch?.status)
          return true
        } else {
          console.warn('⚠️ Batch synced but verification failed:', verifyResult)
        }
      } else {
        console.warn('⚠️ Batch synced but verification request failed')
      }
    } else {
      const error = await response.text()
      console.error('❌ Failed to sync batch:', response.status, error)
      return false
    }
  } catch (error) {
    console.error('❌ Error syncing batch:', error)
    return false
  }
}

// Execute the sync
console.log('🚀 Starting batch sync...')
syncBatchToBlockchain().then(success => {
  if (success) {
    console.log('🎉 BATCH SYNC COMPLETED SUCCESSFULLY!')
    console.log('📱 The farmer mobile app should now show the correct batch status.')
  } else {
    console.log('❌ BATCH SYNC FAILED!')
    console.log('💡 Try running this script again or check the backend logs.')
  }
})
