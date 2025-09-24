import { useState, useEffect } from 'react'
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const FastBatchTracking = ({ batchId, onBack }) => {
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)

  console.log('🔍 BATCH TRACKING: Received batchId:', batchId)

  // Generate detailed tracking steps with REAL timestamps and CORRECT status detection
  const generateTrackingSteps = (batch) => {
    const now = new Date()

    console.log('📊 GENERATING TIMELINE for batch:', batch.qrCode, 'Status:', batch.status)
    console.log('📊 Batch data:', {
      status: batch.status,
      processingDate: batch.processingDate,
      processingTimestamp: batch.processingTimestamp,
      testingDate: batch.testingDate,
      labTimestamp: batch.labTimestamp,
      reviewDate: batch.reviewDate,
      regulatoryTimestamp: batch.regulatoryTimestamp,
      approvedDate: batch.approvedDate,
      rejectedDate: batch.rejectedDate
    })

    const steps = [
      {
        id: 1,
        title: 'Collection',
        description: 'Herb batch collected and registered',
        status: 'completed',
        timestamp: batch.createdAt || batch.collectionDate || now.toISOString(),
        details: `${batch.quantity || 'Unknown'} ${batch.unit || 'kg'} of ${batch.commonName || batch.botanicalName || 'herbs'} collected by ${batch.farmerName || 'farmer'}`,
        icon: '🌿',
        actualTimestamp: true
      },
      {
        id: 2,
        title: 'Processing',
        description: 'Initial processing and quality check',
        status: (() => {
          // Check if processing has been completed
          if (batch.processingDate || batch.processingCompleted || batch.processingStarted) {
            return 'completed'
          }
          // Check if batch is currently in processing
          if (batch.status === 'processing') {
            return 'in-progress'
          }
          // Check if batch has moved beyond processing
          if (['processed', 'testing', 'tested', 'approved', 'rejected', 'completed'].includes(batch.status)) {
            return 'completed'
          }
          return 'pending'
        })(),
        timestamp: batch.processingDate || batch.processingTimestamp || batch.processingStarted || batch.processingCompleted ||
                  (batch.status === 'processing' ? now.toISOString() : null),
        details: batch.processingNotes || 'Cleaning, sorting, and initial quality assessment',
        icon: '🏭',
        actualTimestamp: !!(batch.processingDate || batch.processingTimestamp || batch.processingStarted || batch.processingCompleted),
        portalSource: 'Processor Portal'
      },
      {
        id: 3,
        title: 'Lab Testing',
        description: 'Laboratory analysis and testing',
        status: (() => {
          // Check if testing has been completed
          if (batch.testingDate || batch.testingCompleted || batch.labResults) {
            return 'completed'
          }
          // Check if batch is currently in testing
          if (batch.status === 'testing') {
            return 'in-progress'
          }
          // Check if batch has moved beyond testing
          if (['tested', 'approved', 'rejected', 'completed'].includes(batch.status)) {
            return 'completed'
          }
          // Check if processing is done (ready for testing)
          if (['processed', 'processing'].includes(batch.status) || batch.processingDate) {
            return 'pending'
          }
          return 'pending'
        })(),
        timestamp: batch.testingDate || batch.labTimestamp || batch.testingStarted || batch.testingCompleted ||
                  (batch.status === 'testing' ? now.toISOString() : null),
        details: batch.testingNotes || batch.labResults || 'Chemical composition, purity, and safety testing',
        icon: '🧪',
        actualTimestamp: !!(batch.testingDate || batch.labTimestamp || batch.testingStarted || batch.testingCompleted),
        portalSource: 'Lab Portal'
      },
      {
        id: 4,
        title: 'Regulatory Review',
        description: 'Compliance and documentation review',
        status: (() => {
          // Check if regulatory review has been completed
          if (batch.reviewDate || batch.regulatoryReviewCompleted || batch.approvedDate || batch.rejectedDate) {
            return 'completed'
          }
          // Check if batch is currently in regulatory review
          if (['tested'].includes(batch.status)) {
            return 'in-progress'
          }
          // Check if batch has final status
          if (['approved', 'rejected', 'completed'].includes(batch.status)) {
            return 'completed'
          }
          // Check if testing is done (ready for regulatory review)
          if (batch.testingDate || batch.testingCompleted) {
            return 'pending'
          }
          return 'pending'
        })(),
        timestamp: batch.reviewDate || batch.regulatoryTimestamp || batch.regulatoryReviewStarted || batch.regulatoryReviewCompleted ||
                  batch.approvedDate || batch.rejectedDate ||
                  (['approved', 'rejected'].includes(batch.status) ? now.toISOString() : null),
        details: batch.regulatoryNotes || 'Regulatory compliance verification',
        icon: '📋',
        actualTimestamp: !!(batch.reviewDate || batch.regulatoryTimestamp || batch.regulatoryReviewStarted || batch.regulatoryReviewCompleted),
        portalSource: 'Regulatory Portal'
      }
    ]

    // Add final status step with REAL data
    if (batch.status === 'approved') {
      steps.push({
        id: 5,
        title: 'APPROVED ✅',
        description: 'Batch approved for distribution',
        status: 'approved',
        timestamp: batch.approvedDate || batch.finalReviewDate || now.toISOString(),
        details: batch.approvalReason || batch.finalNotes || 'All quality and regulatory requirements met successfully. Batch cleared for market distribution.',
        icon: '✅',
        isSuccess: true,
        actualTimestamp: !!batch.approvedDate || !!batch.finalReviewDate,
        portalSource: 'Regulatory Portal'
      })
    } else if (batch.status === 'rejected') {
      steps.push({
        id: 5,
        title: 'REJECTED ❌',
        description: 'Batch rejected - cannot proceed',
        status: 'rejected',
        timestamp: batch.rejectedDate || batch.finalReviewDate || now.toISOString(),
        details: batch.rejectionReason || batch.finalNotes || 'Failed to meet quality or regulatory standards. Please contact support for detailed feedback.',
        icon: '❌',
        isRejection: true,
        actualTimestamp: !!batch.rejectedDate || !!batch.finalReviewDate,
        portalSource: batch.rejectedBy || 'Regulatory Portal'
      })
    }

    return steps
  }

  // Enhanced real-time batch synchronization with aggressive sync
  const syncBatchFromAllPortals = (targetBatchId = batchId) => {
    console.log('🔄 ENHANCED SYNC: Checking all portals for batch:', targetBatchId)

    try {
      // Check all portal storage locations
      const storageKeys = [
        'farmerBatches',
        'traceHerbBatches',
        'processorBatches',
        'labBatches',
        'regulatoryBatches'
      ]

      let allFoundBatches = []
      let mostAdvancedBatch = null
      let highestStatusPriority = -1

      // Status priority for determining most advanced batch
      const statusPriority = {
        'pending': 0,
        'processing': 1,
        'processed': 2,
        'testing': 3,
        'tested': 4,
        'approved': 10,
        'rejected': 10,
        'completed': 10
      }

      // Enhanced batch matching - try multiple ID formats
      const findBatchInStorage = (batches, searchId) => {
        return batches.find(b =>
          b.qrCode === searchId ||
          b.collectionId === searchId ||
          b.id === searchId ||
          searchId.includes(b.collectionId || '') ||
          b.qrCode?.includes(searchId.replace('QR_COL_', '')) ||
          searchId.replace('QR_COL_', '').includes(b.collectionId || '') ||
          b.qrCode?.replace('QR_COL_', '') === searchId.replace('QR_COL_', '')
        )
      }

      for (const key of storageKeys) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const batches = JSON.parse(data)
            if (Array.isArray(batches)) {
              const foundBatch = findBatchInStorage(batches, targetBatchId)

              if (foundBatch) {
                console.log(`📦 Found batch in ${key}:`, {
                  status: foundBatch.status,
                  lastUpdated: foundBatch.lastUpdated,
                  processingDate: foundBatch.processingDate,
                  testingDate: foundBatch.testingDate,
                  approvedDate: foundBatch.approvedDate
                })

                allFoundBatches.push({ ...foundBatch, sourcePortal: key })

                // Determine most advanced batch based on status priority
                const priority = statusPriority[foundBatch.status] || 0
                if (priority > highestStatusPriority) {
                  highestStatusPriority = priority
                  mostAdvancedBatch = { ...foundBatch, sourcePortal: key }
                }
              }
            }
          } catch (parseError) {
            console.log(`❌ Error parsing ${key}:`, parseError)
          }
        }
      }

      // Merge data from all found batches to get complete picture
      if (allFoundBatches.length > 0) {
        const mergedBatch = allFoundBatches.reduce((merged, current) => {
          return {
            ...merged,
            ...current,
            // Keep the most advanced status
            status: statusPriority[current.status] > statusPriority[merged.status] ? current.status : merged.status,
            // Merge all timestamp data (check all possible field variations)
            processingDate: current.processingDate || current.processingTimestamp || merged.processingDate || merged.processingTimestamp,
            processingTimestamp: current.processingTimestamp || current.processingDate || merged.processingTimestamp || merged.processingDate,
            processingStarted: current.processingStarted || merged.processingStarted,
            processingCompleted: current.processingCompleted || merged.processingCompleted,
            processingNotes: current.processingNotes || merged.processingNotes,

            testingDate: current.testingDate || current.labTimestamp || merged.testingDate || merged.labTimestamp,
            labTimestamp: current.labTimestamp || current.testingDate || merged.labTimestamp || merged.testingDate,
            testingStarted: current.testingStarted || merged.testingStarted,
            testingCompleted: current.testingCompleted || merged.testingCompleted,
            testingNotes: current.testingNotes || merged.testingNotes,
            labResults: current.labResults || merged.labResults,

            reviewDate: current.reviewDate || current.regulatoryTimestamp || merged.reviewDate || merged.regulatoryTimestamp,
            regulatoryTimestamp: current.regulatoryTimestamp || current.reviewDate || merged.regulatoryTimestamp || merged.reviewDate,
            regulatoryReviewStarted: current.regulatoryReviewStarted || merged.regulatoryReviewStarted,
            regulatoryReviewCompleted: current.regulatoryReviewCompleted || merged.regulatoryReviewCompleted,
            regulatoryNotes: current.regulatoryNotes || merged.regulatoryNotes,

            approvedDate: current.approvedDate || merged.approvedDate,
            rejectedDate: current.rejectedDate || merged.rejectedDate,
            approvalReason: current.approvalReason || merged.approvalReason,
            rejectionReason: current.rejectionReason || merged.rejectionReason,
            finalNotes: current.finalNotes || merged.finalNotes,
            lastUpdated: current.lastUpdated || merged.lastUpdated
          }
        })

        console.log('✅ MERGED BATCH DATA:', {
          status: mergedBatch.status,
          hasProcessingDate: !!mergedBatch.processingDate,
          hasTestingDate: !!mergedBatch.testingDate,
          hasApprovalDate: !!mergedBatch.approvedDate,
          sourcePortals: allFoundBatches.map(b => b.sourcePortal)
        })

        setBatch(mergedBatch)
        return mergedBatch
      } else {
        console.log('❌ Batch not found in any portal:', targetBatchId)
        return null
      }

    } catch (error) {
      console.error('Error syncing batch:', error)
      return null
    }
  }

  useEffect(() => {
    console.log('🔄 FastBatchTracking useEffect triggered with batchId:', batchId)

    if (!batchId) {
      console.log('❌ No batch ID provided')
      setLoading(false)
      setBatch(null)
      return
    }

    // FORCE RESET - Clear any previous batch data
    setBatch(null)
    setLoading(true)

    console.log('🎯 SEARCHING FOR SPECIFIC BATCH:', batchId)

    // DIRECT BATCH SEARCH - Don't rely on syncBatchFromAllPortals
    const findSpecificBatch = (searchBatchId) => {
      console.log('🔍 DIRECT SEARCH for:', searchBatchId)

      const storageKeys = ['farmerBatches', 'traceHerbBatches', 'processorBatches', 'labBatches', 'regulatoryBatches']

      for (const key of storageKeys) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const batches = JSON.parse(data)
            if (Array.isArray(batches)) {
              const foundBatch = batches.find(b => {
                const matches = (
                  b.qrCode === searchBatchId ||
                  b.id === searchBatchId ||
                  b.collectionId === searchBatchId
                )
                if (matches) {
                  console.log(`🎯 EXACT MATCH FOUND in ${key}:`, {
                    qrCode: b.qrCode,
                    id: b.id,
                    commonName: b.commonName,
                    botanicalName: b.botanicalName
                  })
                }
                return matches
              })

              if (foundBatch) {
                console.log('✅ FOUND SPECIFIC BATCH:', foundBatch.qrCode, foundBatch.commonName)
                return foundBatch
              }
            }
          } catch (e) {
            console.log(`❌ Error reading ${key}:`, e)
          }
        }
      }

      console.log('❌ SPECIFIC BATCH NOT FOUND:', searchBatchId)
      return null
    }

    // Load the specific batch immediately
    const foundBatch = findSpecificBatch(batchId)
    if (foundBatch) {
      setBatch(foundBatch)
      console.log('🎉 SET CORRECT BATCH:', foundBatch.qrCode, foundBatch.commonName)
    } else {
      console.log('💔 NO BATCH FOUND FOR:', batchId)
    }
    setLoading(false)

    // Set up real-time listeners
    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes('batch') || e.key.includes('Batch'))) {
        console.log('🔄 Storage changed, re-loading specific batch:', batchId)
        const updatedBatch = findSpecificBatch(batchId)
        if (updatedBatch) {
          setBatch(updatedBatch)
          console.log('✅ Updated batch from storage change:', updatedBatch.qrCode)
        }
      }
    }

    const handleBatchUpdate = (e) => {
      if (e.detail && (e.detail.qrCode === batchId || e.detail.id === batchId || e.detail.collectionId === batchId)) {
        console.log('🎯 Direct batch update received for', batchId, ':', e.detail)
        setBatch(e.detail)
      } else {
        console.log('🔄 Batch update event, re-loading specific batch:', batchId)
        const updatedBatch = findSpecificBatch(batchId)
        if (updatedBatch) {
          setBatch(updatedBatch)
          console.log('✅ Event update for correct batch:', updatedBatch.qrCode)
        }
      }
    }

    // Listen for storage changes across all portals
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('batchUpdated', handleBatchUpdate)
    window.addEventListener('batchStatusChanged', handleBatchUpdate)

    // Set up frequent periodic sync every 2 seconds for real-time updates
    const syncInterval = setInterval(() => {
      console.log('⏰ Periodic sync check for batch:', batchId, new Date().toLocaleTimeString())
      const updatedBatch = findSpecificBatch(batchId)
      if (updatedBatch && updatedBatch.qrCode === batchId) {
        setBatch(updatedBatch)
        console.log('✅ Periodic update for correct batch:', updatedBatch.qrCode)
      }
    }, 2000)

    // Also sync when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible, re-loading specific batch:', batchId)
        const updatedBatch = findSpecificBatch(batchId)
        if (updatedBatch) {
          setBatch(updatedBatch)
          console.log('✅ Visibility update for correct batch:', updatedBatch.qrCode)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('batchUpdated', handleBatchUpdate)
      window.removeEventListener('batchStatusChanged', handleBatchUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(syncInterval)
    }
  }, [batchId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">Loading batch details...</p>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Batch Not Found</h2>
          <p className="text-gray-600 mb-6">Could not find batch with ID: {batchId}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const trackingSteps = generateTrackingSteps(batch)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Batch Tracking</h1>
                <p className="text-sm text-gray-600">{batch.qrCode}</p>
                <p className="text-xs text-blue-600">Tracking: {batchId}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              batch.status === 'approved' ? 'bg-green-100 text-green-800' :
              batch.status === 'rejected' ? 'bg-red-100 text-red-800' :
              batch.status === 'testing' ? 'bg-blue-100 text-blue-800' :
              batch.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {batch.status?.toUpperCase() || 'PENDING'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Batch Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          {/* DEBUG INFO - Shows which batch is actually loaded */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-blue-800">
              🔍 Currently Displaying: {batch.qrCode || batch.id || 'Unknown ID'}
            </p>
            <p className="text-xs text-blue-600">
              Requested: {batchId} | Match: {(batch.qrCode === batchId || batch.id === batchId) ? '✅ Correct' : '❌ Wrong'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {batch.commonName || batch.botanicalName || 'Unknown Herb'}
              </h3>
              <p className="text-sm text-gray-600">Botanical: {batch.botanicalName || 'Not specified'}</p>
              <p className="text-sm text-gray-600">Common: {batch.commonName || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="text-lg font-semibold">{batch.quantity} {batch.unit}</p>
              <p className="text-sm text-gray-600">Farmer: {batch.farmerName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-lg font-semibold">
                {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
              <p className="text-sm text-gray-600">
                {batch.createdAt ? new Date(batch.createdAt).toLocaleTimeString() : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Progress Timeline</h2>
          
          <div className="space-y-6">
            {trackingSteps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  step.status === 'completed' || step.status === 'approved' ? 'bg-green-100' :
                  step.status === 'rejected' ? 'bg-red-100' :
                  step.status === 'in-progress' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${
                      step.isSuccess ? 'text-green-700' :
                      step.isRejection ? 'text-red-700' :
                      'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      step.status === 'completed' || step.status === 'approved' ? 'bg-green-100 text-green-800' :
                      step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      step.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {step.status === 'completed' ? 'Completed' :
                       step.status === 'approved' ? 'Approved' :
                       step.status === 'rejected' ? 'Rejected' :
                       step.status === 'in-progress' ? 'In Progress' :
                       'Pending'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mt-1">{step.description}</p>
                  <p className={`text-sm mt-2 ${
                    step.isRejection ? 'text-red-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.details}
                  </p>
                  
                  <div className="text-xs mt-2">
                    <p className={step.actualTimestamp ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {step.timestamp ? new Date(step.timestamp).toLocaleString() : 'Pending'}
                      {step.actualTimestamp && <span className="ml-1">✓</span>}
                      {!step.actualTimestamp && step.timestamp && <span className="ml-1 text-gray-400">(estimated)</span>}
                    </p>
                    {step.portalSource && step.actualTimestamp && (
                      <p className="text-blue-600 text-xs mt-1">Updated by {step.portalSource}</p>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {index < trackingSteps.length - 1 && (
                  <div className="absolute left-9 mt-10 w-0.5 h-6 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>

          {/* Final Status Message */}
          {batch.status === 'approved' && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="text-green-800 font-semibold">Batch Approved!</h4>
              </div>
              <p className="text-green-700 text-sm mt-1">
                This batch has successfully passed all quality checks and regulatory requirements. 
                It is now approved for distribution and sale.
              </p>
            </div>
          )}

          {batch.status === 'rejected' && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="text-red-800 font-semibold">Batch Rejected</h4>
              </div>
              <p className="text-red-700 text-sm mt-1">
                This batch has been rejected and cannot proceed to market. 
                Please review the rejection reason above and contact support if needed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FastBatchTracking
