import { useState, useEffect } from 'react'
import { getSyncStatus, forceSyncAll, clearCompleted } from '../utils/mobileBlockchainSync'
import MobileNetworkDiagnostics from './MobileNetworkDiagnostics'

const MobileSyncStatus = ({ isVisible = true }) => {
  const [syncStatus, setSyncStatus] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    isOnline: navigator.onLine,
    syncInProgress: false
  })
  const [showDetails, setShowDetails] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  // Update sync status
  const updateSyncStatus = () => {
    const status = getSyncStatus()
    setSyncStatus(status)
  }

  // Force sync all pending items
  const handleForceSync = async () => {
    if (!syncStatus.isOnline) {
      alert('📱 No internet connection. Please check your network and try again.')
      return
    }

    setIsRefreshing(true)
    try {
      await forceSyncAll()
      updateSyncStatus()
      alert('✅ Sync completed successfully!')
    } catch (error) {
      console.error('Sync failed:', error)
      alert('❌ Sync failed. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Clear completed items
  const handleClearCompleted = () => {
    clearCompleted()
    updateSyncStatus()
  }

  // Update status periodically
  useEffect(() => {
    updateSyncStatus()
    
    const interval = setInterval(updateSyncStatus, 5000) // Update every 5 seconds
    
    // Listen for online/offline events
    const handleOnline = () => updateSyncStatus()
    const handleOffline = () => updateSyncStatus()
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't show if no sync items
  if (!isVisible || syncStatus.total === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Compact Status Indicator */}
      <div 
        className={`bg-white rounded-lg shadow-lg border-2 p-3 cursor-pointer transition-all duration-200 ${
          syncStatus.pending > 0 
            ? 'border-yellow-400 bg-yellow-50' 
            : syncStatus.failed > 0 
            ? 'border-red-400 bg-red-50'
            : 'border-green-400 bg-green-50'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          {/* Status Icon */}
          <div className={`w-3 h-3 rounded-full ${
            !syncStatus.isOnline 
              ? 'bg-gray-400' 
              : syncStatus.syncInProgress 
              ? 'bg-blue-400 animate-pulse'
              : syncStatus.pending > 0 
              ? 'bg-yellow-400' 
              : syncStatus.failed > 0 
              ? 'bg-red-400'
              : 'bg-green-400'
          }`} />
          
          {/* Status Text */}
          <span className="text-sm font-medium">
            {!syncStatus.isOnline 
              ? '📡 Offline' 
              : syncStatus.syncInProgress 
              ? '🔄 Syncing...'
              : syncStatus.pending > 0 
              ? `📱 ${syncStatus.pending} pending`
              : syncStatus.failed > 0 
              ? `❌ ${syncStatus.failed} failed`
              : '✅ All synced'
            }
          </span>
          
          {/* Expand/Collapse Icon */}
          <span className={`text-xs transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Detailed Status Panel */}
      {showDetails && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-w-sm">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Blockchain Sync Status</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Network Status */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Network:</span>
              <span className={`text-sm font-medium ${
                syncStatus.isOnline ? 'text-green-600' : 'text-red-600'
              }`}>
                {syncStatus.isOnline ? '📡 Online' : '📡 Offline'}
              </span>
            </div>

            {/* Sync Statistics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Batches:</span>
                <span className="text-sm font-medium">{syncStatus.total}</span>
              </div>
              
              {syncStatus.completed > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">✅ Synced:</span>
                  <span className="text-sm font-medium text-green-600">{syncStatus.completed}</span>
                </div>
              )}
              
              {syncStatus.pending > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-600">⏳ Pending:</span>
                  <span className="text-sm font-medium text-yellow-600">{syncStatus.pending}</span>
                </div>
              )}
              
              {syncStatus.failed > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">❌ Failed:</span>
                  <span className="text-sm font-medium text-red-600">{syncStatus.failed}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {syncStatus.total > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round((syncStatus.completed / syncStatus.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(syncStatus.completed / syncStatus.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              {syncStatus.pending > 0 && syncStatus.isOnline && (
                <button
                  onClick={handleForceSync}
                  disabled={isRefreshing || syncStatus.syncInProgress}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isRefreshing || syncStatus.syncInProgress
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isRefreshing ? '🔄 Syncing...' : '🔄 Sync Now'}
                </button>
              )}

              {syncStatus.completed > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  🗑️ Clear
                </button>
              )}
            </div>

            {/* Network Diagnostics Button */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowDiagnostics(true)}
                className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                🔍 Network Diagnostics
              </button>
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              {!syncStatus.isOnline 
                ? '📱 Your data is saved locally and will sync when you\'re back online.'
                : syncStatus.pending > 0 
                ? '📱 Some batches are waiting to sync to the blockchain.'
                : '✅ All your batches are synced to the blockchain.'
              }
            </div>
          </div>
        </div>
      )}

      {/* Network Diagnostics Modal */}
      <MobileNetworkDiagnostics
        isVisible={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </div>
  )
}

export default MobileSyncStatus
