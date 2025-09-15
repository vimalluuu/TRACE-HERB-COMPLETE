import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  QrCodeIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BeakerIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  TruckIcon,
  HomeIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function ConsumerPortal() {
  const [qrInput, setQrInput] = useState('')
  const [provenanceData, setProvenanceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [showDetails, setShowDetails] = useState({})

  // Auto-advance through journey steps
  useEffect(() => {
    if (provenanceData && provenanceData.journey) {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % provenanceData.journey.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [provenanceData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!qrInput.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3000/api/provenance/qr/${qrInput.trim()}`)
      const data = await response.json()

      if (data.success) {
        setProvenanceData(data.data)
        setCurrentStep(0)
      } else {
        setError(data.error || 'Product not found')
      }
    } catch (err) {
      console.error('Error fetching provenance:', err)
      setError('Failed to verify product. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const resetView = () => {
    setProvenanceData(null)
    setError(null)
    setQrInput('')
    setCurrentStep(0)
    setShowDetails({})
  }

  const toggleDetails = (section) => {
    setShowDetails(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getStepIcon = (type) => {
    const icons = {
      'collection': UserGroupIcon,
      'processing': BeakerIcon,
      'quality': ShieldCheckIcon,
      'shipping': TruckIcon,
      'retail': HomeIcon
    }
    return icons[type] || CheckCircleIcon
  }

  const getQualityColor = (grade) => {
    const colors = {
      'A': 'text-green-600 bg-green-100',
      'B': 'text-yellow-600 bg-yellow-100',
      'C': 'text-orange-600 bg-orange-100'
    }
    return colors[grade] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>TRACE HERB - Consumer Portal</title>
        <meta name="description" content="Verify authentic Ayurvedic herbs with blockchain traceability" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-green-700">🌿 TRACE HERB</h1>
              </div>
              <div className="ml-10">
                <span className="text-sm text-gray-600">Consumer Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-500" />
                Blockchain Verified
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!provenanceData ? (
          // QR Code Scanner Section
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <QrCodeIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🌿 TRACE HERB
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Blockchain-Based Ayurvedic Herb Traceability System
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 text-center">Verify Your Product</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="qrInput" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter QR Code
                  </label>
                  <input
                    id="qrInput"
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Enter QR code (e.g., QR_DEMO_ASHWAGANDHA_001)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !qrInput.trim()}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Product'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Demo QR Code:</h3>
                <p className="text-sm text-blue-700 font-mono">QR_DEMO_ASHWAGANDHA_001</p>
                <button
                  onClick={() => setQrInput('QR_DEMO_ASHWAGANDHA_001')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Use Demo Code
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-green-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">✅ Product Verified</h2>
                    <p className="text-green-100">Authentic Ayurvedic Product</p>
                  </div>
                  <button
                    onClick={resetView}
                    className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Scan Another
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Product Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Product:</span>
                        <p className="text-gray-700">{provenanceData.product?.name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Botanical Name:</span>
                        <p className="text-gray-700 italic">{provenanceData.product?.botanicalName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Strength:</span>
                        <p className="text-gray-700">{provenanceData.product?.strength}</p>
                      </div>
                      <div>
                        <span className="font-medium">Manufacturer:</span>
                        <p className="text-gray-700">{provenanceData.product?.manufacturer}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Origin & Quality</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Origin:</span>
                        <p className="text-gray-700">
                          {provenanceData.geography?.origin?.address?.village}, {provenanceData.geography?.origin?.address?.district}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Collection Grade:</span>
                        <p className="text-gray-700">{provenanceData.quality?.collectionGrade}</p>
                      </div>
                      <div>
                        <span className="font-medium">Certifications:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {provenanceData.quality?.certifications?.map((cert, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Supply Chain Journey</h3>
                  <div className="space-y-4">
                    {provenanceData.events?.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{event.type}</h4>
                          <p className="text-gray-600 text-sm">{event.summary}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Sustainability</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Fair Trade: {provenanceData.sustainability?.social?.fairTrade ? '✅' : '❌'}
                    </p>
                    <p className="text-sm text-blue-700">
                      Carbon Footprint: {provenanceData.sustainability?.environmental?.carbonFootprint} kg CO₂
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Blockchain</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Network: {provenanceData.blockchain?.networkId}
                    </p>
                    <p className="text-sm text-purple-700">
                      Block: #{provenanceData.blockchain?.blockNumbers?.[0]}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800">Traceability</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Completeness: {provenanceData.traceability?.completeness}%
                    </p>
                    <p className="text-sm text-orange-700">
                      Accuracy: {provenanceData.traceability?.accuracy}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
