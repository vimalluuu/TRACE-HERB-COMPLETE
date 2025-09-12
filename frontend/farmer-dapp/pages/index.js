import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  MapPinIcon,
  CameraIcon,
  QrCodeIcon,
  UserIcon,
  BeakerIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../components/LoginForm'

export default function FarmerDApp() {
  // Authentication
  const { user, loading: authLoading, logout } = useAuth()

  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [submissionResult, setSubmissionResult] = useState(null)

  // Farmer/Collector Information
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

  // Herb Collection Information
  const [herbData, setHerbData] = useState({
    botanicalName: '',
    commonName: '',
    ayurvedicName: '',
    partUsed: '',
    quantity: '',
    unit: 'kg',
    collectionMethod: '',
    season: '',
    weatherConditions: '',
    soilType: '',
    notes: ''
  })

  // Populate farmer data from logged-in user profile
  useEffect(() => {
    if (user && user.profile) {
      setFarmerData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.profile.phone || '',
        farmerId: user.profile.farmId || user.id || '',
        village: user.profile.location || '',
        district: '',
        state: '',
        experience: '',
        certification: user.profile.certifications?.join(', ') || ''
      }))
    }
  }, [user])

  // Get current location with optimized settings
  const getCurrentLocation = () => {
    setLoading(true)
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      setLoading(false)
      return
    }

    // Try high accuracy first, then fallback to lower accuracy
    const tryHighAccuracy = () => {
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
          console.log('High accuracy failed, trying low accuracy...', error)
          tryLowAccuracy()
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    }

    const tryLowAccuracy = () => {
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
          console.error('Both high and low accuracy failed:', error)
          let errorMessage = 'Unable to get your location. '

          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please allow location access in your browser settings and try again.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your GPS/location services and try again.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please ensure you have a good GPS signal and try again.'
              break
            default:
              errorMessage = `Location error: ${error.message}. Please try again.`
              break
          }

          setLocationError(errorMessage)
          setLoading(false)
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 600000 // 10 minutes
        }
      )
    }

    // Start with high accuracy
    tryHighAccuracy()
  }

  // Use demo location for testing
  const useDemoLocation = () => {
    setLocation({
      latitude: 12.9716,  // Bangalore coordinates
      longitude: 77.5946,
      accuracy: 10,
      timestamp: new Date().toISOString(),
      isDemoLocation: true
    })
    setLocationError('')
  }

  // Generate QR Code and submit data
  const generateQRAndSubmit = async () => {
    setLoading(true)
    
    try {
      // Generate unique collection ID
      const collectionId = `COL_${Date.now()}_${uuidv4().substr(0, 8).toUpperCase()}`
      const qrCode = `QR_${collectionId}`
      
      // Prepare collection event data for backend API
      const collectionEventData = {
        collectionId: collectionId,
        farmer: farmerData,
        herb: herbData,
        location: location,
        environmental: {
          temperature: 25,
          humidity: 60,
          soilPH: 6.5,
          lightIntensity: 80,
          airQuality: 85
        },
        metadata: {
          deviceInfo: navigator.userAgent,
          appVersion: '1.0.0',
          dataSource: 'farmer-dapp',
          timestamp: new Date().toISOString()
        }
      }

      // Generate QR Code image
      const qrCodeDataUrl = await QRCode.toDataURL(qrCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#166534', // herb-green-800
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrCodeDataUrl)

      // Try to submit to backend API, but continue even if it fails
      let apiSubmissionSuccess = false
      try {
        const response = await axios.post('http://localhost:3000/api/collection/events', collectionEventData, {
          timeout: 5000 // 5 second timeout
        })
        apiSubmissionSuccess = true
        console.log('Successfully submitted to blockchain:', response.data)
      } catch (apiError) {
        console.warn('API submission failed, continuing with local storage:', apiError.message)
        // Store locally for later sync
        const localData = JSON.parse(localStorage.getItem('trace-herb-pending-submissions') || '[]')
        localData.push({
          ...collectionEventData,
          submittedAt: new Date().toISOString(),
          syncStatus: 'pending'
        })
        localStorage.setItem('trace-herb-pending-submissions', JSON.stringify(localData))
      }

      setSubmissionResult({
        success: true,
        qrCode: qrCode,
        collectionId: collectionId,
        message: apiSubmissionSuccess
          ? 'Collection event recorded successfully on blockchain!'
          : 'Collection data saved locally. Will sync to blockchain when connection is available.'
      })

    } catch (error) {
      console.error('Submission error:', error)

      // Even if there's an error, we can still generate the QR code for local use
      if (!qrCodeUrl) {
        try {
          const qrCode = `QR_COL_${Date.now()}_${uuidv4().substr(0, 8).toUpperCase()}`
          const qrCodeDataUrl = await QRCode.toDataURL(qrCode, {
            width: 256,
            margin: 2,
            color: {
              dark: '#166534',
              light: '#FFFFFF'
            }
          })
          setQrCodeUrl(qrCodeDataUrl)

          setSubmissionResult({
            success: true,
            qrCode: qrCode,
            collectionId: qrCode.replace('QR_', ''),
            message: 'QR code generated successfully! Data saved locally for later blockchain sync.'
          })
          return
        } catch (qrError) {
          console.error('QR generation error:', qrError)
        }
      }

      setSubmissionResult({
        success: false,
        message: 'Unable to process collection data. Please check your internet connection and try again.'
      })
    }
    
    setLoading(false)
  }

  // Reset form
  const resetForm = () => {
    setCurrentStep(1)
    setFarmerData({
      name: '', phone: '', farmerId: '', village: '', district: '', state: '', experience: '', certification: ''
    })
    setHerbData({
      botanicalName: '', commonName: '', ayurvedicName: '', partUsed: '', quantity: '', unit: 'kg',
      collectionMethod: '', season: '', weatherConditions: '', soilType: '', notes: ''
    })
    setLocation(null)
    setQrCodeUrl('')
    setSubmissionResult(null)
    setLocationError('')
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-herb-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-herb-green-600 mx-auto mb-4"></div>
          <p className="text-herb-green-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <>
        <Head>
          <title>TRACE HERB - Farmer Portal Login</title>
          <meta name="description" content="Login to access the farmer collection portal" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <LoginForm />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>TRACE HERB - Farmer Collection DApp</title>
        <meta name="description" content="Herb collection data entry with geo-tagging" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-herb-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-xl sticky top-0 z-50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-herb-green-600 to-herb-green-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-4xl">🌿</span>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-herb-green-600 to-herb-green-800 bg-clip-text text-transparent">TRACE HERB</h1>
                  <p className="text-xl md:text-2xl text-gray-600 font-medium">Farmer Collection DApp</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Welcome back,</p>
                  <p className="text-lg font-semibold text-herb-green-700">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.profile?.farmName}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Logout
                </button>
                <div className="text-right">
                  <p className="text-lg md:text-xl text-gray-600 font-medium">Step {currentStep} of 4</p>
                  <div className="w-32 bg-gray-200 rounded-full h-4 mt-2">
                    <div
                      className="bg-herb-green-600 h-4 rounded-full transition-all duration-300 shadow-lg"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          {/* Step 1: Farmer Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl mx-auto">
              <div className="flex items-center space-x-6 mb-12">
                <UserIcon className="w-16 h-16 text-herb-green-600" />
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">Farmer Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Full Name *</label>
                  <input
                    type="text"
                    className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-herb-green-500 focus:border-herb-green-500 text-xl font-medium transition-all duration-300"
                    value={farmerData.name}
                    onChange={(e) => setFarmerData({...farmerData, name: e.target.value})}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Phone Number *</label>
                  <input
                    type="tel"
                    className="w-full px-6 py-5 border-4 border-gray-300 rounded-2xl focus:ring-4 focus:ring-herb-green-500 focus:border-herb-green-500 text-xl font-medium transition-all duration-300"
                    value={farmerData.phone}
                    onChange={(e) => setFarmerData({...farmerData, phone: e.target.value})}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farmer ID</label>
                  <input
                    type="text"
                    className="input-field"
                    value={farmerData.farmerId}
                    onChange={(e) => setFarmerData({...farmerData, farmerId: e.target.value})}
                    placeholder="Government issued farmer ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Village *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={farmerData.village}
                    onChange={(e) => setFarmerData({...farmerData, village: e.target.value})}
                    placeholder="Village name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={farmerData.district}
                    onChange={(e) => setFarmerData({...farmerData, district: e.target.value})}
                    placeholder="District name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <select
                    className="input-field"
                    value={farmerData.state}
                    onChange={(e) => setFarmerData({...farmerData, state: e.target.value})}
                    required
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={farmerData.experience}
                    onChange={(e) => setFarmerData({...farmerData, experience: e.target.value})}
                    placeholder="Years of experience"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certification</label>
                  <select
                    className="input-field"
                    value={farmerData.certification}
                    onChange={(e) => setFarmerData({...farmerData, certification: e.target.value})}
                  >
                    <option value="">Select Certification</option>
                    <option value="Organic">Organic Certified</option>
                    <option value="Fair Trade">Fair Trade Certified</option>
                    <option value="GAP">Good Agricultural Practices</option>
                    <option value="None">No Certification</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-12">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!farmerData.name || !farmerData.phone || !farmerData.village || !farmerData.district || !farmerData.state}
                  className="px-12 py-6 bg-herb-green-600 text-white rounded-2xl font-black text-2xl md:text-3xl shadow-2xl hover:shadow-3xl hover:bg-herb-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Herb Details
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Herb Information */}
          {currentStep === 2 && (
            <div className="card max-w-2xl mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <BeakerIcon className="w-8 h-8 text-herb-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Herb Collection Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Botanical Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={herbData.botanicalName}
                    onChange={(e) => setHerbData({...herbData, botanicalName: e.target.value})}
                    placeholder="e.g., Withania somnifera"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Common Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={herbData.commonName}
                    onChange={(e) => setHerbData({...herbData, commonName: e.target.value})}
                    placeholder="e.g., Winter Cherry"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ayurvedic Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={herbData.ayurvedicName}
                    onChange={(e) => setHerbData({...herbData, ayurvedicName: e.target.value})}
                    placeholder="e.g., Ashwagandha"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Part Used *</label>
                  <select
                    className="input-field"
                    value={herbData.partUsed}
                    onChange={(e) => setHerbData({...herbData, partUsed: e.target.value})}
                    required
                  >
                    <option value="">Select Part Used</option>
                    <option value="Root">Root</option>
                    <option value="Leaf">Leaf</option>
                    <option value="Stem">Stem</option>
                    <option value="Flower">Flower</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Seed">Seed</option>
                    <option value="Bark">Bark</option>
                    <option value="Whole Plant">Whole Plant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      className="input-field flex-1"
                      value={herbData.quantity}
                      onChange={(e) => setHerbData({...herbData, quantity: e.target.value})}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      required
                    />
                    <select
                      className="input-field w-20"
                      value={herbData.unit}
                      onChange={(e) => setHerbData({...herbData, unit: e.target.value})}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="ton">ton</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collection Method *</label>
                  <select
                    className="input-field"
                    value={herbData.collectionMethod}
                    onChange={(e) => setHerbData({...herbData, collectionMethod: e.target.value})}
                    required
                  >
                    <option value="">Select Method</option>
                    <option value="Wild Harvesting">Wild Harvesting</option>
                    <option value="Cultivated">Cultivated</option>
                    <option value="Semi-Wild">Semi-Wild</option>
                    <option value="Organic Farming">Organic Farming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Season *</label>
                  <select
                    className="input-field"
                    value={herbData.season}
                    onChange={(e) => setHerbData({...herbData, season: e.target.value})}
                    required
                  >
                    <option value="">Select Season</option>
                    <option value="Spring">Spring (March-May)</option>
                    <option value="Summer">Summer (June-August)</option>
                    <option value="Monsoon">Monsoon (July-September)</option>
                    <option value="Post-Monsoon">Post-Monsoon (October-November)</option>
                    <option value="Winter">Winter (December-February)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weather Conditions</label>
                  <input
                    type="text"
                    className="input-field"
                    value={herbData.weatherConditions}
                    onChange={(e) => setHerbData({...herbData, weatherConditions: e.target.value})}
                    placeholder="e.g., Sunny, 25°C, Low humidity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                  <select
                    className="input-field"
                    value={herbData.soilType}
                    onChange={(e) => setHerbData({...herbData, soilType: e.target.value})}
                  >
                    <option value="">Select Soil Type</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Rocky">Rocky</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Black Cotton">Black Cotton</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    value={herbData.notes}
                    onChange={(e) => setHerbData({...herbData, notes: e.target.value})}
                    placeholder="Any additional information about the collection..."
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!herbData.botanicalName || !herbData.commonName || !herbData.ayurvedicName || !herbData.partUsed || !herbData.quantity || !herbData.collectionMethod || !herbData.season}
                  className="btn-primary"
                >
                  Next: Location
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Location Capture */}
          {currentStep === 3 && (
            <div className="card max-w-2xl mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <MapPinIcon className="w-8 h-8 text-herb-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Geo-Location Capture</h2>
              </div>

              <div className="text-center">
                {!location && !loading && (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-herb-green-100 rounded-full flex items-center justify-center mx-auto">
                      <MapPinIcon className="w-12 h-12 text-herb-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Capture Collection Location</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We need your precise location to ensure traceability. This helps verify the origin of the herbs.
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800 max-w-md mx-auto mb-4">
                      <p><strong>📍 Location Required:</strong> Please allow location access when prompted. We use advanced GPS techniques to get your exact coordinates even in challenging conditions.</p>
                    </div>
                    <button
                      onClick={getCurrentLocation}
                      className="btn-primary mb-3"
                    >
                      📍 Get My Current Location
                    </button>
                    <div className="text-xs text-gray-500">
                      <button
                        onClick={useDemoLocation}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Use demo location (for testing only)
                      </button>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-herb-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <MapPinIcon className="w-12 h-12 text-herb-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Getting Your Location...</h3>
                    <p className="text-gray-600">Using advanced GPS techniques to find your exact coordinates. This may take a moment...</p>
                  </div>
                )}

                {location && (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircleIcon className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-900">
                      Location Captured! {location.isDemoLocation && '(Demo)'}
                    </h3>
                    <div className="bg-green-50 p-4 rounded-lg text-left max-w-md mx-auto">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Latitude:</strong></div>
                        <div>{location.latitude.toFixed(6)}</div>
                        <div><strong>Longitude:</strong></div>
                        <div>{location.longitude.toFixed(6)}</div>
                        <div><strong>Accuracy:</strong></div>
                        <div>{Math.round(location.accuracy)}m</div>
                        <div><strong>Time:</strong></div>
                        <div>{new Date(location.timestamp).toLocaleTimeString()}</div>
                        {location.isDemoLocation && (
                          <>
                            <div><strong>Location:</strong></div>
                            <div>Bangalore, India</div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={getCurrentLocation}
                        className="btn-secondary text-sm"
                      >
                        📍 Get Real Location
                      </button>
                      {!location.isDemoLocation && (
                        <button
                          onClick={useDemoLocation}
                          className="btn-secondary text-sm"
                        >
                          🎯 Use Demo Location
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {locationError && (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-900">Location Error</h3>
                    <p className="text-red-600 max-w-md mx-auto">{locationError}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={getCurrentLocation}
                        className="btn-primary"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={useDemoLocation}
                        className="btn-secondary"
                      >
                        🎯 Use Demo Location
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      For demo purposes, you can use a sample location (Bangalore, India)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={!location}
                  className="btn-primary"
                >
                  Next: Generate QR
                </button>
              </div>
            </div>
          )}

          {/* Step 4: QR Code Generation and Submission */}
          {currentStep === 4 && (
            <div className="card max-w-2xl mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <QrCodeIcon className="w-8 h-8 text-herb-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Generate QR Code</h2>
              </div>

              {!submissionResult && (
                <div className="text-center space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
                      <div><strong>Farmer:</strong> {farmerData.name}</div>
                      <div><strong>Location:</strong> {farmerData.village}, {farmerData.district}</div>
                      <div><strong>Herb:</strong> {herbData.ayurvedicName} ({herbData.botanicalName})</div>
                      <div><strong>Part Used:</strong> {herbData.partUsed}</div>
                      <div><strong>Quantity:</strong> {herbData.quantity} {herbData.unit}</div>
                      <div><strong>Method:</strong> {herbData.collectionMethod}</div>
                      <div><strong>Season:</strong> {herbData.season}</div>
                      <div><strong>GPS:</strong> {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}</div>
                    </div>
                  </div>

                  <button
                    onClick={generateQRAndSubmit}
                    disabled={loading}
                    className="px-12 py-6 bg-gradient-to-r from-herb-green-600 to-herb-green-700 hover:from-herb-green-700 hover:to-herb-green-800 text-white rounded-2xl font-black text-2xl md:text-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Submitting to Blockchain...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl">🔗</span>
                        <span>Submit to Blockchain & Generate QR</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {submissionResult && (
                <div className="text-center space-y-6">
                  {submissionResult.success ? (
                    <>
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircleIcon className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-green-900">Success!</h3>
                      <p className="text-green-700">{submissionResult.message}</p>

                      {qrCodeUrl && (
                        <div className="bg-white p-6 rounded-lg border-2 border-green-200 max-w-sm mx-auto">
                          <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto" />
                          <div className="mt-4 space-y-2">
                            <p className="font-semibold text-gray-900">QR Code: {submissionResult.qrCode}</p>
                            <p className="text-sm text-gray-600">Collection ID: {submissionResult.collectionId}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.download = `${submissionResult.qrCode}.png`
                            link.href = qrCodeUrl
                            link.click()
                          }}
                          className="btn-primary"
                        >
                          📱 Download QR Code
                        </button>
                        <button
                          onClick={resetForm}
                          className="btn-secondary"
                        >
                          ➕ Add New Collection
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-red-900">Submission Failed</h3>
                      <p className="text-red-700 mb-4">{submissionResult.message}</p>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5"></div>
                          <div className="text-left">
                            <h4 className="font-semibold text-yellow-800 mb-2">Troubleshooting Tips:</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              <li>• Check your internet connection</li>
                              <li>• Make sure all required fields are filled</li>
                              <li>• Verify GPS location is available</li>
                              <li>• Try refreshing the page if the issue persists</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => {
                            setSubmissionResult(null)
                            generateQRAndSubmit()
                          }}
                          disabled={loading}
                          className="px-8 py-4 bg-herb-green-600 text-white rounded-2xl font-black text-xl hover:bg-herb-green-700 transition-all duration-300 shadow-lg disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                              Retrying...
                            </>
                          ) : (
                            '🔄 Try Again'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSubmissionResult(null)
                            setCurrentStep(3)
                          }}
                          className="px-8 py-4 bg-gray-200 text-gray-700 rounded-2xl font-black text-xl hover:bg-gray-300 transition-all duration-300 shadow-lg"
                        >
                          ⬅️ Go Back
                        </button>
                        <button
                          onClick={() => {
                            setSubmissionResult(null)
                            resetForm()
                          }}
                          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all duration-300 shadow-lg"
                        >
                          🔄 Start Over
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {!submissionResult && (
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
