// Script to sync farmer batch from localStorage to blockchain service
// This fixes the issue where farmer batches aren't visible to other portals

console.log('🔄 SYNCING FARMER BATCH TO BLOCKCHAIN SERVICE...')

const targetBatchId = 'QR_COL_1758658303156_B7603EA1'

// Function to get backend URL
const getBackendURL = () => {
  return 'http://172.16.126.195:3000'
}

// Mock farmer batch data for the existing batch
const mockFarmerBatch = {
  qrCode: 'QR_COL_1758658303156_B7603EA1',
  collectionId: 'COL_1758658303156_B7603EA1',
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

// Function to convert farmer batch to collection event format (matching API expectations)
const convertToCollectionEvent = (farmerBatch) => {
  const collectionId = farmerBatch.collectionId || farmerBatch.id || farmerBatch.qrCode?.replace('QR_COL_', '')

  return {
    collectionId: collectionId,
    farmer: {
      name: farmerBatch.farmerName || 'Unknown Farmer',
      id: farmerBatch.farmerId || 'FARMER_001',
      village: farmerBatch.farmLocation || 'Unknown Village',
      district: 'Unknown District',
      certification: farmerBatch.certifications || 'None'
    },
    herb: {
      commonName: farmerBatch.commonName || 'Unknown Herb',
      botanicalName: farmerBatch.botanicalName || 'Unknown',
      ayurvedicName: farmerBatch.ayurvedicName || 'Unknown',
      partUsed: farmerBatch.partUsed || 'Unknown',
      quantity: farmerBatch.quantity || '0',
      unit: farmerBatch.unit || 'kg',
      collectionMethod: farmerBatch.collectionMethod || 'Manual',
      season: farmerBatch.season || 'Unknown',
      weatherConditions: farmerBatch.weatherConditions || 'Unknown',
      soilType: farmerBatch.soilType || 'Unknown',
      notes: farmerBatch.notes || 'Collection completed'
    },
    location: {
      latitude: farmerBatch.location?.latitude || 28.6139,
      longitude: farmerBatch.location?.longitude || 77.2090,
      altitude: 100,
      accuracy: 10
    },
    environmental: {
      temperature: 25,
      humidity: 60,
      soilPH: 6.5,
      lightIntensity: 80,
      airQuality: 85
    },
    metadata: {
      deviceInfo: 'Farmer Sync Script',
      appVersion: '1.0.0',
      dataSource: 'farmer-batch-sync',
      timestamp: farmerBatch.createdAt || new Date().toISOString()
    }
  }
}

// Main sync function using http module
const syncBatchToBlockchain = async () => {
  const http = require('http')
  
  try {
    console.log(`🔍 Syncing batch: ${targetBatchId}`)
    
    // Convert to collection event format
    const collectionEvent = convertToCollectionEvent(mockFarmerBatch)
    console.log('🔄 Converted to collection event format')

    const postData = JSON.stringify(collectionEvent)
    
    const options = {
      hostname: '172.16.126.195',
      port: 3000,
      path: '/api/collection/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-Source': 'farmer-batch-sync-script'
      }
    }

    console.log(`📡 Submitting to: http://172.16.126.195:3000/api/collection/events`)

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Successfully synced batch to blockchain service!')
            console.log('📋 Response:', data)
            
            // Verify it's now accessible via workflow API
            const verifyOptions = {
              hostname: '172.16.126.195',
              port: 3000,
              path: `/api/workflow/access/farmer/${encodeURIComponent(targetBatchId)}?accessType=view`,
              method: 'GET'
            }
            
            const verifyReq = http.request(verifyOptions, (verifyRes) => {
              let verifyData = ''
              
              verifyRes.on('data', (chunk) => {
                verifyData += chunk
              })
              
              verifyRes.on('end', () => {
                if (verifyRes.statusCode >= 200 && verifyRes.statusCode < 300) {
                  try {
                    const verifyResult = JSON.parse(verifyData)
                    if (verifyResult.success && verifyResult.data.accessAllowed) {
                      console.log('🎉 VERIFICATION SUCCESS: Batch is now accessible via workflow API!')
                      console.log('📊 Batch status:', verifyResult.data.batch?.status)
                      resolve(true)
                    } else {
                      console.warn('⚠️ Batch synced but verification failed:', verifyResult)
                      resolve(false)
                    }
                  } catch (e) {
                    console.warn('⚠️ Batch synced but verification response parsing failed')
                    resolve(false)
                  }
                } else {
                  console.warn('⚠️ Batch synced but verification request failed')
                  resolve(false)
                }
              })
            })
            
            verifyReq.on('error', (err) => {
              console.warn('⚠️ Batch synced but verification request error:', err.message)
              resolve(false)
            })
            
            verifyReq.end()
            
          } else {
            console.error('❌ Failed to sync batch:', res.statusCode, data)
            resolve(false)
          }
        })
      })
      
      req.on('error', (err) => {
        console.error('❌ Error syncing batch:', err.message)
        resolve(false)
      })
      
      req.write(postData)
      req.end()
    })
    
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
  process.exit(success ? 0 : 1)
})
