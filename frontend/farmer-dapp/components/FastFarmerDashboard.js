import { useState, useEffect } from 'react'
import {
  getAllBatches,
  subscribeToBatchUpdates,
  syncBatchesFromAllSources,
  clearAllDemoData,
  initializeFreshData,
  STATUS_COLORS,
  STATUS_ICONS,
  getStatusIcon as getStatusIconFromUtils
} from '../utils/batchStatusSync'
import { t } from '../utils/simpleTranslations'
import { LanguageSwitchButton } from './SimpleLanguageSelector'

// Status icon helper function
const getStatusIcon = (status) => {
  const icon = getStatusIconFromUtils(status)
  return <span className="text-xl">{icon}</span>
}

// Status colors helper
const getStatusColors = (status) => {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
}

const FastFarmerDashboard = ({ user, onCreateBatch, onShowProfile, onShowBatchTracking, onLogout, currentLanguage = 'en', onLanguageChange }) => {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all') // all, approved, rejected, in-progress

  // INSTANT batch loading - no delays
  const loadBatchesInstantly = () => {
    console.log('⚡ INSTANT LOAD - No delays!')
    
    try {
      // Get from main storage locations only
      const farmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
      const sharedBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
      
      // Combine and deduplicate instantly
      const allBatches = [...farmerBatches, ...sharedBatches]
      const uniqueBatches = []
      const seenQRCodes = new Set()

      allBatches.forEach(batch => {
        if (batch && batch.qrCode && !seenQRCodes.has(batch.qrCode)) {
          seenQRCodes.add(batch.qrCode)
          // Ensure proper status
          if (!batch.status) batch.status = 'pending'
          uniqueBatches.push(batch)
        }
      })

      console.log('⚡ INSTANT LOADED:', uniqueBatches.length, 'batches')
      console.log('⚡ QR CODES:', uniqueBatches.map(b => b.qrCode))
      
      setBatches(uniqueBatches)
      setLoading(false)
      setLastSyncTime(new Date())
      
      return uniqueBatches
    } catch (error) {
      console.error('❌ Error loading batches:', error)
      setLoading(false)
      return []
    }
  }

  // Handle batch click - show tracking without disappearing
  const handleBatchClick = (batch) => {
    console.log('🎯 Batch clicked:', batch)
    console.log('🎯 QR Code:', batch.qrCode)
    console.log('🎯 ID:', batch.id)
    console.log('🎯 Collection ID:', batch.collectionId)

    const batchId = batch.qrCode || batch.id || batch.collectionId
    console.log('🎯 Using batch ID:', batchId)

    // Don't change the batches state - keep them visible
    onShowBatchTracking(batchId)
  }

  useEffect(() => {
    // Load instantly on mount
    loadBatchesInstantly()

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes('batch') || e.key.includes('Batch'))) {
        console.log('🔄 Storage changed, reloading instantly...')
        loadBatchesInstantly()
      }
    }

    // Listen for custom events
    const handleBatchAdded = () => {
      console.log('🎉 New batch added, reloading...')
      loadBatchesInstantly()
    }

    // Real-time updates
    const unsubscribe = subscribeToBatchUpdates((updatedBatches) => {
      console.log('📡 Real-time update received:', updatedBatches.length)
      setBatches(updatedBatches)
      setLastSyncTime(new Date())
    })

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('batchAdded', handleBatchAdded)
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('batchAdded', handleBatchAdded)
      window.removeEventListener('online', () => setIsOnline(true))
      window.removeEventListener('offline', () => setIsOnline(false))
      unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">Loading your batches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                <h1 className="text-2xl font-bold">TRACE HERB</h1>
              </div>
              <div className="text-sm text-gray-500">{t('farmerPortal', currentLanguage)}</div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <span>{isOnline ? '🟢 Online' : '🔴 Offline'}</span>
              </div>

              {/* Last sync time */}
              {lastSyncTime && (
                <div className="text-xs text-gray-500">
                  Updated: {lastSyncTime.toLocaleTimeString()}
                </div>
              )}

              {/* Quick Refresh */}
              <button
                onClick={loadBatchesInstantly}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium"
              >
                🔄 Refresh
              </button>

              {/* User Actions */}
              <div className="flex items-center space-x-2">
                {onLanguageChange && (
                  <LanguageSwitchButton
                    currentLanguage={currentLanguage}
                    onLanguageChange={onLanguageChange}
                  />
                )}
                <button
                  onClick={onShowProfile}
                  className="px-2 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium"
                >
                  <span className="hidden sm:inline">{t('profile', currentLanguage)}</span>
                  <span className="sm:hidden">👤</span>
                </button>
                <button
                  onClick={onLogout}
                  className="px-2 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium"
                >
                  <span className="hidden sm:inline">{t('logout', currentLanguage)}</span>
                  <span className="sm:hidden">🚪</span>
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
                <p className="text-sm font-medium text-gray-600">{t('yourBatches', currentLanguage)}</p>
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
                <p className="text-sm font-medium text-gray-600">{t('batchProgress', currentLanguage)}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => ['pending', 'processing', 'testing'].includes(b.status)).length}
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
                <p className="text-sm font-medium text-gray-600">{t('approved', currentLanguage)}</p>
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
                <p className="text-sm font-medium text-gray-600">{t('rejected', currentLanguage)}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Batch Button */}
        <div className="mb-8">
          <button
            onClick={onCreateBatch}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            + {t('createNewBatch', currentLanguage)}
          </button>
        </div>

        {/* Your Herb Batches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('yourBatches', currentLanguage)}</h2>
                <p className="text-sm text-gray-600">{t('viewBatch', currentLanguage)}</p>
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">{t('filter', currentLanguage)}:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">{t('allBatches', currentLanguage)}</option>
                  <option value="approved">{t('approved', currentLanguage)}</option>
                  <option value="rejected">{t('rejected', currentLanguage)}</option>
                  <option value="in-progress">{t('inProgress', currentLanguage)}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {(() => {
              // Filter batches based on selected filter
              const filteredBatches = batches.filter(batch => {
                if (filterStatus === 'all') return true
                if (filterStatus === 'approved') return batch.status === 'approved'
                if (filterStatus === 'rejected') return batch.status === 'rejected'
                if (filterStatus === 'in-progress') return !['approved', 'rejected'].includes(batch.status)
                return true
              })

              if (filteredBatches.length === 0) {
                return (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌿</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {filterStatus === 'all' ? 'No batches yet' : `No ${filterStatus} batches`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {filterStatus === 'all'
                        ? 'Start by creating your first herb batch'
                        : `You don't have any ${filterStatus} batches at the moment`
                      }
                    </p>
                    {filterStatus === 'all' && (
                      <button
                        onClick={onCreateBatch}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                      >
                        Create First Batch
                      </button>
                    )}
                  </div>
                )
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBatches.map((batch, index) => (
                  <div
                    key={batch.qrCode || batch.id || index}
                    onClick={() => handleBatchClick(batch)}
                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                      batch.status === 'approved' ? 'bg-green-50 border-green-200 hover:border-green-300' :
                      batch.status === 'rejected' ? 'bg-red-50 border-red-200 hover:border-red-300' :
                      batch.status === 'completed' ? 'bg-blue-50 border-blue-200 hover:border-blue-300' :
                      'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Batch Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(batch.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {batch.commonName || batch.botanicalName || 'Unknown Herb'}
                          </h3>
                          <p className="text-sm text-gray-600">{batch.qrCode}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColors(batch.status)}`}>
                        {batch.status || 'pending'}
                      </span>
                    </div>

                    {/* Batch Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{batch.quantity} {batch.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      {batch.farmerName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Farmer:</span>
                          <span className="font-medium">{batch.farmerName}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {batch.status === 'approved' ? '100%' :
                           batch.status === 'rejected' ? 'Rejected' :
                           batch.status === 'tested' ? '85%' :
                           batch.status === 'testing' ? '75%' :
                           batch.status === 'processed' ? '60%' :
                           batch.status === 'processing' ? '40%' :
                           '25%'}
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            batch.status === 'approved' ? 'bg-green-500 w-full' :
                            batch.status === 'rejected' ? 'bg-red-500 w-full' :
                            batch.status === 'tested' ? 'bg-blue-500' :
                            batch.status === 'testing' ? 'bg-blue-500' :
                            batch.status === 'processed' ? 'bg-yellow-500' :
                            batch.status === 'processing' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}
                          style={{
                            width: batch.status === 'approved' ? '100%' :
                                   batch.status === 'rejected' ? '100%' :
                                   batch.status === 'tested' ? '85%' :
                                   batch.status === 'testing' ? '75%' :
                                   batch.status === 'processed' ? '60%' :
                                   batch.status === 'processing' ? '40%' :
                                   '25%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FastFarmerDashboard
