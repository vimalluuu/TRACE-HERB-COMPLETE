// Simulate what the farmer mobile app does when looking for a batch
console.log('📱 SIMULATING FARMER MOBILE APP BATCH LOOKUP...')

const targetBatchId = 'QR_COL_1758658303156_B7603EA1'

// Simulate the farmer mobile app's batch lookup logic
const simulateFarmerAppBatchLookup = async () => {
  const http = require('http')
  
  try {
    console.log(`🔍 Farmer app looking for batch: ${targetBatchId}`)
    
    // Step 1: Check localStorage (simulated)
    console.log('📦 Step 1: Checking localStorage...')
    console.log('💾 localStorage: No batch found (simulated)')
    
    // Step 2: Fetch from backend workflow API (this is what the FastBatchTracking component does)
    console.log('🌐 Step 2: Fetching from backend workflow API...')
    
    const options = {
      hostname: '172.16.126.195',
      port: 3000,
      path: `/api/workflow/access/farmer/${encodeURIComponent(targetBatchId)}?accessType=view`,
      method: 'GET'
    }

    console.log(`📡 API Call: http://172.16.126.195:3000/api/workflow/access/farmer/${targetBatchId}?accessType=view`)

    const result = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const json = JSON.parse(data)
              resolve(json)
            } catch (e) {
              reject(new Error('Failed to parse response: ' + e.message))
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`))
          }
        })
      })
      
      req.on('error', (err) => {
        reject(err)
      })
      
      req.end()
    })
    
    if (result.success && result.data.accessAllowed) {
      console.log('✅ Backend API returned batch data!')
      
      // Step 3: Map backend batch to farmer batch format (simulate FastBatchTracking mapping)
      const backendBatch = result.data.batch
      const events = Array.isArray(backendBatch.events) ? backendBatch.events : []
      
      // Find different event types
      const collectionEvent = events.find(e => e.type?.toLowerCase().includes('collection'))
      const processingEvent = events.find(e => e.type?.toLowerCase().includes('processing'))
      const testingEvent = events.find(e => e.type?.toLowerCase().includes('test') || e.type?.toLowerCase().includes('lab'))
      const regulatoryEvent = events.find(e => e.type?.toLowerCase().includes('regulatory') || e.type?.toLowerCase().includes('review'))
      
      const mappedBatch = {
        qrCode: targetBatchId,
        collectionId: backendBatch.id,
        commonName: backendBatch.product?.name || 'Unknown',
        botanicalName: backendBatch.product?.botanicalName || 'Unknown',
        farmerName: collectionEvent?.performer?.name || 'Unknown Farmer',
        quantity: collectionEvent?.details?.quantity || '0',
        unit: 'kg',
        partUsed: collectionEvent?.details?.partUsed || 'Unknown',
        farmLocation: collectionEvent?.location?.address || 'Unknown Location',
        status: backendBatch.status || result.data.currentStatus || 'collected',
        
        // Timeline data
        createdAt: collectionEvent?.timestamp || new Date().toISOString(),
        processingDate: processingEvent?.timestamp || null,
        testingDate: testingEvent?.timestamp || null,
        reviewDate: regulatoryEvent?.timestamp || null,
        
        // Status details
        processingStatus: processingEvent ? 'completed' : 'pending',
        testingStatus: testingEvent ? 'completed' : 'pending',
        regulatoryStatus: regulatoryEvent ? (regulatoryEvent.details?.decision || 'completed') : 'pending',
        
        lastUpdated: backendBatch.lastUpdated || new Date().toISOString(),
        synced: true
      }
      
      console.log('🔄 Step 3: Mapped to farmer batch format:')
      console.log('📋 Batch Details:')
      console.log(`   🏷️  QR Code: ${mappedBatch.qrCode}`)
      console.log(`   🆔 Collection ID: ${mappedBatch.collectionId}`)
      console.log(`   🌿 Common Name: ${mappedBatch.commonName}`)
      console.log(`   🔬 Botanical Name: ${mappedBatch.botanicalName}`)
      console.log(`   👨‍🌾 Farmer: ${mappedBatch.farmerName}`)
      console.log(`   ⚖️  Quantity: ${mappedBatch.quantity}`)
      console.log(`   🏠 Location: ${mappedBatch.farmLocation}`)
      console.log(`   📊 Status: ${mappedBatch.status}`)
      
      console.log('📅 Timeline:')
      console.log(`   🌱 Collection: ${mappedBatch.createdAt ? new Date(mappedBatch.createdAt).toLocaleString() : 'Not set'}`)
      console.log(`   🏭 Processing: ${mappedBatch.processingDate ? new Date(mappedBatch.processingDate).toLocaleString() : 'Pending'}`)
      console.log(`   🧪 Testing: ${mappedBatch.testingDate ? new Date(mappedBatch.testingDate).toLocaleString() : 'Pending'}`)
      console.log(`   📋 Review: ${mappedBatch.reviewDate ? new Date(mappedBatch.reviewDate).toLocaleString() : 'Pending'}`)
      
      console.log('🔄 Processing Status:')
      console.log(`   🏭 Processing: ${mappedBatch.processingStatus}`)
      console.log(`   🧪 Testing: ${mappedBatch.testingStatus}`)
      console.log(`   📋 Regulatory: ${mappedBatch.regulatoryStatus}`)
      
      // Step 4: Simulate storing in localStorage
      console.log('💾 Step 4: Would store in localStorage for offline access')
      
      console.log('\n🎉 FARMER MOBILE APP SIMULATION SUCCESSFUL!')
      console.log('📱 The farmer mobile app should now be able to:')
      console.log('   ✅ Find the batch via backend API')
      console.log('   ✅ Display batch details')
      console.log('   ✅ Show timeline progress')
      console.log('   ✅ Track processing status')
      console.log('   ✅ Cache data for offline access')
      
      return true
      
    } else {
      console.log('❌ Backend API denied access or batch not found')
      console.log('💬 Reason:', result.data?.reason || result.message || 'Unknown')
      return false
    }
    
  } catch (error) {
    console.error('❌ Farmer app simulation error:', error.message)
    return false
  }
}

// Execute the simulation
console.log('🚀 Starting farmer mobile app simulation...')
simulateFarmerAppBatchLookup().then(success => {
  if (success) {
    console.log('\n✅ SIMULATION PASSED!')
    console.log('🎯 The farmer mobile app should now work correctly with the synced batch.')
    console.log('📱 Try refreshing the farmer app and looking for the batch.')
  } else {
    console.log('\n❌ SIMULATION FAILED!')
    console.log('💡 There may still be an issue with the batch sync or app configuration.')
  }
  process.exit(success ? 0 : 1)
})
