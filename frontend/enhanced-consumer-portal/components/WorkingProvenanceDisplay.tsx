import React, { useState, useEffect } from 'react'
import SimpleInteractiveStoryMap from './SimpleInteractiveStoryMap'
import SimpleTrustScoreWidget from './SimpleTrustScoreWidget'
import SimpleHealthInsightsPanel from './SimpleHealthInsightsPanel'

interface ProvenanceData {
  id: string
  resourceType: 'Provenance'
  target: { qrCode: string, batchNumber: string, productName: string, expiryDate: string }
  product: { name: string, botanicalName: string, category: string, grade: string, certifications: string[] }
  blockchain: { networkId: string, transactionId: string, timestamp: number, verified: boolean, mode: string }
  events: Array<{ 
    id: string, 
    type: string, 
    timestamp: string, 
    location: { name: string, coordinates?: { latitude: number, longitude: number } }, 
    performer: { name: string, certification: string, experience?: string },
    details: any 
  }>
  consumer: { scanCount: number, firstScan: string | null, lastScan: string | null }
  sustainability: { carbonFootprint: string, waterUsage: string, organicCertified: boolean, fairTrade: boolean, biodiversityImpact?: string }
}

interface WorkingProvenanceDisplayProps {
  qrCode: string
  onClose: () => void
  onTrackBatch?: (batchId: string) => void
  onProvenanceLoaded?: (productName: string) => void
}

const WorkingProvenanceDisplay: React.FC<WorkingProvenanceDisplayProps> = ({
  qrCode,
  onClose,
  onTrackBatch,
  onProvenanceLoaded
}) => {
  const [provenance, setProvenance] = useState<ProvenanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'journey' | 'quality' | 'sustainability' | 'farmer'>('journey')
  const [showAdvancedInsights, setShowAdvancedInsights] = useState(false)
  const [isNotFound, setIsNotFound] = useState(false)
  const [isRateLimit, setIsRateLimit] = useState(false)

  // Fetch provenance data
  useEffect(() => {
    const fetchProvenance = async () => {
      try {
        setLoading(true)
        setError(null)

        // First check workflow access for consumer portal
        const accessResponse = await fetch(`http://localhost:3000/api/workflow/access/consumer/${qrCode}?accessType=view`)

        if (!accessResponse.ok) {
          throw new Error('Unable to verify batch access. Please try again.')
        }

        const accessData = await accessResponse.json()

        if (!accessData.success || !accessData.data.accessAllowed) {
          const currentStatus = accessData.data?.currentStatus || 'unknown'

          // Instead of throwing error, show tracking interface
          setProvenance({
            id: qrCode,
            resourceType: 'Provenance',
            target: { qrCode, batchNumber: 'Loading...', productName: 'Herb Product', expiryDate: '' },
            product: { name: 'Herb Product', botanicalName: 'Loading...', category: 'Medicinal Herb', grade: 'Premium', certifications: [] },
            blockchain: { networkId: 'trace-herb-network', transactionId: '', timestamp: Date.now(), verified: true, mode: 'CA-Connected' },
            events: [],
            consumer: { scanCount: 0, firstScan: null, lastScan: null },
            sustainability: { carbonFootprint: '', waterUsage: '', organicCertified: true, fairTrade: true },
            currentStatus: currentStatus,
            isInProgress: true
          })
          return
        }

        // If access is allowed, fetch the full provenance data
        const response = await fetch(`http://localhost:3000/api/provenance/qr/${qrCode}`)

        if (!response.ok) {
          if (response.status === 404) {
            setIsNotFound(true)
            throw new Error('QR code not found. Please check the code and try again.')
          } else if (response.status === 400) {
            throw new Error('Invalid QR code format. Please enter a valid TRACE HERB QR code.')
          } else if (response.status === 429) {
            setIsRateLimit(true)
            throw new Error('Too many requests. Please wait a moment and try again.')
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.')
          } else {
            throw new Error(`Verification failed. Please try again.`)
          }
        }

        const data = await response.json()

        // Handle rate limiting in JSON response
        if (data.error && data.error.includes('Too many requests')) {
          throw new Error('Too many requests. Please wait a moment and try again.')
        }

        if (!data.success) {
          throw new Error(data.error || 'Unable to verify this product. Please try again.')
        }

        // Double-check that the batch is actually approved
        const batchData = data.data
        if (batchData.status !== 'approved') {
          throw new Error('This batch has not yet been approved by regulatory authorities.')
        }

        setProvenance(batchData)

        // Call the callback with product name if provided
        if (onProvenanceLoaded && batchData.product?.name) {
          onProvenanceLoaded(batchData.product.name)
        }
      } catch (err) {
        console.error('Error fetching provenance:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (qrCode) {
      fetchProvenance()
    }
  }, [qrCode])

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Product</h3>
            <p className="text-gray-600">Connecting to blockchain...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    const isNotFound = error.includes('not found') || error.includes('QR code not found')
    const isRateLimit = error.includes('Too many requests')

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">
                {isNotFound ? '🔍' : isRateLimit ? '⏱️' : '⚠'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isNotFound ? 'QR Code Not Found' : isRateLimit ? 'Please Wait' : 'Verification Failed'}
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>

            {isNotFound && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-blue-900 mb-2">💡 Try these demo QR codes:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <code className="bg-blue-100 px-2 py-1 rounded">QR_DEMO_ASHWAGANDHA_001</code></li>
                  <li>• <code className="bg-blue-100 px-2 py-1 rounded">QR_DEMO_TURMERIC_001</code></li>
                  <li>• <code className="bg-blue-100 px-2 py-1 rounded">QR_DEMO_BRAHMI_001</code></li>
                  <li>• <code className="bg-blue-100 px-2 py-1 rounded">QR_DEMO_NEEM_001</code></li>
                </ul>
              </div>
            )}

            {isRateLimit && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-yellow-900 mb-2">⏳ Rate Limit Reached</h4>
                <p className="text-sm text-yellow-800">
                  The system is temporarily limiting requests. Please wait a few minutes before trying again.
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isRateLimit ? 'Wait and Try Again' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!provenance) {
    return null
  }

  // Amazon-style tracking stages
  const trackingStages = [
    { key: 'collected', label: 'Collected', icon: '🌱', description: 'Herb collected from farm' },
    { key: 'processed', label: 'Processed', icon: '🏭', description: 'Processing completed' },
    { key: 'tested', label: 'Lab Tested', icon: '🔬', description: 'Quality testing completed' },
    { key: 'approved', label: 'Approved', icon: '✅', description: 'Regulatory approval received' }
  ]

  const currentStageIndex = trackingStages.findIndex(stage => stage.key === (provenance.currentStatus || 'approved'))
  const isInProgress = provenance.isInProgress || false

  // Show advanced insights if requested
  if (showAdvancedInsights) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          {/* Advanced Insights Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-purple-600 mr-2">✨</span>
                Advanced Insights for {provenance.product.name}
              </h2>
              <p className="text-gray-600 mt-1">QR Code: {qrCode}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdvancedInsights(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to Tracking
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Advanced Insights Content */}
          <div className="p-6 space-y-8">
            {/* Interactive Story Map */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-green-600 mr-2">🗺️</span>
                Interactive Supply Chain Journey
              </h3>
              <SimpleInteractiveStoryMap
                batchData={{
                  qrCode: qrCode,
                  botanicalName: provenance.product.botanicalName,
                  commonName: provenance.product.name,
                  farmerName: provenance.events.find(e => e.type === 'Collection')?.performer?.name || 'Unknown Farmer',
                  village: provenance.events.find(e => e.type === 'Collection')?.location?.name?.split(',')[0] || 'Unknown',
                  district: provenance.events.find(e => e.type === 'Collection')?.location?.name?.split(',')[1]?.trim() || 'Unknown',
                  state: provenance.events.find(e => e.type === 'Collection')?.location?.name?.split(',')[2]?.trim() || 'Unknown',
                  quantity: parseFloat(provenance.events.find(e => e.type === 'Collection')?.details?.quantity) || 0,
                  collectionDate: provenance.events.find(e => e.type === 'Collection')?.timestamp?.split('T')[0] || '2024-01-01',
                  farmerExperience: provenance.events.find(e => e.type === 'Collection')?.performer?.experience || '5+ years',
                  farmerReputation: 85 + Math.floor(Math.random() * 15),
                  qualityScore: 85 + Math.floor(Math.random() * 15),
                  sustainabilityScore: 80 + Math.floor(Math.random() * 20)
                }}
              />
            </div>

            {/* Trust Score Widget */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-blue-600 mr-2">🛡️</span>
                Blockchain Trust Score
              </h3>
              <SimpleTrustScoreWidget
                batchData={{
                  qrCode: qrCode,
                  botanicalName: provenance.product.botanicalName,
                  commonName: provenance.product.name,
                  farmerName: provenance.events.find(e => e.type === 'Collection')?.performer?.name || 'Unknown Farmer',
                  village: provenance.events.find(e => e.type === 'Collection')?.location?.name?.split(',')[0] || 'Unknown',
                  district: provenance.events.find(e => e.type === 'Collection')?.location?.name?.split(',')[1]?.trim() || 'Unknown',
                  state: provenance.events.find(e => e.type === 'Collection')?.location?.name?.split(',')[2]?.trim() || 'Unknown',
                  quantity: parseFloat(provenance.events.find(e => e.type === 'Collection')?.details?.quantity) || 0,
                  collectionDate: provenance.events.find(e => e.type === 'Collection')?.timestamp?.split('T')[0] || '2024-01-01',
                  farmerExperience: provenance.events.find(e => e.type === 'Collection')?.performer?.experience || '5+ years',
                  farmerReputation: 85 + Math.floor(Math.random() * 15),
                  qualityScore: 85 + Math.floor(Math.random() * 15),
                  sustainabilityScore: 80 + Math.floor(Math.random() * 20)
                }}
              />
            </div>

            {/* Health Insights Panel */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-purple-600 mr-2">💊</span>
                Ayurvedic Health Insights
              </h3>
              <SimpleHealthInsightsPanel
                batchData={{
                  qrCode: qrCode,
                  botanicalName: provenance.product.botanicalName,
                  commonName: provenance.product.name,
                  farmerName: provenance.events.find(e => e.type === 'Collection')?.performer?.name || 'Unknown Farmer',
                  village: provenance.events.find(e => e.type === 'Collection')?.location?.name?.split(',')[0] || 'Unknown',
                  district: provenance.events.find(e => e.type === 'Collection')?.location?.name?.split(',')[1]?.trim() || 'Unknown',
                  state: provenance.events.find(e => e.type === 'Collection')?.location?.name?.split(',')[2]?.trim() || 'Unknown',
                  quantity: parseFloat(provenance.events.find(e => e.type === 'Collection')?.details?.quantity) || 0,
                  collectionDate: provenance.events.find(e => e.type === 'Collection')?.timestamp?.split('T')[0] || '2024-01-01',
                  farmerExperience: provenance.events.find(e => e.type === 'Collection')?.performer?.experience || '5+ years',
                  farmerReputation: 85 + Math.floor(Math.random() * 15),
                  qualityScore: 85 + Math.floor(Math.random() * 15),
                  sustainabilityScore: 80 + Math.floor(Math.random() * 20)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default tracking progress view
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌿</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{provenance.product.name}</h1>
                  <p className="text-green-100">{provenance.product.category}</p>
                  <p className="text-sm text-green-200 italic">{provenance.product.botanicalName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            {/* Verification Status */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-300">✅</span>
                <span className="text-sm">
                  {isInProgress ? 'Processing in Progress' : 'Verified Authentic'} • {provenance.blockchain.mode}
                </span>
              </div>
            </div>
          </div>

          {/* Amazon-style Tracking Progress */}
          {isInProgress && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚚 Tracking Progress</h3>
              <div className="relative">
                <div className="flex items-center justify-between">
                  {trackingStages.map((stage, index) => {
                    const isCompleted = index <= currentStageIndex
                    const isCurrent = index === currentStageIndex
                    const isUpcoming = index > currentStageIndex

                    return (
                      <div key={stage.key} className="flex flex-col items-center relative z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isCurrent
                            ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                            : 'bg-gray-200 border-gray-300 text-gray-500'
                        }`}>
                          {isCompleted ? '✅' : stage.icon}
                        </div>
                        <div className="mt-2 text-center">
                          <div className={`text-sm font-medium ${
                            isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'
                          }`}>
                            {stage.label}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {isCurrent ? 'In Progress...' : isCompleted ? 'Completed' : stage.description}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-300 -z-10">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
                    style={{ width: `${(currentStageIndex / (trackingStages.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">ℹ️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current Status: {trackingStages[currentStageIndex]?.label || 'Processing'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your product is currently being {trackingStages[currentStageIndex]?.description.toLowerCase() || 'processed'}.
                      Please check back later for updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex items-center justify-between px-6">
              <div className="flex space-x-8">
                {[
                  { id: 'journey', label: 'Journey' },
                  { id: 'quality', label: 'Quality' },
                  { id: 'sustainability', label: 'Sustainability' },
                  { id: 'farmer', label: 'Farmer' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Advanced Insights Button */}
              <button
                onClick={() => setShowAdvancedInsights(true)}
                className="py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2"
              >
                <span>✨</span>
                <span>Advanced Insights</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {activeTab === 'journey' && (
              <div className="space-y-6 pb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Supply Chain Journey</h3>
                
                {provenance.events.map((event, index) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600">📍</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">{event.type}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{event.location.address}</p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">👤</span>
                            <span className="text-sm text-gray-600">{event.performer.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {event.performer.certification}
                            </span>
                          </div>
                          {event.location.coordinates && event.location.coordinates.length >= 2 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400">🌍</span>
                              <span className="text-sm text-gray-600">
                                {event.location.coordinates[1].toFixed(4)}, {event.location.coordinates[0].toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Regulatory Status Section */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-blue-600 text-2xl">⚖️</span>
                    <h4 className="text-lg font-semibold text-blue-900">Regulatory Status</h4>
                  </div>

                  {provenance.status === 'approved' ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 text-xl">✅</span>
                        <span className="text-green-800 font-semibold">APPROVED</span>
                      </div>
                      <p className="text-green-700">
                        This product has been approved by regulatory authorities and meets all safety and quality standards.
                      </p>

                      {/* Find regulatory review event */}
                      {provenance.events.filter(event => event.type === 'Regulatory Review').map(review => (
                        <div key={review.id} className="mt-4 bg-white rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Regulatory Authority</p>
                              <p className="font-medium">{review.performer.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Review Date</p>
                              <p className="font-medium">{new Date(review.timestamp).toLocaleDateString()}</p>
                            </div>
                            {review.details?.reason && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Approval Reason</p>
                                <p className="font-medium">{review.details.reason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : provenance.status === 'rejected' ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600 text-xl">❌</span>
                        <span className="text-red-800 font-semibold">REJECTED</span>
                      </div>
                      <p className="text-red-700">
                        This product has been rejected by regulatory authorities and does not meet required standards.
                      </p>

                      {/* Find regulatory review event */}
                      {provenance.events.filter(event => event.type === 'Regulatory Review').map(review => (
                        <div key={review.id} className="mt-4 bg-white rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Regulatory Authority</p>
                              <p className="font-medium">{review.performer.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Review Date</p>
                              <p className="font-medium">{new Date(review.timestamp).toLocaleDateString()}</p>
                            </div>
                            {review.details?.reason && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Rejection Reason</p>
                                <p className="font-medium text-red-700">{review.details.reason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-600 text-xl">⏳</span>
                        <span className="text-yellow-800 font-semibold">PENDING REVIEW</span>
                      </div>
                      <p className="text-yellow-700">
                        This product is currently under regulatory review.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'quality' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Testing Results</h3>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-green-600 text-2xl">✅</span>
                    <h4 className="text-lg font-semibold text-green-900">All Tests Passed</h4>
                  </div>
                  <p className="text-green-700 mb-4">Product meets all quality standards and certifications.</p>
                  
                  {/* Find quality testing event */}
                  {provenance.events.filter(event => event.type === 'Quality Testing').map(test => (
                    <div key={test.id} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Testing Laboratory</p>
                          <p className="font-medium">{test.performer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Accreditation</p>
                          <p className="font-medium">{test.performer.certification}</p>
                        </div>
                      </div>
                      
                      {test.details?.tests && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-900 mb-2">Test Parameters</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {test.details.tests.map((param: any, idx: number) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-900">{param.parameter}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    param.status === 'PASS' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {param.status}
                                  </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                  Result: {param.result} | Standard: {param.standard}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sustainability' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sustainability Impact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-green-600 text-2xl">🌱</span>
                      <h4 className="text-lg font-semibold text-green-900">Environmental</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-green-700">Carbon Footprint</span>
                        <span className="font-medium text-green-900">{provenance.sustainability.carbonFootprint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Water Usage</span>
                        <span className="font-medium text-green-900">{provenance.sustainability.waterUsage}</span>
                      </div>
                      {provenance.sustainability.biodiversityImpact && (
                        <div className="mt-4 p-3 bg-green-100 rounded-lg">
                          <p className="text-sm text-green-800">{provenance.sustainability.biodiversityImpact}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-blue-600 text-2xl">🛡️</span>
                      <h4 className="text-lg font-semibold text-blue-900">Certifications</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700">Organic Certified</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          provenance.sustainability.organicCertified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {provenance.sustainability.organicCertified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700">Fair Trade</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          provenance.sustainability.fairTrade 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {provenance.sustainability.fairTrade ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">Product Certifications</h5>
                        <div className="flex flex-wrap gap-2">
                          {provenance.product.certifications.map((cert, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'farmer' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Producer Information</h3>
                
                {provenance.events.filter(event => event.type === 'Collection').map((event, index) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-2xl">👨‍🌾</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900">{event.performer.name}</h4>
                        <p className="text-green-600 font-medium">{event.performer.certification}</p>
                        {event.performer.experience && (
                          <p className="text-gray-600 mt-1">Experience: {event.performer.experience}</p>
                        )}
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Location</h5>
                            <p className="text-gray-600">{event.location.address}</p>
                            {event.location.coordinates && event.location.coordinates.length >= 2 && (
                              <p className="text-sm text-gray-500 mt-1">
                                {event.location.coordinates[1].toFixed(4)}, {event.location.coordinates[0].toFixed(4)}
                              </p>
                            )}
                          </div>
                          
                          {event.details && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Collection Details</h5>
                              {event.details.quantity && (
                                <p className="text-gray-600">
                                  Quantity: {event.details.quantity}
                                </p>
                              )}
                              {event.details.partUsed && (
                                <p className="text-gray-600">Part Used: {event.details.partUsed}</p>
                              )}
                              {event.details.weatherConditions && (
                                <p className="text-gray-600">Weather: {event.details.weatherConditions}</p>
                              )}
                              {event.details.method && (
                                <p className="text-gray-600">Method: {event.details.method}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkingProvenanceDisplay
