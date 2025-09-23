// Mobile Blockchain Synchronization Service
// Handles blockchain sync for mobile devices with network reliability issues

class MobileBlockchainSync {
  constructor() {
    this.isOnline = navigator.onLine
    this.syncQueue = []
    this.retryAttempts = 3
    this.retryDelay = 2000
    this.baseURL = this.getBaseURL()
    this.syncInProgress = false
    
    // Listen for network changes
    window.addEventListener('online', () => {
      console.log('📱 Mobile: Network online - starting sync')
      this.isOnline = true
      this.processSyncQueue()
    })
    
    window.addEventListener('offline', () => {
      console.log('📱 Mobile: Network offline - queuing operations')
      this.isOnline = false
    })
    
    // Start periodic sync
    this.startPeriodicSync()
  }
  
  // Detect if we're on mobile and get appropriate base URL
  getBaseURL() {
    const hostname = window.location.hostname
    
    // If we're on localhost, try to detect the computer's IP
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // For mobile testing, we need the computer's IP address
      // This will be set by the deployment script
      const mobileIP = localStorage.getItem('mobile-backend-ip')
      if (mobileIP) {
        return `http://${mobileIP}:3000`
      }
      return 'http://localhost:3000'
    }
    
    // Use current hostname with backend port
    return `http://${hostname}:3000`
  }
  
  // Add batch to sync queue
  queueBatchSync(batchData) {
    console.log('📱 Mobile: Queuing batch for sync:', batchData.qrCode)
    
    const syncItem = {
      id: Date.now(),
      type: 'batch',
      data: batchData,
      timestamp: new Date().toISOString(),
      attempts: 0,
      status: 'pending'
    }
    
    this.syncQueue.push(syncItem)
    this.saveSyncQueue()
    
    // Try immediate sync if online
    if (this.isOnline) {
      this.processSyncQueue()
    }
    
    return syncItem.id
  }
  
  // Process sync queue
  async processSyncQueue() {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return
    }
    
    console.log('📱 Mobile: Processing sync queue:', this.syncQueue.length, 'items')
    this.syncInProgress = true
    
    const pendingItems = this.syncQueue.filter(item => item.status === 'pending')
    
    for (const item of pendingItems) {
      try {
        await this.syncBatchToBlockchain(item)
      } catch (error) {
        console.error('📱 Mobile: Sync failed for item:', item.id, error)
      }
    }
    
    this.syncInProgress = false
    this.saveSyncQueue()
  }
  
  // Sync individual batch to blockchain
  async syncBatchToBlockchain(syncItem) {
    const { data: batchData } = syncItem
    
    console.log('📱 Mobile: Syncing batch to blockchain:', batchData.qrCode)
    
    try {
      // Prepare collection event data
      const collectionEventData = {
        qrCode: batchData.qrCode,
        collectionId: batchData.collectionId || batchData.qrCode,
        farmer: {
          name: batchData.farmerName || 'Mobile Farmer',
          phone: batchData.farmerPhone || '',
          farmerId: batchData.farmerId || '',
          village: batchData.farmLocation || '',
          district: batchData.district || '',
          state: batchData.state || ''
        },
        herb: {
          botanicalName: batchData.botanicalName,
          commonName: batchData.commonName,
          ayurvedicName: batchData.ayurvedicName,
          partUsed: batchData.partUsed,
          quantity: batchData.quantity,
          unit: batchData.unit,
          collectionMethod: batchData.collectionMethod,
          season: batchData.season,
          weatherConditions: batchData.weatherConditions,
          soilType: batchData.soilType,
          notes: batchData.notes
        },
        location: batchData.location || {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          timestamp: new Date().toISOString()
        },
        timestamp: batchData.createdAt || new Date().toISOString(),
        metadata: {
          source: 'mobile-farmer-dapp',
          deviceInfo: this.getDeviceInfo(),
          networkStatus: this.isOnline ? 'online' : 'offline',
          syncAttempt: syncItem.attempts + 1
        }
      }
      
      // Try multiple endpoints for better reliability
      const endpoints = [
        '/api/collection/events',
        '/api/collection/submit',
        '/api/batches'
      ]
      
      let success = false
      let lastError = null
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.makeRequest('POST', endpoint, collectionEventData)
          
          if (response.success) {
            console.log('✅ Mobile: Batch synced successfully via', endpoint)
            syncItem.status = 'completed'
            syncItem.completedAt = new Date().toISOString()
            syncItem.response = response
            success = true
            break
          }
        } catch (error) {
          lastError = error
          console.warn('📱 Mobile: Endpoint failed:', endpoint, error.message)
        }
      }
      
      if (!success) {
        throw lastError || new Error('All sync endpoints failed')
      }
      
    } catch (error) {
      syncItem.attempts++
      syncItem.lastError = error.message
      syncItem.lastAttempt = new Date().toISOString()
      
      if (syncItem.attempts >= this.retryAttempts) {
        console.error('📱 Mobile: Max retry attempts reached for batch:', batchData.qrCode)
        syncItem.status = 'failed'
      } else {
        console.log(`📱 Mobile: Retry ${syncItem.attempts}/${this.retryAttempts} for batch:`, batchData.qrCode)
        // Schedule retry
        setTimeout(() => {
          if (this.isOnline) {
            this.processSyncQueue()
          }
        }, this.retryDelay * syncItem.attempts)
      }
      
      throw error
    }
  }
  
  // Make HTTP request with mobile-specific handling
  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`
    
    console.log('📱 Mobile: Making request to:', url)
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TRACE-HERB-Mobile-DApp/1.0',
        'X-Mobile-Client': 'true'
      },
      timeout: 10000 // 10 second timeout for mobile
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  }
  
  // Get device information for metadata
  getDeviceInfo() {
    const userAgent = navigator.userAgent
    return {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      browser: this.getBrowserInfo(),
      timestamp: new Date().toISOString(),
      online: this.isOnline
    }
  }
  
  getBrowserInfo() {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }
  
  // Save sync queue to localStorage
  saveSyncQueue() {
    try {
      localStorage.setItem('mobile-sync-queue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('📱 Mobile: Failed to save sync queue:', error)
    }
  }
  
  // Load sync queue from localStorage
  loadSyncQueue() {
    try {
      const saved = localStorage.getItem('mobile-sync-queue')
      if (saved) {
        this.syncQueue = JSON.parse(saved)
        console.log('📱 Mobile: Loaded sync queue:', this.syncQueue.length, 'items')
      }
    } catch (error) {
      console.error('📱 Mobile: Failed to load sync queue:', error)
      this.syncQueue = []
    }
  }
  
  // Start periodic sync every 30 seconds
  startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        console.log('📱 Mobile: Periodic sync check...')
        this.processSyncQueue()
      }
    }, 30000)
  }
  
  // Get sync status
  getSyncStatus() {
    const pending = this.syncQueue.filter(item => item.status === 'pending').length
    const completed = this.syncQueue.filter(item => item.status === 'completed').length
    const failed = this.syncQueue.filter(item => item.status === 'failed').length
    
    return {
      total: this.syncQueue.length,
      pending,
      completed,
      failed,
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress
    }
  }
  
  // Clear completed items from queue
  clearCompleted() {
    this.syncQueue = this.syncQueue.filter(item => item.status !== 'completed')
    this.saveSyncQueue()
    console.log('📱 Mobile: Cleared completed sync items')
  }
  
  // Force sync all pending items
  async forceSyncAll() {
    console.log('📱 Mobile: Force syncing all pending items...')
    await this.processSyncQueue()
  }
}

// Create global instance
const mobileSync = new MobileBlockchainSync()

// Load existing queue on startup
mobileSync.loadSyncQueue()

// Export for use in components
export default mobileSync

// Export utility functions
export const queueBatchForSync = (batchData) => mobileSync.queueBatchSync(batchData)
export const getSyncStatus = () => mobileSync.getSyncStatus()
export const forceSyncAll = () => mobileSync.forceSyncAll()
export const clearCompleted = () => mobileSync.clearCompleted()

// Auto-start sync when online
if (navigator.onLine) {
  setTimeout(() => mobileSync.processSyncQueue(), 1000)
}
