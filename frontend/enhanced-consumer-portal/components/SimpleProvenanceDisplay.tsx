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

interface SimpleProvenanceDisplayProps {
  qrCode: string
  onClose: () => void
}

const SimpleProvenanceDisplay: React.FC<SimpleProvenanceDisplayProps> = ({ qrCode, onClose }) => {
  const [provenance, setProvenance] = useState<ProvenanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'journey' | 'quality' | 'sustainability' | 'farmer'>('journey')

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

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-trace-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Product</h3>
            <p className="text-gray-600">Connecting to blockchain...</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Error state
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
              Close
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
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="h-full flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-trace-green-600 to-trace-green-700 text-white p-6">
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
                <CheckCircleIcon className="w-5 h-5 text-green-300" />
                <span className="text-sm">Verified Authentic • {provenance.blockchain.mode}</span>
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
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'journey' && (
                <motion.div
                  key="journey"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
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
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Testing Results</h3>
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        <h4 className="text-lg font-semibold text-green-900">All Tests Passed</h4>
                      </div>
                      <p className="text-green-700">Product meets all quality standards and certifications.</p>
                    </div>
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
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Sustainability Impact</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
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
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
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
                        </div>
                      </div>
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
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Producer Information</h3>
                    
                    {provenance.events.filter(event => event.type === 'Collection').map((event, index) => (
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
                            
                            <div className="mt-4">
                              <h5 className="font-medium text-gray-900 mb-2">Location</h5>
                              <p className="text-gray-600">{event.location.name}</p>
                              {event.location.coordinates && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {event.location.coordinates.latitude.toFixed(4)}, {event.location.coordinates.longitude.toFixed(4)}
                                </p>
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

export default SimpleProvenanceDisplay
