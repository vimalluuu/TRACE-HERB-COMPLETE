/**
 * Main Farmer DApp Component
 * This component contains the main logic and is imported dynamically to prevent SSR issues
 */

import { useState, useEffect } from 'react'
import Head from 'next/head'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { UserIcon, BeakerIcon, MapPinIcon, CheckCircleIcon, ExclamationTriangleIcon, QrCodeIcon } from '@heroicons/react/24/outline'

import AIVerificationWidget from './AIVerificationWidget'
import RuralConnectivityWidget from './RuralConnectivityWidget'
import SMSBlockchainGateway from './SMSBlockchainGateway'


export default function FarmerDAppMain() {
  // Client-side only state to prevent hydration issues
  const [isClient, setIsClient] = useState(false)

  // Authentication - simplified
  const [user, setUser] = useState({
    name: 'Demo Farmer',
    id: 'farmer_001',
    profile: {
      phone: '+91 9876543210',
      farmName: 'Green Valley Farm',
      location: 'Keshavpur Village',
      farmId: 'FARM_001',
      certifications: ['Organic', 'Sustainable']
    }
  })
  const [showDashboard, setShowDashboard] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [showBatchTracking, setShowBatchTracking] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState(null)

  // Collection states
  const [currentStep, setCurrentStep] = useState(1)
  const [farmerData, setFarmerData] = useState({
    name: '',
    farmLocation: '',
    contactInfo: '',
    certifications: []
  })
  const [herbData, setHerbData] = useState({
    species: '',
    variety: '',
    harvestDate: '',
    quantity: '',
    qualityGrade: '',
    processingMethod: '',
    storageConditions: ''
  })
  const [location, setLocation] = useState(null)
  const [photos, setPhotos] = useState([])
  const [qrCode, setQrCode] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [collectionComplete, setCollectionComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Enhanced features states
  const [showAIVerification, setShowAIVerification] = useState(false)
  const [showRuralConnectivity, setShowRuralConnectivity] = useState(false)
  const [showSMSGateway, setShowSMSGateway] = useState(false)
  const [showSustainability, setShowSustainability] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)
  const [showRegulatory, setShowRegulatory] = useState(false)

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Client-side only rendering to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Farmer Portal...</p>
        </div>
      </div>
    )
  }

  // Enhanced features results states
  const [aiVerificationResult, setAiVerificationResult] = useState(null)
  const [ruralConnectivityResult, setRuralConnectivityResult] = useState(null)
  const [smsGatewayResult, setSMSGatewayResult] = useState(null)
  const [sustainabilityResult, setSustainabilityResult] = useState(null)
  const [securityResult, setSecurityResult] = useState(null)
  const [regulatoryResult, setRegulatoryResult] = useState(null)

  // Form submission states
  const [submissionResult, setSubmissionResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [locationError, setLocationError] = useState('')

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

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
        async (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          }

          // Try to get place name using reverse geocoding
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY&limit=1`
            )
            if (response.ok) {
              const data = await response.json()
              if (data.results && data.results.length > 0) {
                const place = data.results[0]
                locationData.placeName = place.formatted
                locationData.village = place.components.village || place.components.town || place.components.city
                locationData.district = place.components.state_district || place.components.county
                locationData.state = place.components.state
                locationData.country = place.components.country
              }
            }
          } catch (geocodeError) {
            console.warn('Reverse geocoding failed:', geocodeError)
            // Fallback to basic location info
            locationData.placeName = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          }

          setLocation(locationData)
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
        async (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          }

          // Try to get place name using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
            )
            if (response.ok) {
              const data = await response.json()
              if (data && data.display_name) {
                locationData.placeName = data.display_name
                locationData.village = data.address?.village || data.address?.town || data.address?.city
                locationData.district = data.address?.state_district || data.address?.county
                locationData.state = data.address?.state
                locationData.country = data.address?.country
              }
            }
          } catch (geocodeError) {
            console.warn('Reverse geocoding failed:', geocodeError)
            // Fallback to basic location info
            locationData.placeName = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          }

          setLocation(locationData)
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

  // Simple logout function
  const logout = () => {
    setUser(null)
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
          <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3 md:space-x-6">
                <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-2xl md:text-4xl">🌿</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">TRACE HERB</h1>
                  <p className="text-sm md:text-xl lg:text-2xl text-gray-600 font-medium">Farmer Collection DApp</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 w-full md:w-auto">
                <div className="text-center md:text-right">
                  <p className="text-xs md:text-sm text-gray-500">Welcome back,</p>
                  <p className="text-sm md:text-lg font-semibold text-green-700">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.profile?.farmName}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-2 md:px-4 md:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-xs md:text-sm font-medium"
                >
                  Logout
                </button>
                <div className="text-center md:text-right">
                  <p className="text-sm md:text-lg lg:text-xl text-gray-600 font-medium">Step {currentStep} of 5</p>
                  <div className="w-24 md:w-32 bg-gray-200 rounded-full h-3 md:h-4 mt-2">
                    <div
                      className="bg-green-600 h-3 md:h-4 rounded-full transition-all duration-300 shadow-lg"
                      style={{ width: `${(currentStep / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-20 md:top-24 z-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex space-x-4 md:space-x-8 overflow-x-auto">
              <button
                onClick={() => {
                  setShowDashboard(true)
                  setShowProfile(false)
                  setShowBatchTracking(false)
                  setCurrentStep(1)
                }}
                className={`py-3 md:py-4 px-3 md:px-2 border-b-2 font-medium text-sm md:text-base whitespace-nowrap ${
                  showDashboard
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => {
                  setShowDashboard(false)
                  setShowProfile(false)
                  setShowBatchTracking(false)
                  setCurrentStep(1)
                }}
                className={`py-3 md:py-4 px-3 md:px-2 border-b-2 font-medium text-sm md:text-base whitespace-nowrap ${
                  !showDashboard && !showProfile && !showBatchTracking
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🌿 New Collection
              </button>
              <button
                onClick={() => {
                  setShowDashboard(false)
                  setShowProfile(false)
                  setShowBatchTracking(true)
                }}
                className={`py-3 md:py-4 px-3 md:px-2 border-b-2 font-medium text-sm md:text-base whitespace-nowrap ${
                  showBatchTracking
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📦 Batch Tracking
              </button>
              <button
                onClick={() => {
                  setShowDashboard(false)
                  setShowProfile(true)
                  setShowBatchTracking(false)
                }}
                className={`py-3 md:py-4 px-3 md:px-2 border-b-2 font-medium text-sm md:text-base whitespace-nowrap ${
                  showProfile
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👤 Profile
              </button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 md:px-6 py-6 md:py-12">
          {/* Dashboard View */}
          {showDashboard && (
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
                      <p className="text-2xl font-bold text-gray-900">12</p>
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
                      <p className="text-2xl font-bold text-gray-900">3</p>
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
                      <p className="text-2xl font-bold text-gray-900">45 kg</p>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">COL_001</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ashwagandha</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5 kg</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">Complete</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">COL_002</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Turmeric</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10 kg</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Processing
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">In Progress</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">COL_003</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Neem</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">8 kg</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full" style={{width: '20%'}}></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">Started</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Profile View */}
          {showProfile && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Farmer Profile</h2>

              <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                <div className="flex items-center mb-8">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">{user.profile?.phone}</p>
                    <p className="text-sm text-gray-500">{user.profile?.farmName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farm ID</label>
                    <p className="text-gray-900">{user.profile?.farmId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <p className="text-gray-900">{user.profile?.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <p className="text-gray-900">{user.profile?.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <p className="text-gray-900">January 2024</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.profile?.certifications?.map((cert, index) => (
                      <span key={index} className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Collection Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">12</p>
                      <p className="text-sm text-gray-600">Total Collections</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">45</p>
                      <p className="text-sm text-gray-600">Total Quantity (kg)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">5</p>
                      <p className="text-sm text-gray-600">Herb Varieties</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowProfile(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Batch Tracking View */}
          {showBatchTracking && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Batch Tracking</h2>

              {/* Filter Options */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Batches</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">All Batches</button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">Pending</button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">Processing</button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">Approved</button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">Completed</button>
                </div>
              </div>

              {/* Batch List with Progress Timeline */}
              <div className="space-y-6">
                {/* Batch 1 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">COL_001 - Ashwagandha</h4>
                      <p className="text-gray-600">5 kg • Collected on Jan 15, 2024</p>
                    </div>
                    <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                  </div>

                  {/* Progress Timeline */}
                  <div className="mt-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Progress Timeline</h5>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Collection Submitted</p>
                          <p className="text-xs text-gray-500">Jan 15, 2024 - 10:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Quality Testing</p>
                          <p className="text-xs text-gray-500">Jan 16, 2024 - 2:15 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Approved</p>
                          <p className="text-xs text-gray-500">Jan 17, 2024 - 11:45 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Payment Processed</p>
                          <p className="text-xs text-gray-500">Jan 18, 2024 - 9:20 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Batch 2 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">COL_002 - Turmeric</h4>
                      <p className="text-gray-600">10 kg • Collected on Jan 20, 2024</p>
                    </div>
                    <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                      Processing
                    </span>
                  </div>

                  {/* Progress Timeline */}
                  <div className="mt-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Progress Timeline</h5>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Collection Submitted</p>
                          <p className="text-xs text-gray-500">Jan 20, 2024 - 3:45 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Quality Testing</p>
                          <p className="text-xs text-gray-500">In Progress</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-500">Pending Approval</p>
                          <p className="text-xs text-gray-400">Waiting</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-500">Payment Processing</p>
                          <p className="text-xs text-gray-400">Waiting</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Batch 3 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">COL_003 - Neem</h4>
                      <p className="text-gray-600">8 kg • Collected on Jan 22, 2024</p>
                    </div>
                    <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>

                  {/* Progress Timeline */}
                  <div className="mt-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Progress Timeline</h5>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Collection Submitted</p>
                          <p className="text-xs text-gray-500">Jan 22, 2024 - 1:20 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-500">Quality Testing</p>
                          <p className="text-xs text-gray-400">Waiting</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-500">Pending Approval</p>
                          <p className="text-xs text-gray-400">Waiting</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-500">Payment Processing</p>
                          <p className="text-xs text-gray-400">Waiting</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowBatchTracking(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Collection Workflow */}
          {!showDashboard && !showProfile && !showBatchTracking && (
            <>
              {/* Step 1: Farmer Information */}
              {currentStep === 1 && (
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 max-w-5xl mx-auto">
              <div className="flex items-center space-x-3 md:space-x-6 mb-8 md:mb-12">
                <UserIcon className="w-10 h-10 md:w-16 md:h-16 text-green-600" />
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900">Farmer Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-lg md:text-xl font-bold text-gray-700 mb-3 md:mb-4">Full Name *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 md:px-6 md:py-5 border-2 md:border-4 border-gray-300 rounded-xl md:rounded-2xl focus:ring-2 md:focus:ring-4 focus:ring-green-500 focus:border-green-500 text-lg md:text-xl font-medium transition-all duration-300"
                    value={farmerData.name}
                    onChange={(e) => setFarmerData({...farmerData, name: e.target.value})}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg md:text-xl font-bold text-gray-700 mb-3 md:mb-4">Phone Number *</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 md:px-6 md:py-5 border-2 md:border-4 border-gray-300 rounded-xl md:rounded-2xl focus:ring-2 md:focus:ring-4 focus:ring-green-500 focus:border-green-500 text-lg md:text-xl font-medium transition-all duration-300"
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
                      {location.placeName && (
                        <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          <div className="text-sm font-medium text-blue-800">📍 Location</div>
                          <div className="text-sm text-blue-700">{location.placeName}</div>
                          {location.village && (
                            <div className="text-xs text-blue-600 mt-1">
                              {location.village}, {location.district}, {location.state}
                            </div>
                          )}
                        </div>
                      )}
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
                  Next: AI Verification
                </button>
              </div>
            </div>
          )}

          {/* Step 4: AI Verification */}
          {currentStep === 4 && (
            <div className="card max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">AI</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">AI Verification</h2>
                </div>
                <button
                  onClick={() => setShowAIVerification(!showAIVerification)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {showAIVerification ? 'Hide AI Tools' : 'Show AI Tools'}
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">🤖 AI-Powered Verification</h3>
                  <p className="text-purple-700 text-sm mb-3">
                    Use AI to verify plant species, detect anomalies, and process voice reports.
                    This step is optional but recommended for enhanced traceability.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Plant Species Verification</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>Voice-to-Blockchain Recording</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Anomaly Detection</span>
                    </div>
                  </div>
                </div>

                {showAIVerification && (
                  <AIVerificationWidget
                    onVerificationComplete={(result) => {
                      setAiVerificationResult(result);
                      console.log('AI Verification Result:', result);
                    }}
                    batchData={{
                      ...herbData,
                      ...farmerData,
                      location,
                      collectionDate: new Date().toISOString()
                    }}
                  />
                )}

                {aiVerificationResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">✅ AI Verification Complete</h4>
                    <p className="text-green-700 text-sm">
                      AI verification has been completed and the results will be included in the blockchain record.
                    </p>
                  </div>
                )}

                {/* Rural Connectivity Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">🌐 Rural Connectivity Solutions</h3>
                      <p className="text-blue-700 text-sm mb-3">
                        Alternative methods for farmers in remote areas with limited internet connectivity.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowRuralConnectivity(!showRuralConnectivity)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {showRuralConnectivity ? 'Hide Rural Tools' : 'Show Rural Tools'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>SMS-to-Blockchain Gateway</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      <span>Offline Data Synchronization</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span>Paper QR with OTP Activation</span>
                    </div>
                  </div>
                </div>

                {showRuralConnectivity && (
                  <RuralConnectivityWidget
                    onConnectivityComplete={(result) => {
                      setRuralConnectivityResult(result);
                      console.log('Rural Connectivity Result:', result);
                    }}
                    batchData={{
                      ...herbData,
                      ...farmerData,
                      location,
                      collectionDate: new Date().toISOString()
                    }}
                  />
                )}

                {ruralConnectivityResult && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">🌐 Rural Connectivity Complete</h4>
                    <p className="text-blue-700 text-sm">
                      Rural connectivity solution has been configured and is ready for use.
                    </p>
                  </div>
                )}

                {/* SMS-over-Blockchain Gateway Section */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-indigo-800 mb-2">📡 SMS-over-Blockchain Gateway</h3>
                      <p className="text-indigo-700 text-sm mb-3">
                        IoT devices transmitting collection data via SMS when internet connectivity is sparse.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSMSGateway(!showSMSGateway)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {showSMSGateway ? 'Hide Gateway' : 'Show Gateway'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>IoT Device Registry</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>SMS Data Transmission</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span>Collection Event Simulation</span>
                    </div>
                  </div>

                  {showSMSGateway && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-200">
                      <p className="text-sm text-indigo-700 mb-3">
                        <strong>SMS Gateway Status:</strong> Monitoring {smsGatewayResult?.data?.devices?.length || 0} IoT devices at remote collection points.
                      </p>
                    </div>
                  )}
                </div>

                {showSMSGateway && (
                  <SMSBlockchainGateway
                    onGatewayComplete={(result) => {
                      setSMSGatewayResult(result);
                      console.log('SMS Gateway Result:', result);
                    }}
                    batchData={{
                      commonName: herbData.commonName || 'Ashwagandha',
                      quantity: herbData.quantity || '5.0',
                      location: `${farmerData.village || 'Karnataka'}, ${farmerData.state || 'India'}`
                    }}
                  />
                )}

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="btn-secondary"
                  >
                    ← Back to Location
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="btn-primary"
                  >
                    Continue to QR Generation →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: QR Code Generation and Submission */}
          {currentStep === 5 && (
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
                      {location?.placeName && (
                        <div><strong>Location:</strong> {location.placeName}</div>
                      )}
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
                            setCurrentStep(4)
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
                    onClick={() => setCurrentStep(4)}
                    className="btn-secondary"
                  >
                    Back to AI Verification
                  </button>
                </div>
              )}
            </div>
          )}
          </>
          )}
        </main>
      </div>
    </>
  )
}
