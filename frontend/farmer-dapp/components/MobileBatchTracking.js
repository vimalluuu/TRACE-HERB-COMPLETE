import { useState, useEffect, useRef } from 'react'
import { QrCodeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'

const MobileBatchTracking = ({ batch, onBack }) => {
  const [activeTab, setActiveTab] = useState('timeline')
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const containerRef = useRef(null)

  // Minimum swipe distance
  const minSwipeDistance = 50

  // Handle touch events for swipe gestures
  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
    
    // Handle pull-to-refresh
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      const touchY = e.targetTouches[0].clientY
      const startY = e.targetTouches[0].clientY
      const distance = Math.max(0, touchY - startY)
      
      if (distance > 0 && distance < 100) {
        setPullDistance(distance)
        e.preventDefault()
      }
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    // Handle tab switching with swipe
    if (isLeftSwipe && activeTab === 'timeline') {
      setActiveTab('details')
    } else if (isRightSwipe && activeTab === 'details') {
      setActiveTab('timeline')
    }

    // Handle pull-to-refresh
    if (pullDistance > 60) {
      handleRefresh()
    }
    
    setPullDistance(0)
  }

  // Refresh batch data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  // Generate timeline steps
  const getTimelineSteps = () => {
    const steps = [
      {
        id: 1,
        title: 'Collection',
        status: 'completed',
        timestamp: batch.createdAt || new Date().toISOString(),
        icon: '🌿',
        description: 'Herb collected from farm'
      },
      {
        id: 2,
        title: 'Processing',
        status: batch.status === 'processing' || ['processed', 'testing', 'tested', 'approved', 'rejected'].includes(batch.status) ? 'completed' : 'pending',
        timestamp: batch.processingDate,
        icon: '⚙️',
        description: 'Quality processing and preparation'
      },
      {
        id: 3,
        title: 'Lab Testing',
        status: ['testing', 'tested', 'approved', 'rejected'].includes(batch.status) ? 'completed' : 'pending',
        timestamp: batch.testingDate,
        icon: '🧪',
        description: 'Laboratory analysis and testing'
      },
      {
        id: 4,
        title: 'Regulatory Review',
        status: ['approved', 'rejected'].includes(batch.status) ? 'completed' : 'pending',
        timestamp: batch.reviewDate,
        icon: '📋',
        description: 'Compliance verification'
      },
      {
        id: 5,
        title: batch.status === 'rejected' ? 'Rejected' : 'Approved',
        status: batch.status === 'approved' ? 'completed' : batch.status === 'rejected' ? 'rejected' : 'pending',
        timestamp: batch.approvedDate || batch.rejectedDate,
        icon: batch.status === 'approved' ? '✅' : batch.status === 'rejected' ? '❌' : '⏳',
        description: batch.status === 'approved' ? 'Ready for distribution' : batch.status === 'rejected' ? 'Failed quality standards' : 'Awaiting final approval'
      }
    ]
    
    return steps
  }

  const timelineSteps = getTimelineSteps()

  return (
    <div 
      className="min-h-screen bg-gray-50"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      ref={containerRef}
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 z-50 transition-all duration-200"
          style={{ transform: `translateY(${Math.min(pullDistance - 60, 0)}px)` }}
        >
          {pullDistance > 60 ? '🔄 Release to refresh' : '⬇️ Pull to refresh'}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-green-600 font-medium"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {batch.commonName || 'Herb Batch'}
          </h1>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-full ${isRefreshing ? 'animate-spin' : ''}`}
          >
            🔄
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'timeline' 
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
                : 'text-gray-600'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'details' 
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
                : 'text-gray-600'
            }`}
          >
            Details
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {/* QR Code Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">QR Code</h3>
                  <p className="text-sm text-gray-600 font-mono">{batch.qrCode}</p>
                </div>
                <QrCodeIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Progress Timeline</h3>
              <div className="space-y-4">
                {timelineSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      step.status === 'completed' ? 'bg-green-100 text-green-600' :
                      step.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${
                          step.status === 'completed' ? 'text-green-900' :
                          step.status === 'rejected' ? 'text-red-900' :
                          'text-gray-500'
                        }`}>
                          {step.title}
                        </h4>
                        {step.timestamp && (
                          <span className="text-xs text-gray-500">
                            {new Date(step.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      {index < timelineSteps.length - 1 && (
                        <div className={`w-px h-4 ml-4 mt-2 ${
                          step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Batch Info */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Batch Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Botanical Name:</span>
                  <span className="font-medium">{batch.botanicalName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Common Name:</span>
                  <span className="font-medium">{batch.commonName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{batch.quantity || 'N/A'} {batch.unit || 'kg'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize ${
                    batch.status === 'approved' ? 'text-green-600' :
                    batch.status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {batch.status || 'pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Info */}
            {batch.farmLocation && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2 text-green-600" />
                  Location
                </h3>
                <p className="text-gray-700">{batch.farmLocation}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-green-600" />
                Timestamps
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(batch.createdAt || Date.now()).toLocaleString()}</span>
                </div>
                {batch.lastUpdated && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span>{new Date(batch.lastUpdated).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Swipe indicator */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs">
        ← Swipe to navigate →
      </div>
    </div>
  )
}

export default MobileBatchTracking
