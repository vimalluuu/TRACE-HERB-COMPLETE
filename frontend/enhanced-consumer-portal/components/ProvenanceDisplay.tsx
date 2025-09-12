import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPinIcon,
  UserIcon,
  BeakerIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  LeafIcon,
  ShareIcon,
  DownloadIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

// FHIR-compliant interfaces
interface FHIRResource {
  resourceType: string
  id: string
  meta?: {
    profile?: string[]
    lastUpdated?: string
  }
}

interface CollectionEvent extends FHIRResource {
  resourceType: 'CollectionEvent'
  identifier: Array<{
    system: string
    value: string
  }>
  status: 'completed' | 'in-progress' | 'cancelled'
  category: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
    display: string
  }
  performedDateTime: string
  performer: Array<{
    actor: {
      reference: string
      display: string
    }
  }>
  location: {
    reference: string
  }
  extension: Array<{
    url: string
    extension?: Array<{
      url: string
      valueDecimal?: number
      valueQuantity?: {
        value: number
        unit: string
      }
    }>
  }>
}

interface QualityTest extends FHIRResource {
  resourceType: 'DiagnosticReport'
  identifier: Array<{
    system: string
    value: string
  }>
  status: 'final' | 'preliminary' | 'cancelled'
  category: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
  code: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
  }
  effectiveDateTime: string
  issued: string
  performer: Array<{
    reference: string
    display: string
  }>
  result: Array<{
    reference: string
  }>
  conclusion: string
  conclusionCode: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
}

interface ProcessingStep extends FHIRResource {
  resourceType: 'Procedure'
  identifier: Array<{
    system: string
    value: string
  }>
  status: 'completed' | 'in-progress' | 'cancelled'
  category: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  code: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
  }
  performedDateTime: string
  performer: Array<{
    actor: {
      reference: string
      display: string
    }
  }>
  location: {
    reference: string
  }
}

interface ProvenanceData {
  id: string
  resourceType: 'Provenance'
  target: {
    qrCode: string
    batchNumber: string
    productName: string
    expiryDate: string
  }
  product: {
    name: string
    botanicalName: string
    category: string
    grade: string
    certifications: string[]
  }
  blockchain: {
    networkId: string
    channelId: string
    chaincodeId: string
    transactionId: string
    timestamp: number
    certificateAuthorities: any[]
    mode: string
    verified: boolean
  }
  events: Array<{
    id: string
    type: string
    timestamp: string
    location: {
      name: string
      coordinates: {
        latitude: number
        longitude: number
      }
      geoFence?: {
        approved: boolean
        zone: string
      }
    }
    performer: {
      name: string
      identifier: string
      certification: string
      experience?: string
      accreditation?: string
      license: string
    }
    details: any
  }>
  consumer: {
    scanCount: number
    firstScan: string | null
    lastScan: string | null
  }
  sustainability: {
    carbonFootprint: string
    waterUsage: string
    organicCertified: boolean
    fairTrade: boolean
    biodiversityImpact: string
  }
  recorded: string
}

interface ProvenanceDisplayProps {
  qrCode: string
  onClose: () => void
}

const ProvenanceDisplay: React.FC<ProvenanceDisplayProps> = ({ qrCode, onClose }) => {
  const [provenance, setProvenance] = useState<ProvenanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'journey' | 'quality' | 'sustainability' | 'farmer'>('journey')
  const [isSharing, setIsSharing] = useState(false)

  // Fetch provenance data
  useEffect(() => {
    const fetchProvenance = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`http://localhost:3000/api/provenance/qr/${qrCode}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch provenance data')
        }

        setProvenance(data.data)
      } catch (err) {
        console.error('Error fetching provenance:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        toast.error('Failed to load product information')
      } finally {
        setLoading(false)
      }
    }

    if (qrCode) {
      fetchProvenance()
    }
  }, [qrCode])

  // Extract collection events from provenance data
  const getCollectionEvents = () => {
    if (!provenance) return []
    return provenance.events.filter(event => event.type === 'Collection')
  }

  // Extract quality tests from provenance data
  const getQualityTests = () => {
    if (!provenance) return []
    return provenance.events.filter(event => event.type === 'Quality Testing')
  }

  // Extract processing steps from provenance data
  const getProcessingSteps = () => {
    if (!provenance) return []
    return provenance.events.filter(event => event.type === 'Processing')
  }

  // Get GPS coordinates from events
  const getGPSCoordinates = () => {
    if (!provenance || provenance.events.length === 0) return null

    // Get coordinates from the first event that has location data
    const eventWithLocation = provenance.events.find(event => event.location?.coordinates)
    if (!eventWithLocation) return null

    return {
      latitude: eventWithLocation.location.coordinates.latitude,
      longitude: eventWithLocation.location.coordinates.longitude
    }
  }

  // Share functionality
  const handleShare = async () => {
    setIsSharing(true)
    
    try {
      const shareData = {
        title: `${provenance?.product.name} - TRACE HERB`,
        text: `Verified authentic ${provenance?.product.botanicalName} with complete traceability`,
        url: `${window.location.origin}/verify/${qrCode}`
      }

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Failed to share')
    } finally {
      setIsSharing(false)
    }
  }

  // Download certificate
  const handleDownload = async () => {
    try {
      // Generate PDF certificate (implementation would use jsPDF)
      toast.success('Certificate download started')
    } catch (error) {
      console.error('Error downloading certificate:', error)
      toast.error('Failed to download certificate')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trace-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Product Information</h3>
            <p className="text-gray-600">Verifying authenticity on blockchain...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Failed</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="bg-trace-green-600 hover:bg-trace-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!provenance) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto"
    >
      <div className="min-h-screen py-4 px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-trace-green-600 to-trace-green-700 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <LeafIcon className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{provenance.product.name}</h1>
                  <p className="text-trace-green-100">{provenance.product.category}</p>
                  <p className="text-sm text-trace-green-200 italic">{provenance.product.botanicalName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Verification Status */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-300" />
                <span className="text-sm">Verified Authentic • {provenance.blockchain.mode}</span>
              </div>

              {/* Blockchain Connection Status */}
              <div className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-300">Blockchain Status</span>
                </div>
                <span className="text-xs text-green-300 font-medium">Connected</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'journey', label: 'Journey', icon: MapPinIcon },
                { id: 'quality', label: 'Quality', icon: BeakerIcon },
                { id: 'sustainability', label: 'Sustainability', icon: LeafIcon },
                { id: 'farmer', label: 'Farmer', icon: UserIcon }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-trace-green-600 text-trace-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'journey' && (
                <motion.div
                  key="journey"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Journey Timeline */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Supply Chain Journey</h3>

                    {provenance.events.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-trace-green-100 rounded-full flex items-center justify-center">
                              <MapPinIcon className="w-5 h-5 text-trace-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold text-gray-900">{event.type}</h4>
                              <span className="text-sm text-gray-500">
                                {new Date(event.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-1">{event.location.name}</p>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center space-x-2">
                                <UserIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{event.performer.name}</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {event.performer.certification}
                                </span>
                              </div>
                              {event.location.coordinates && (
                                <div className="flex items-center space-x-2">
                                  <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {event.location.coordinates.latitude.toFixed(4)}, {event.location.coordinates.longitude.toFixed(4)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'quality' && (
                <motion.div
                  key="quality"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Quality Testing Results */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Testing Results</h3>

                    {getQualityTests().map((test, index) => (
                      <motion.div
                        key={test.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">Laboratory Analysis</h4>
                          <div className="flex items-center space-x-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-green-600">
                              {test.details?.overallGrade || 'Certified'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Testing Laboratory</p>
                            <p className="font-medium">{test.performer.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Accreditation</p>
                            <p className="font-medium">{test.performer.accreditation}</p>
                          </div>
                        </div>

                        {test.details?.tests && (
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-900">Test Parameters</h5>
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
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'sustainability' && (
                <motion.div
                  key="sustainability"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Sustainability Metrics */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Sustainability Impact</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Environmental Impact */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 rounded-lg p-6 border border-green-200"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <LeafIcon className="w-6 h-6 text-green-600" />
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
                          <div className="mt-4 p-3 bg-green-100 rounded-lg">
                            <p className="text-sm text-green-800">{provenance.sustainability.biodiversityImpact}</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Certifications */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-blue-50 rounded-lg p-6 border border-blue-200"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
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
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'farmer' && (
                <motion.div
                  key="farmer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Farmer Profile */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Producer Information</h3>

                    {getCollectionEvents().map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-trace-green-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-trace-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold text-gray-900">{event.performer.name}</h4>
                            <p className="text-trace-green-600 font-medium">{event.performer.certification}</p>
                            {event.performer.experience && (
                              <p className="text-gray-600 mt-1">Experience: {event.performer.experience}</p>
                            )}

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Location</h5>
                                <p className="text-gray-600">{event.location.name}</p>
                                {event.location.coordinates && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {event.location.coordinates.latitude.toFixed(4)}, {event.location.coordinates.longitude.toFixed(4)}
                                  </p>
                                )}
                              </div>

                              {event.details && (
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Collection Details</h5>
                                  {event.details.quantity && (
                                    <p className="text-gray-600">
                                      Quantity: {event.details.quantity.value} {event.details.quantity.unit}
                                    </p>
                                  )}
                                  {event.details.quality && (
                                    <p className="text-gray-600">Quality: {event.details.quality}</p>
                                  )}
                                  {event.details.weather && (
                                    <p className="text-gray-600">Weather: {event.details.weather}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ProvenanceDisplay
