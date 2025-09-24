// Test script to verify farmer batch access via workflow API
console.log('🧪 TESTING FARMER BATCH ACCESS...')

const targetBatchId = 'QR_COL_1758658303156_B7603EA1'

// Function to test batch access
const testBatchAccess = async () => {
  const http = require('http')
  
  try {
    console.log(`🔍 Testing access to batch: ${targetBatchId}`)
    
    const options = {
      hostname: '172.16.126.195',
      port: 3000,
      path: `/api/workflow/access/farmer/${encodeURIComponent(targetBatchId)}?accessType=view`,
      method: 'GET'
    }

    console.log(`📡 Testing: http://172.16.126.195:3000/api/workflow/access/farmer/${targetBatchId}?accessType=view`)

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const result = JSON.parse(data)
              console.log('✅ BATCH ACCESS TEST SUCCESSFUL!')
              console.log('📋 Response:', JSON.stringify(result, null, 2))
              
              if (result.success && result.data.accessAllowed) {
                console.log('🎉 FARMER CAN ACCESS THE BATCH!')
                console.log('📊 Batch Status:', result.data.currentStatus)
                console.log('🔑 Access Allowed:', result.data.accessAllowed)
                console.log('💬 Reason:', result.data.reason)
                
                if (result.data.batch) {
                  console.log('📦 Batch Data Available:', !!result.data.batch)
                  console.log('🏷️ Product Name:', result.data.batch.target?.productName)
                  console.log('🌿 Botanical Name:', result.data.batch.product?.botanicalName)
                  console.log('👨‍🌾 Farmer:', result.data.batch.events?.[0]?.performer?.name)
                  console.log('📍 Location:', result.data.batch.events?.[0]?.location?.address)
                  console.log('⚖️ Quantity:', result.data.batch.events?.[0]?.details?.quantity)
                }
                
                resolve(true)
              } else {
                console.log('❌ ACCESS DENIED!')
                console.log('💬 Reason:', result.data?.reason || 'Unknown')
                resolve(false)
              }
            } catch (e) {
              console.error('❌ Failed to parse response:', e.message)
              console.log('📄 Raw response:', data)
              resolve(false)
            }
          } else {
            console.error('❌ HTTP Error:', res.statusCode)
            console.log('📄 Response:', data)
            resolve(false)
          }
        })
      })
      
      req.on('error', (err) => {
        console.error('❌ Request error:', err.message)
        resolve(false)
      })
      
      req.end()
    })
    
  } catch (error) {
    console.error('❌ Test error:', error)
    return false
  }
}

// Test other portals too
const testOtherPortalAccess = async () => {
  const portals = ['processor', 'lab', 'regulator']
  
  for (const portal of portals) {
    console.log(`\n🔍 Testing ${portal} portal access...`)
    
    const http = require('http')
    const options = {
      hostname: '172.16.126.195',
      port: 3000,
      path: `/api/workflow/access/${portal}/${encodeURIComponent(targetBatchId)}?accessType=view`,
      method: 'GET'
    }

    try {
      const result = await new Promise((resolve) => {
        const req = http.request(options, (res) => {
          let data = ''
          res.on('data', (chunk) => { data += chunk })
          res.on('end', () => {
            try {
              const json = JSON.parse(data)
              resolve(json)
            } catch (e) {
              resolve({ error: 'Parse error', raw: data })
            }
          })
        })
        req.on('error', (err) => resolve({ error: err.message }))
        req.end()
      })
      
      if (result.success && result.data.accessAllowed) {
        console.log(`✅ ${portal.toUpperCase()} can access the batch!`)
        console.log(`📊 Status: ${result.data.currentStatus}`)
      } else if (result.success) {
        console.log(`⚠️ ${portal.toUpperCase()} cannot access: ${result.data.reason}`)
      } else {
        console.log(`❌ ${portal.toUpperCase()} access test failed:`, result.error || result.message)
      }
    } catch (e) {
      console.log(`❌ ${portal.toUpperCase()} test error:`, e.message)
    }
  }
}

// Execute the tests
console.log('🚀 Starting batch access tests...')
testBatchAccess().then(success => {
  if (success) {
    console.log('\n🎉 FARMER BATCH ACCESS TEST PASSED!')
    console.log('📱 The farmer mobile app should now be able to access this batch.')
    
    // Test other portals
    return testOtherPortalAccess()
  } else {
    console.log('\n❌ FARMER BATCH ACCESS TEST FAILED!')
    console.log('💡 The batch may not be properly synced or there may be a configuration issue.')
  }
}).then(() => {
  console.log('\n✅ ALL TESTS COMPLETED!')
  process.exit(0)
})
