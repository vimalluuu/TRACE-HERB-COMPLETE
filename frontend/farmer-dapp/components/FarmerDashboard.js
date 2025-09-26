import { useState, useEffect } from 'react'
import {
  getAllBatches,
  subscribeToBatchUpdates,
  syncBatchesFromAllSources,
  clearAllDemoData,
  initializeFreshData,
  STATUS_COLORS,
  STATUS_ICONS,
  STATUS_LABELS,
  getStatusProgress
} from '../utils/batchStatusSync'

// Icon components using emojis
const PlusIcon = ({ className }) => <span className={className}>➕</span>
const ClockIcon = ({ className }) => <span className={className}>🕐</span>
const CheckCircleIcon = ({ className }) => <span className={className}>✅</span>
const ExclamationTriangleIcon = ({ className }) => <span className={className}>⚠️</span>
const BeakerIcon = ({ className }) => <span className={className}>🧪</span>
const TruckIcon = ({ className }) => <span className={className}>🚚</span>
const UserIcon = ({ className }) => <span className={className}>👤</span>
const ArrowRightIcon = ({ className }) => <span className={className}>➡️</span>
const WifiIcon = ({ className }) => <span className={className}>📶</span>
const CloudIcon = ({ className }) => <span className={className}>☁️</span>
const SyncIcon = ({ className }) => <span className={className}>🔄</span>

const FarmerDashboard = ({ user, onCreateBatch, onShowProfile, onShowBatchTracking, onLogout }) => {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        console.log('🚀 Initializing Farmer Dashboard - DIRECT APPROACH...')

        // DIRECT APPROACH: Check all possible storage locations immediately
        const allStorageKeys = [
          'traceHerbBatches',
          'farmerBatches',
          'processorBatches',
          'labBatches',
          'regulatoryBatches',
          'batches',
          'herbBatches',
          'collectionData'
        ]

        let allFoundBatches = []

        allStorageKeys.forEach(key => {
          try {
            const data = localStorage.getItem(key)
            if (data) {
              const parsed = JSON.parse(data)
              if (Array.isArray(parsed)) {
                console.log(`� Found ${parsed.length} batches in ${key}:`, parsed)
                allFoundBatches = [...allFoundBatches, ...parsed]
              } else if (parsed && typeof parsed === 'object') {
                console.log(`📦 Found single batch in ${key}:`, parsed)
                allFoundBatches.push(parsed)
              }
            }
          } catch (error) {
            console.log(`❌ Error reading ${key}:`, error)
          }
        })

        // Remove duplicates based on QR code
        const uniqueBatches = []
        const seenQRCodes = new Set()

        allFoundBatches.forEach(batch => {
          if (batch && batch.qrCode && !seenQRCodes.has(batch.qrCode)) {
            seenQRCodes.add(batch.qrCode)
            uniqueBatches.push(batch)
            console.log('✅ Added unique batch:', batch.qrCode, batch.status)
          }
        })

        console.log('📦 TOTAL UNIQUE BATCHES FOUND:', uniqueBatches.length)
        console.log('📦 BATCH QR CODES:', uniqueBatches.map(b => b.qrCode))

        // Check specifically for the user's batch
        const userBatch = uniqueBatches.find(b => b.qrCode === 'QR_COL_1758550427695_4790B62D')
        if (userBatch) {
          console.log('🎉 FOUND USER BATCH:', userBatch)
        } else {
          console.log('❌ USER BATCH NOT FOUND, checking localStorage directly...')

          // Check all localStorage keys for the batch
          const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
          const sharedBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
          const allStorageBatches = [...farmerBatches, ...sharedBatches]

          console.log('🔍 Direct localStorage check:')
          console.log('- farmerBatches:', farmerBatches.length)
          console.log('- sharedBatches:', sharedBatches.length)
          console.log('- Looking for QR_COL_1758550427695_4790B62D...')

          const foundBatch = allStorageBatches.find(b =>
            b.qrCode === 'QR_COL_1758550427695_4790B62D' ||
            b.id === 'COL_1758550427695_4790B62D' ||
            b.collectionId === 'COL_1758550427695_4790B62D'
          )

          if (foundBatch) {
            console.log('🎯 FOUND BATCH IN DIRECT STORAGE:', foundBatch)
            uniqueBatches.push(foundBatch)
          } else {
            console.log('💔 Batch not found anywhere')
          }
        }

        // Set all found batches - NO FILTERING
        setBatches(uniqueBatches)
        setLastSyncTime(new Date())
        setLoading(false)

        // Also try the sync approach as backup
        try {
          const syncedBatches = await syncBatchesFromAllSources()
          if (syncedBatches.length > uniqueBatches.length) {
            console.log('📦 Sync found more batches, updating...')
            setBatches(syncedBatches)
          }
        } catch (syncError) {
          console.log('⚠️ Sync failed, using direct approach results')
        }

      } catch (error) {
        console.error('❌ Error initializing dashboard:', error)
        setLoading(false)
      }
    }

    initializeDashboard()

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      syncBatchesFromAllSources().then(syncedBatches => {
        const userBatches = syncedBatches.filter(batch => {
          // Show ALL generated batch data for farmer tracking
          if (batch.qrCode && batch.qrCode.includes('QR_')) {
            return true
          }
          if (batch.farmerName === user?.firstName + ' ' + user?.lastName ||
              batch.farmerName === user?.username) {
            return true
          }
          if (!batch.farmerName || batch.farmerName === 'Unknown') {
            return true
          }
          return false
        })
        setBatches(userBatches)
      })
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Subscribe to real-time batch updates
    const unsubscribe = subscribeToBatchUpdates((updatedBatches) => {
      const userBatches = updatedBatches.filter(batch =>
        !batch.farmerName || 
        batch.farmerName === user?.firstName + ' ' + user?.lastName || 
        batch.farmerName === user?.username ||
        batch.farmerName === 'Unknown'
      )
      setBatches(userBatches)
      console.log('🔄 Real-time batch updates received:', userBatches.length)
    })

    // Listen for storage changes to detect new batches
    const handleStorageChange = (e) => {
      console.log('📦 Storage changed:', e.key)
      if (e.key && (e.key.includes('batch') || e.key.includes('Batch') || e.key.includes('collection'))) {
        console.log('🔄 Batch-related storage changed, reloading...')
        setTimeout(() => initializeDashboard(), 100) // Small delay to ensure storage is updated
      }
    }

    // Listen for custom batch events
    const handleBatchAdded = (e) => {
      console.log('🎉 Custom batch event received:', e.detail)
      setTimeout(() => initializeDashboard(), 100)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('batchAdded', handleBatchAdded)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('batchAdded', handleBatchAdded)
      unsubscribe()
    }
  }, [user])

  // Auto-refresh to check for new batch data every 10 seconds
  useEffect(() => {
    const autoRefreshInterval = setInterval(async () => {
      if (!syncInProgress && isOnline) {
        try {
          console.log('🔄 Auto-refreshing batch data...')
          const syncedBatches = await syncBatchesFromAllSources()
          const userBatches = syncedBatches.filter(batch => {
            // Show ALL generated batch data for farmer tracking
            if (batch.qrCode && batch.qrCode.includes('QR_')) {
              return true
            }
            if (batch.farmerName === user?.firstName + ' ' + user?.lastName ||
                batch.farmerName === user?.username) {
              return true
            }
            if (!batch.farmerName || batch.farmerName === 'Unknown') {
              return true
            }
            return false
          })

          // Only update if there are changes
          if (JSON.stringify(userBatches) !== JSON.stringify(batches)) {
            setBatches(userBatches)
            setLastSyncTime(new Date())
            console.log('✅ Auto-refresh: Found', userBatches.length, 'batches')
          }
        } catch (error) {
          console.error('❌ Auto-refresh failed:', error)
        }
      }
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(autoRefreshInterval)
  }, [syncInProgress, isOnline, batches, user])

  // Pull-to-refresh functionality
  useEffect(() => {
    let startY = 0
    let currentY = 0
    let isScrolling = false

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
        isScrolling = true
      }
    }

    const handleTouchMove = (e) => {
      if (!isScrolling || window.scrollY > 0) return

      currentY = e.touches[0].clientY
      const distance = Math.max(0, Math.min(120, currentY - startY))

      if (distance > 0) {
        e.preventDefault()
        setPullDistance(distance)
        setIsPulling(distance > 60)
      }
    }

    const handleTouchEnd = async () => {
      if (isPulling && pullDistance > 60) {
        setSyncInProgress(true)
        try {
          const syncedBatches = await syncBatchesFromAllSources()
          const userBatches = syncedBatches.filter(batch => {
            // Show ALL generated batch data for farmer tracking
            if (batch.qrCode && batch.qrCode.includes('QR_')) {
              return true
            }
            if (batch.farmerName === user?.firstName + ' ' + user?.lastName ||
                batch.farmerName === user?.username) {
              return true
            }
            if (!batch.farmerName || batch.farmerName === 'Unknown') {
              return true
            }
            return false
          })
          setBatches(userBatches)
          setLastSyncTime(new Date())
          console.log('✅ Pull-to-refresh completed:', userBatches.length, 'batches')
        } catch (error) {
          console.error('❌ Pull-to-refresh failed:', error)
        } finally {
          setSyncInProgress(false)
        }
      }

      setIsPulling(false)
      setPullDistance(0)
      isScrolling = false
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullDistance, user])

  // Removed manual sync and force refresh functions - using pull-to-refresh and auto-refresh instead

  const getStatusIcon = (status) => {
    const icon = STATUS_ICONS[status] || '🟡'
    return <span className="text-2xl">{icon}</span>
  }

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
  }

  // Get detailed status message with current stage info
  const getDetailedStatusMessage = (batch) => {
    const status = batch.status
    const now = new Date()
    const lastUpdated = new Date(batch.lastUpdated || batch.createdAt)
    const timeDiff = Math.floor((now - lastUpdated) / (1000 * 60)) // minutes ago
    
    const timeAgo = timeDiff < 1 ? 'Just now' : 
                   timeDiff < 60 ? `${timeDiff} min ago` : 
                   timeDiff < 1440 ? `${Math.floor(timeDiff/60)} hr ago` : 
                   `${Math.floor(timeDiff/1440)} days ago`
    
    switch (status) {
      case 'pending':
        return {
          primary: 'Waiting for Processor Pickup',
          secondary: `Submitted ${timeAgo}`,
          stage: 'Farmer',
          action: 'Batch created and ready for collection'
        }
      case 'processing':
        return {
          primary: 'Currently Under Processor Review',
          secondary: `Processing started ${timeAgo}`,
          stage: 'Processor',
          action: batch.processingData?.processor ? 
            `Being processed by ${batch.processingData.processor}` : 
            'Processing in progress'
        }
      case 'processed':
        return {
          primary: 'Approved by Processor',
          secondary: `Completed ${timeAgo}`,
          stage: 'Processor → Lab',
          action: batch.processingData?.processor ? 
            `Successfully processed by ${batch.processingData.processor}` : 
            'Processing completed, sent to laboratory'
        }
      case 'testing':
        return {
          primary: 'Currently Under Lab Testing',
          secondary: `Testing started ${timeAgo}`,
          stage: 'Laboratory',
          action: 'Quality testing and analysis in progress'
        }
      case 'tested':
        return {
          primary: 'Approved by Laboratory',
          secondary: `Testing completed ${timeAgo}`,
          stage: 'Lab → Regulatory',
          action: batch.testResults?.lab ? 
            `Quality verified by ${batch.testResults.lab}` : 
            'Lab testing completed, sent for regulatory review'
        }
      case 'approved':
        return {
          primary: 'Approved by Regulatory Authority',
          secondary: `Approved ${timeAgo}`,
          stage: 'Regulatory',
          action: batch.regulatoryComments || 'Meets all quality and safety standards'
        }
      case 'rejected':
        return {
          primary: 'Rejected by Regulatory Authority',
          secondary: `Rejected ${timeAgo}`,
          stage: 'Regulatory',
          action: batch.rejectionReason || 'Quality standards not met'
        }
      case 'completed':
        return {
          primary: 'Process Complete',
          secondary: `Completed ${timeAgo}`,
          stage: 'Final',
          action: 'Ready for market distribution'
        }
      default:
        return {
          primary: 'Status Unknown',
          secondary: `Updated ${timeAgo}`,
          stage: 'Unknown',
          action: 'Please contact support'
        }
    }
  }

  // Get next expected step
  const getNextStep = (batch) => {
    const status = batch.status
    switch (status) {
      case 'pending': return 'Processor will collect and review your batch'
      case 'processing': return 'Processor is currently reviewing and processing'
      case 'processed': return 'Laboratory will conduct quality testing'
      case 'testing': return 'Laboratory is conducting quality analysis'
      case 'tested': return 'Regulatory authority will make final decision'
      case 'approved': return 'Batch is ready for market distribution'
      case 'rejected': return 'Review rejection details and resubmit if possible'
      case 'completed': return 'Process complete - no further action needed'
      default: return 'Status will be updated soon'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50" style={{
      transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`,
      transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
    }}>
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg transition-all duration-200"
          style={{
            height: `${Math.min(pullDistance, 80)}px`,
            transform: `translateY(-${Math.max(0, 80 - pullDistance)}px)`,
            opacity: Math.min(pullDistance / 60, 1)
          }}
        >
          <div className="flex items-center space-x-2">
            <SyncIcon className={`h-5 w-5 ${isPulling ? 'animate-spin' : 'animate-bounce'}`} />
            <span className="text-sm font-medium">
              {isPulling ? '🔄 Release to refresh' : '⬇️ Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                <h1 className="text-2xl font-bold">TRACE HERB</h1>
              </div>
              <div className="text-sm text-gray-500">Farmer Dashboard</div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <WifiIcon className="h-3 w-3" />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {/* Auto-sync indicator */}
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                <div className={`w-2 h-2 rounded-full ${syncInProgress ? 'bg-blue-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
                <span>{syncInProgress ? 'Syncing...' : 'Auto-sync'}</span>
              </div>

              {/* Last sync time */}
              {lastSyncTime && (
                <div className="text-xs text-gray-500">
                  Last sync: {lastSyncTime.toLocaleTimeString()}
                </div>
              )}

              {/* Debug Button */}
              <button
                onClick={() => {
                  console.log('🔍 DEBUG: All localStorage data:')
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    const value = localStorage.getItem(key)
                    if (key.includes('batch') || key.includes('Batch') || key.includes('trace') || key.includes('herb')) {
                      console.log(`${key}:`, value)
                    }
                  }
                }}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200 text-xs font-medium"
              >
                🔍 Debug
              </button>

              {/* Manual Refresh Button */}
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered')
                  setLoading(true)
                  setTimeout(() => {
                    window.location.reload()
                  }, 100)
                }}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 text-xs font-medium"
              >
                🔄 Refresh
              </button>

              {/* Pull-to-refresh hint for mobile */}
              <div className="hidden sm:block text-xs text-gray-400">
                Pull down to refresh
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={onShowProfile}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Profile
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => ['pending', 'processing', 'processed', 'testing', 'tested'].includes(b.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Batches Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Your Herb Batches</h2>
              <button
                onClick={onCreateBatch}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Batch</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Debug Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Debug:</strong> Found {batches.length} batches |
                Loading: {loading ? 'Yes' : 'No'} |
                Sync in progress: {syncInProgress ? 'Yes' : 'No'}
              </p>
              {batches.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Batch QR codes: {batches.map(b => b.qrCode).join(', ')}
                </p>
              )}
            </div>

            {batches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌿</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first herb batch to track its journey.</p>
                <button
                  onClick={onCreateBatch}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Your First Batch</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => {
                  const statusInfo = getDetailedStatusMessage(batch)
                  const progress = getStatusProgress(batch.status)
                  
                  return (
                    <div key={batch.id || batch.qrCode} className={`rounded-xl p-6 border-2 hover:shadow-lg transition-all duration-200 ${
                      batch.status === 'approved' ? 'bg-green-50 border-green-200 shadow-green-100' :
                      batch.status === 'rejected' ? 'bg-red-50 border-red-200 shadow-red-100' :
                      batch.status === 'completed' ? 'bg-blue-50 border-blue-200 shadow-blue-100' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      {/* Batch Header with Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(batch.status)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{batch.commonName || batch.botanicalName}</h3>
                            <p className="text-sm text-gray-500 font-mono">{batch.qrCode}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${getStatusColor(batch.status)}`}>
                            {STATUS_LABELS[batch.status] || batch.status}
                          </span>
                          {/* Sync Status Indicator */}
                          {batch.createdOffline && (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
                              <svg className="w-3 h-3 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span className="text-xs font-medium text-yellow-700">Sync Pending</span>
                            </div>
                          )}
                          {/* Large Status Indicator */}
                          {batch.status === 'approved' && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <span className="text-2xl">✅</span>
                              <span className="text-sm font-bold">APPROVED</span>
                            </div>
                          )}
                          {batch.status === 'rejected' && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <span className="text-2xl">❌</span>
                              <span className="text-sm font-bold">REJECTED</span>
                            </div>
                          )}
                          {batch.status === 'completed' && (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <span className="text-2xl">🎉</span>
                              <span className="text-sm font-bold">COMPLETED</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              batch.status === 'rejected' ? 'bg-red-500' : 
                              batch.status === 'approved' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Detailed Status Info */}
                      <div className="space-y-3">
                        {/* Current Status */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{statusInfo.primary}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              {statusInfo.stage}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{statusInfo.action}</p>
                          <p className="text-xs text-gray-500">{statusInfo.secondary}</p>
                        </div>
                        
                        {/* Next Step or Rejection Details */}
                        {batch.status === 'rejected' ? (
                          <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs text-white">❌</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-red-900 mb-2">Rejection Details:</p>
                                <p className="text-sm text-red-800 mb-2">
                                  {batch.rejectionReason || batch.regulatoryComments || 'Quality standards not met'}
                                </p>
                                <p className="text-xs text-red-600">
                                  Contact support for guidance on resubmission requirements.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : batch.status === 'approved' ? (
                          <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs text-white">✅</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-green-900 mb-2">Approval Confirmed:</p>
                                <p className="text-sm text-green-800 mb-2">
                                  {batch.regulatoryComments || 'Your batch meets all quality and safety standards'}
                                </p>
                                <p className="text-xs text-green-600">
                                  Ready for market distribution and sale.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs">📋</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">What's Next:</p>
                              <p className="text-sm text-gray-600">{getNextStep(batch)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Customer Feedback Section */}
            <FeedbackSection user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Feedback Section Component
const FeedbackSection = ({ user }) => {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeedbacks = () => {
      try {
        const farmerFeedbacks = JSON.parse(localStorage.getItem('farmerFeedbacks') || '[]')
        // Filter feedbacks for this farmer
        const userFeedbacks = farmerFeedbacks.filter(feedback =>
          feedback.farmerName === user?.firstName + ' ' + user?.lastName ||
          feedback.farmerName === user?.username ||
          feedback.farmerName === 'Unknown Farmer' // Include unknown farmer feedbacks for demo
        )
        setFeedbacks(userFeedbacks)
      } catch (error) {
        console.error('Error loading feedbacks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFeedbacks()

    // Poll for new feedbacks every 30 seconds
    const interval = setInterval(loadFeedbacks, 30000)
    return () => clearInterval(interval)
  }, [user])

  const StarDisplay = ({ rating }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-blue-600 mr-2">💬</span>
          Customer Feedback
        </h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600">No customer feedback yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Customer feedback will appear here when consumers rate your approved products.
          </p>
        </div>
      </div>
    )
  }

  const averageRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length
  const recommendationRate = feedbacks.filter(f => f.recommend === true).length / feedbacks.length * 100

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="text-blue-600 mr-2">💬</span>
        Customer Feedback ({feedbacks.length})
      </h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <StarDisplay rating={Math.round(averageRating)} />
            <span className="font-bold text-yellow-900">{averageRating.toFixed(1)}</span>
          </div>
          <p className="text-sm text-yellow-700">Average Rating</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-900 mb-1">
            {recommendationRate.toFixed(0)}%
          </div>
          <p className="text-sm text-green-700">Recommendation Rate</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-900 mb-1">
            {feedbacks.length}
          </div>
          <p className="text-sm text-blue-700">Total Reviews</p>
        </div>
      </div>

      {/* Individual Feedbacks */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{feedback.productName}</h4>
                <p className="text-sm text-gray-500">Batch: {feedback.batchId}</p>
              </div>
              <div className="text-right">
                <StarDisplay rating={feedback.rating} />
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(feedback.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-2">
              <span className="text-sm font-medium text-gray-700">{feedback.userName}</span>
              {feedback.verified && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  ✓ Verified Purchase
                </span>
              )}
              {feedback.recommend !== null && (
                <span className={`text-sm font-medium ${
                  feedback.recommend ? 'text-green-600' : 'text-red-600'
                }`}>
                  {feedback.recommend ? '👍 Recommends' : '👎 Does not recommend'}
                </span>
              )}
            </div>

            {feedback.comment && (
              <p className="text-gray-700 text-sm bg-gray-50 rounded p-3 mt-2">
                "{feedback.comment}"
              </p>
            )}

            {/* Detailed Aspects */}
            {Object.keys(feedback.aspects).some(key => feedback.aspects[key] > 0) && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(feedback.aspects).map(([aspect, rating]) => (
                  rating > 0 && (
                    <div key={aspect} className="text-center">
                      <p className="text-xs text-gray-500 capitalize">{aspect}</p>
                      <StarDisplay rating={rating} />
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FarmerDashboard
