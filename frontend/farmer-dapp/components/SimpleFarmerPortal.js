import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function SimpleFarmerPortal() {
  const [mounted, setMounted] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard') // dashboard, collection, profile
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // User state (simplified)
  const [user, setUser] = useState({
    name: 'Demo Farmer',
    phone: '+91 9876543210',
    village: 'Keshavpur',
    district: 'Nashik',
    state: 'Maharashtra'
  })
  
  // Collection data state
  const [farmerData, setFarmerData] = useState({
    name: '',
    phone: '',
    farmerId: '',
    village: '',
    district: '',
    state: '',
    experience: '',
    certification: ''
  })
  
  const [herbData, setHerbData] = useState({
    botanicalName: '',
    commonName: '',
    ayurvedicName: '',
    partUsed: '',
    quantity: '',
    unit: 'kg',
    collectionMethod: '',
    season: '',
    notes: ''
  })
  
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [submissionResult, setSubmissionResult] = useState(null)
  const [collections, setCollections] = useState([
    {
      id: 'COL_001',
      herb: 'Ashwagandha',
      quantity: '5 kg',
      date: '2024-09-20',
      status: 'Completed'
    },
    {
      id: 'COL_002', 
      herb: 'Turmeric',
      quantity: '10 kg',
      date: '2024-09-18',
      status: 'Completed'
    }
  ])

  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Submit collection data
  const submitCollectionData = async () => {
    setLoading(true)
    
    try {
      const collectionId = `COL_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`
      
      // Generate simple QR code
      setQrCodeUrl(`data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white" stroke="black" stroke-width="2"/>
          <text x="100" y="50" text-anchor="middle" font-family="Arial" font-size="14" fill="black">QR CODE</text>
          <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="10" fill="black">${collectionId}</text>
          <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="8" fill="black">${herbData.botanicalName}</text>
          <text x="100" y="140" text-anchor="middle" font-family="Arial" font-size="8" fill="black">${herbData.quantity} ${herbData.unit}</text>
          <text x="100" y="160" text-anchor="middle" font-family="Arial" font-size="8" fill="black">${new Date().toLocaleDateString()}</text>
        </svg>
      `)}`)
      
      // Add to collections
      setCollections(prev => [{
        id: collectionId,
        herb: herbData.botanicalName,
        quantity: `${herbData.quantity} ${herbData.unit}`,
        date: new Date().toLocaleDateString(),
        status: 'Completed'
      }, ...prev])
      
      setSubmissionResult({
        success: true,
        message: 'Collection data submitted successfully!',
        collectionId: collectionId
      })
      
      setCurrentStep(4)
    } catch (error) {
      setSubmissionResult({
        success: false,
        message: 'Failed to submit collection data. Please try again.'
      })
    }
    
    setLoading(false)
  }

  // Reset collection form
  const resetForm = () => {
    setCurrentStep(1)
    setFarmerData({
      name: '', phone: '', farmerId: '', village: '', district: '', state: '', experience: '', certification: ''
    })
    setHerbData({
      botanicalName: '', commonName: '', ayurvedicName: '', partUsed: '', quantity: '', unit: 'kg',
      collectionMethod: '', season: '', notes: ''
    })
    setLocation(null)
    setQrCodeUrl('')
    setSubmissionResult(null)
    setLocationError('')
    setCurrentView('collection')
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <Head>
        <title>TRACE HERB - Farmer Portal</title>
        <meta name="description" content="Advanced farmer portal for herb collection tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-green-800">🌿 TRACE HERB</h1>
                <span className="text-gray-500">|</span>
                <span className="text-lg text-gray-700">Farmer Portal</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  currentView === 'dashboard' 
                    ? 'border-green-500 text-green-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => { setCurrentView('collection'); setCurrentStep(1); }}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  currentView === 'collection' 
                    ? 'border-green-500 text-green-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🌿 New Collection
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  currentView === 'profile' 
                    ? 'border-green-500 text-green-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👤 Profile
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Farmer Dashboard</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Collections</p>
                      <p className="text-2xl font-bold text-gray-900">{collections.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">2</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                      <p className="text-2xl font-bold text-gray-900">15 kg</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Collections */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Collections</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Herb</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {collections.map((collection) => (
                        <tr key={collection.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{collection.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collection.herb}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collection.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collection.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {collection.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Collection View */}
          {currentView === 'collection' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">New Herb Collection</h2>

              {/* Progress Steps */}
              <div className="flex justify-center mb-8">
                <div className="flex space-x-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        currentStep >= step ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Farmer Information */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">👨‍🌾 Farmer Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={farmerData.name}
                        onChange={(e) => setFarmerData({...farmerData, name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={farmerData.phone}
                        onChange={(e) => setFarmerData({...farmerData, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Village *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={farmerData.village}
                        onChange={(e) => setFarmerData({...farmerData, village: e.target.value})}
                        placeholder="Enter village name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={farmerData.district}
                        onChange={(e) => setFarmerData({...farmerData, district: e.target.value})}
                        placeholder="Enter district name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={farmerData.state}
                        onChange={(e) => setFarmerData({...farmerData, state: e.target.value})}
                        placeholder="Enter state name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={farmerData.experience}
                        onChange={(e) => setFarmerData({...farmerData, experience: e.target.value})}
                        placeholder="Years of farming experience"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={!farmerData.name || !farmerData.phone || !farmerData.village || !farmerData.district || !farmerData.state}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Herb Details
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Herb Information */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">🌿 Herb Collection Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Botanical Name *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={herbData.botanicalName}
                        onChange={(e) => setHerbData({...herbData, botanicalName: e.target.value})}
                        placeholder="e.g., Withania somnifera"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Common Name *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={herbData.commonName}
                        onChange={(e) => setHerbData({...herbData, commonName: e.target.value})}
                        placeholder="e.g., Ashwagandha"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plant Part Used *</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={herbData.partUsed}
                        onChange={(e) => setHerbData({...herbData, partUsed: e.target.value})}
                      >
                        <option value="">Select plant part</option>
                        <option value="roots">Roots</option>
                        <option value="leaves">Leaves</option>
                        <option value="bark">Bark</option>
                        <option value="flowers">Flowers</option>
                        <option value="seeds">Seeds</option>
                        <option value="fruits">Fruits</option>
                        <option value="whole-plant">Whole Plant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={herbData.quantity}
                        onChange={(e) => setHerbData({...herbData, quantity: e.target.value})}
                        placeholder="Enter quantity"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={herbData.unit}
                        onChange={(e) => setHerbData({...herbData, unit: e.target.value})}
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="tons">Tons</option>
                        <option value="bundles">Bundles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Collection Method *</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={herbData.collectionMethod}
                        onChange={(e) => setHerbData({...herbData, collectionMethod: e.target.value})}
                      >
                        <option value="">Select method</option>
                        <option value="hand-picking">Hand Picking</option>
                        <option value="cutting">Cutting</option>
                        <option value="digging">Digging</option>
                        <option value="sustainable">Sustainable Harvesting</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      disabled={!herbData.botanicalName || !herbData.commonName || !herbData.partUsed || !herbData.quantity || !herbData.collectionMethod}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Location
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Location Capture */}
              {currentStep === 3 && (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">📍 GPS Location Capture</h3>

                  {!location ? (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Click the button below to capture your current GPS location.
                      </p>
                      {locationError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <p className="text-red-600">{locationError}</p>
                        </div>
                      )}
                      <button
                        onClick={getCurrentLocation}
                        disabled={loading}
                        className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Getting Location...' : '📍 Get My Location'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <h4 className="font-semibold text-green-800 mb-4">✅ Location Captured!</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Latitude:</span>
                            <span className="ml-2 text-gray-900">{location.latitude.toFixed(6)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Longitude:</span>
                            <span className="ml-2 text-gray-900">{location.longitude.toFixed(6)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={submitCollectionData}
                      disabled={!location || loading}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit & Generate QR'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: QR Code & Success */}
              {currentStep === 4 && (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">🎉 Collection Complete!</h3>

                  {submissionResult && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                      <h4 className="font-semibold text-green-800 mb-2">✅ Success!</h4>
                      <p className="text-green-700">{submissionResult.message}</p>
                      <p className="text-green-600 font-mono text-sm mt-2">
                        Collection ID: {submissionResult.collectionId}
                      </p>
                    </div>
                  )}

                  {qrCodeUrl && (
                    <div className="text-center mb-6">
                      <h4 className="font-semibold text-gray-800 mb-4">QR Code for Collection</h4>
                      <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <img src={qrCodeUrl} alt="Collection QR Code" className="w-48 h-48 mx-auto" />
                      </div>
                    </div>
                  )}

                  <div className="text-center space-x-4">
                    <button
                      onClick={resetForm}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Start New Collection
                    </button>
                    <button
                      onClick={() => setCurrentView('dashboard')}
                      className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile View */}
          {currentView === 'profile' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Farmer Profile</h2>

              <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                <div className="flex items-center mb-8">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">{user.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                    <p className="text-gray-900">{user.village}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <p className="text-gray-900">{user.district}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <p className="text-gray-900">{user.state}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <p className="text-gray-900">January 2024</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Collection Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{collections.length}</p>
                      <p className="text-sm text-gray-600">Total Collections</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">15</p>
                      <p className="text-sm text-gray-600">Total Quantity (kg)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">2</p>
                      <p className="text-sm text-gray-600">Herb Varieties</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
