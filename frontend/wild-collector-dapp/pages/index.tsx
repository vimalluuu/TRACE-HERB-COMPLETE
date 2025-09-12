import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  MapPinIcon, 
  CameraIcon, 
  QrCodeIcon,
  UserIcon,
  BeakerIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  // TreePineIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function WildCollectorDApp() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')

  // Collector Information
  const [collectorData, setCollectorData] = useState({
    name: '',
    phone: '',
    collectorId: '',
    region: '',
    district: '',
    state: '',
    experience: '',
    certification: '',
    tribalCommunity: ''
  })

  // Wild Herb Collection Information
  const [herbData, setHerbData] = useState({
    botanicalName: '',
    commonName: '',
    localName: '',
    ayurvedicName: '',
    partUsed: '',
    quantity: '',
    unit: 'kg',
    collectionMethod: 'sustainable',
    habitat: '',
    altitude: '',
    season: '',
    weatherConditions: '',
    conservationStatus: '',
    notes: ''
  })

  // Get current location
  const getCurrentLocation = () => {
    setLoading(true)
    setLocationError('')
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        })
        setLoading(false)
      },
      (error) => {
        setLocationError(`Location error: ${error.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert('Wild herb collection data submitted successfully!')
      // Reset form
      setCurrentStep(1)
      setCollectorData({
        name: '',
        phone: '',
        collectorId: '',
        region: '',
        district: '',
        state: '',
        experience: '',
        certification: '',
        tribalCommunity: ''
      })
      setHerbData({
        botanicalName: '',
        commonName: '',
        localName: '',
        ayurvedicName: '',
        partUsed: '',
        quantity: '',
        unit: 'kg',
        collectionMethod: 'sustainable',
        habitat: '',
        altitude: '',
        season: '',
        weatherConditions: '',
        conservationStatus: '',
        notes: ''
      })
    }, 2000)
  }

  return (
    <>
      <Head>
        <title>TRACE HERB - Wild Collector DApp</title>
        <meta name="description" content="Wild herb collection data capture for TRACE HERB blockchain network" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-trace-brown-50 via-trace-green-50 to-trace-blue-50">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-50"
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-trace-brown-600 to-trace-green-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-3xl">🌲</span>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-trace-brown-600 to-trace-green-800 bg-clip-text text-transparent">
                    TRACE HERB
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">Wild Collector DApp</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Online</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-center space-x-4 mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    currentStep >= step 
                      ? 'bg-trace-green-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-trace-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {currentStep === 1 && 'Collector Information'}
                {currentStep === 2 && 'Wild Herb Details'}
                {currentStep === 3 && 'Location & Environment'}
                {currentStep === 4 && 'Review & Submit'}
              </h2>
              <p className="text-gray-600">
                Step {currentStep} of 4 - Wild herb collection data capture
              </p>
            </div>
          </motion.div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
          >
            {/* Step 1: Collector Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 flex items-center">
                  <UserIcon className="w-12 h-12 mr-4 text-trace-green-600" />
                  Wild Collector Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Full Name *</label>
                    <input
                      type="text"
                      value={collectorData.name}
                      onChange={(e) => setCollectorData({...collectorData, name: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Phone Number *</label>
                    <input
                      type="tel"
                      value={collectorData.phone}
                      onChange={(e) => setCollectorData({...collectorData, phone: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Collector ID</label>
                    <input
                      type="text"
                      value={collectorData.collectorId}
                      onChange={(e) => setCollectorData({...collectorData, collectorId: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      placeholder="Government issued collector ID"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Region *</label>
                    <input
                      type="text"
                      value={collectorData.region}
                      onChange={(e) => setCollectorData({...collectorData, region: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      placeholder="Collection region/forest area"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">District *</label>
                    <input
                      type="text"
                      value={collectorData.district}
                      onChange={(e) => setCollectorData({...collectorData, district: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      placeholder="District name"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">State *</label>
                    <select
                      value={collectorData.state}
                      onChange={(e) => setCollectorData({...collectorData, state: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Experience (Years)</label>
                    <input
                      type="number"
                      value={collectorData.experience}
                      onChange={(e) => setCollectorData({...collectorData, experience: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      placeholder="Years of collection experience"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Tribal Community</label>
                    <input
                      type="text"
                      value={collectorData.tribalCommunity}
                      onChange={(e) => setCollectorData({...collectorData, tribalCommunity: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      placeholder="Tribal community (if applicable)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Wild Herb Details */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 flex items-center">
                  <BeakerIcon className="w-12 h-12 mr-4 text-trace-green-600" />
                  Wild Herb Collection Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Botanical Name *</label>
                    <input
                      type="text"
                      value={herbData.botanicalName}
                      onChange={(e) => setHerbData({...herbData, botanicalName: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      placeholder="e.g., Withania somnifera"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Common Name *</label>
                    <input
                      type="text"
                      value={herbData.commonName}
                      onChange={(e) => setHerbData({...herbData, commonName: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      placeholder="e.g., Ashwagandha"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Local Name</label>
                    <input
                      type="text"
                      value={herbData.localName}
                      onChange={(e) => setHerbData({...herbData, localName: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      placeholder="Local/tribal name"
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Part Used *</label>
                    <select
                      value={herbData.partUsed}
                      onChange={(e) => setHerbData({...herbData, partUsed: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                    >
                      <option value="">Select Part Used</option>
                      <option value="Root">Root</option>
                      <option value="Leaves">Leaves</option>
                      <option value="Bark">Bark</option>
                      <option value="Flowers">Flowers</option>
                      <option value="Seeds">Seeds</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Whole Plant">Whole Plant</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Quantity *</label>
                    <div className="flex space-x-4">
                      <input
                        type="number"
                        value={herbData.quantity}
                        onChange={(e) => setHerbData({...herbData, quantity: e.target.value})}
                        className="flex-1 px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                        placeholder="Amount"
                        min="0"
                        step="0.1"
                      />
                      <select
                        value={herbData.unit}
                        onChange={(e) => setHerbData({...herbData, unit: e.target.value})}
                        className="px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                      >
                        <option value="kg">kg</option>
                        <option value="grams">grams</option>
                        <option value="bundles">bundles</option>
                        <option value="pieces">pieces</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">Collection Method *</label>
                    <select
                      value={herbData.collectionMethod}
                      onChange={(e) => setHerbData({...herbData, collectionMethod: e.target.value})}
                      className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-trace-green-500 focus:border-trace-green-500 text-xl font-medium transition-all duration-300"
                    >
                      <option value="sustainable">Sustainable Collection</option>
                      <option value="selective">Selective Harvesting</option>
                      <option value="rotational">Rotational Collection</option>
                      <option value="traditional">Traditional Method</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-12 py-6 bg-gray-200 text-gray-700 rounded-2xl font-black text-xl md:text-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all duration-300 shadow-lg"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="px-12 py-6 bg-trace-green-600 text-white rounded-2xl font-black text-xl md:text-2xl hover:bg-trace-green-700 transition-all duration-300 shadow-2xl hover:shadow-3xl"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-12 py-6 bg-trace-green-600 text-white rounded-2xl font-black text-xl md:text-2xl hover:bg-trace-green-700 transition-all duration-300 shadow-2xl hover:shadow-3xl disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Collection'}
                </button>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
