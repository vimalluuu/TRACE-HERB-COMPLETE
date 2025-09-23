import { useState, useEffect } from 'react'

const MobileNetworkDiagnostics = ({ isVisible, onClose }) => {
  const [diagnostics, setDiagnostics] = useState({
    isOnline: navigator.onLine,
    backendReachable: false,
    blockchainReachable: false,
    latency: null,
    lastCheck: null,
    errors: []
  })
  const [isRunning, setIsRunning] = useState(false)

  // Run network diagnostics
  const runDiagnostics = async () => {
    setIsRunning(true)
    const results = {
      isOnline: navigator.onLine,
      backendReachable: false,
      blockchainReachable: false,
      latency: null,
      lastCheck: new Date().toISOString(),
      errors: []
    }

    try {
      // Test backend connectivity
      const backendIP = localStorage.getItem('mobile-backend-ip') || 'localhost'
      const backendURL = `http://${backendIP}:3000`
      
      console.log('📱 Testing backend connectivity:', backendURL)
      
      const startTime = Date.now()
      try {
        const response = await fetch(`${backendURL}/health`, {
          method: 'GET',
          timeout: 5000
        })
        
        if (response.ok) {
          results.backendReachable = true
          results.latency = Date.now() - startTime
          console.log('✅ Backend reachable, latency:', results.latency, 'ms')
        } else {
          results.errors.push(`Backend returned ${response.status}: ${response.statusText}`)
        }
      } catch (backendError) {
        results.errors.push(`Backend connection failed: ${backendError.message}`)
        console.error('❌ Backend not reachable:', backendError)
      }

      // Test blockchain API
      if (results.backendReachable) {
        try {
          const blockchainResponse = await fetch(`${backendURL}/api/collection/all`, {
            method: 'GET',
            timeout: 5000
          })
          
          if (blockchainResponse.ok) {
            results.blockchainReachable = true
            console.log('✅ Blockchain API reachable')
          } else {
            results.errors.push(`Blockchain API returned ${blockchainResponse.status}`)
          }
        } catch (blockchainError) {
          results.errors.push(`Blockchain API failed: ${blockchainError.message}`)
          console.error('❌ Blockchain API not reachable:', blockchainError)
        }
      }

      // Test internet connectivity
      if (!results.backendReachable) {
        try {
          const internetTest = await fetch('https://www.google.com/favicon.ico', {
            method: 'HEAD',
            mode: 'no-cors',
            timeout: 3000
          })
          console.log('✅ Internet connectivity confirmed')
        } catch (internetError) {
          results.errors.push('No internet connectivity detected')
          console.error('❌ No internet connectivity:', internetError)
        }
      }

    } catch (error) {
      results.errors.push(`Diagnostics failed: ${error.message}`)
      console.error('❌ Diagnostics error:', error)
    }

    setDiagnostics(results)
    setIsRunning(false)
  }

  // Auto-run diagnostics when component mounts
  useEffect(() => {
    if (isVisible) {
      runDiagnostics()
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Network Diagnostics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Overall Status */}
          <div className={`p-3 rounded-lg ${
            diagnostics.backendReachable && diagnostics.blockchainReachable
              ? 'bg-green-50 border border-green-200'
              : diagnostics.isOnline
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {diagnostics.backendReachable && diagnostics.blockchainReachable
                  ? '✅'
                  : diagnostics.isOnline
                  ? '⚠️'
                  : '❌'
                }
              </span>
              <span className="font-medium">
                {diagnostics.backendReachable && diagnostics.blockchainReachable
                  ? 'All systems operational'
                  : diagnostics.isOnline
                  ? 'Partial connectivity'
                  : 'No connectivity'
                }
              </span>
            </div>
          </div>

          {/* Detailed Status */}
          <div className="space-y-3">
            {/* Internet Connection */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Internet Connection:</span>
              <span className={`text-sm font-medium ${
                diagnostics.isOnline ? 'text-green-600' : 'text-red-600'
              }`}>
                {diagnostics.isOnline ? '✅ Online' : '❌ Offline'}
              </span>
            </div>

            {/* Backend Connection */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backend Server:</span>
              <span className={`text-sm font-medium ${
                diagnostics.backendReachable ? 'text-green-600' : 'text-red-600'
              }`}>
                {diagnostics.backendReachable ? '✅ Connected' : '❌ Unreachable'}
              </span>
            </div>

            {/* Blockchain API */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blockchain API:</span>
              <span className={`text-sm font-medium ${
                diagnostics.blockchainReachable ? 'text-green-600' : 'text-red-600'
              }`}>
                {diagnostics.blockchainReachable ? '✅ Available' : '❌ Unavailable'}
              </span>
            </div>

            {/* Latency */}
            {diagnostics.latency && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time:</span>
                <span className={`text-sm font-medium ${
                  diagnostics.latency < 1000 ? 'text-green-600' : 
                  diagnostics.latency < 3000 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {diagnostics.latency}ms
                </span>
              </div>
            )}
          </div>

          {/* Errors */}
          {diagnostics.errors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-600">Issues Detected:</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                {diagnostics.errors.map((error, index) => (
                  <div key={index} className="text-xs text-red-700 mb-1">
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Recommendations:</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 space-y-1">
              {!diagnostics.isOnline && (
                <div>• Check your WiFi or mobile data connection</div>
              )}
              {diagnostics.isOnline && !diagnostics.backendReachable && (
                <>
                  <div>• Ensure your device is on the same network as the server</div>
                  <div>• Check if the backend server is running</div>
                  <div>• Try disabling firewall temporarily</div>
                </>
              )}
              {diagnostics.backendReachable && !diagnostics.blockchainReachable && (
                <div>• Blockchain network may be starting up, please wait</div>
              )}
              <div>• Your data is saved locally and will sync when connection is restored</div>
            </div>
          </div>

          {/* Last Check */}
          {diagnostics.lastCheck && (
            <div className="text-xs text-gray-500 text-center">
              Last checked: {new Date(diagnostics.lastCheck).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 p-4 border-t border-gray-200">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isRunning
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? '🔄 Testing...' : '🔄 Run Test Again'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileNetworkDiagnostics
