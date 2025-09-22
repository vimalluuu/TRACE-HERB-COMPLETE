// Script to clear all existing batches from localStorage
console.log('🧹 CLEARING ALL EXISTING BATCHES...')

// List of all possible storage keys that might contain batch data
const batchStorageKeys = [
  'farmerBatches',
  'traceHerbBatches',
  'processorBatches',
  'labBatches',
  'regulatoryBatches',
  'batches',
  'herbBatches',
  'collectionData',
  'batchData',
  'farmBatches',
  'qrBatches',
  'herbCollection',
  'batchCollection'
]

console.log('📋 Checking storage keys:', batchStorageKeys)

// Clear each storage key
batchStorageKeys.forEach(key => {
  const existingData = localStorage.getItem(key)
  if (existingData) {
    try {
      const parsed = JSON.parse(existingData)
      if (Array.isArray(parsed)) {
        console.log(`🗑️ Clearing ${parsed.length} items from ${key}`)
      } else {
        console.log(`🗑️ Clearing data from ${key}`)
      }
    } catch (e) {
      console.log(`🗑️ Clearing ${key} (non-JSON data)`)
    }
    localStorage.removeItem(key)
  } else {
    console.log(`✅ ${key} was already empty`)
  }
})

// Also clear any keys that might contain batch-related data
const allKeys = Object.keys(localStorage)
const batchRelatedKeys = allKeys.filter(key => 
  key.toLowerCase().includes('batch') || 
  key.toLowerCase().includes('herb') || 
  key.toLowerCase().includes('trace') ||
  key.toLowerCase().includes('qr') ||
  key.toLowerCase().includes('collection')
)

console.log('🔍 Found additional batch-related keys:', batchRelatedKeys)

batchRelatedKeys.forEach(key => {
  if (!batchStorageKeys.includes(key)) {
    console.log(`🗑️ Clearing additional key: ${key}`)
    localStorage.removeItem(key)
  }
})

// Initialize fresh empty arrays for the main storage keys
const mainKeys = ['farmerBatches', 'traceHerbBatches']
mainKeys.forEach(key => {
  localStorage.setItem(key, JSON.stringify([]))
  console.log(`✅ Initialized empty array for ${key}`)
})

// Trigger storage events to update any listening components
window.dispatchEvent(new StorageEvent('storage', {
  key: 'farmerBatches',
  newValue: '[]',
  storageArea: localStorage
}))

window.dispatchEvent(new StorageEvent('storage', {
  key: 'traceHerbBatches', 
  newValue: '[]',
  storageArea: localStorage
}))

console.log('🎉 ALL BATCHES CLEARED SUCCESSFULLY!')
console.log('📊 Storage is now clean and ready for fresh batch data')
console.log('🔄 Refreshing page to show clean state...')

// Force page refresh to show clean state
setTimeout(() => {
  window.location.reload()
}, 1000)
