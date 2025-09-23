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
import { useStandaloneAuth } from '../hooks/useAuth'
import LoginForm from '../components/LoginForm'
import SignupForm from '../components/SignupForm'
import ProfileView from '../components/ProfileView'
import FarmerDashboard from '../components/FarmerDashboard'
import FastFarmerDashboard from '../components/FastFarmerDashboard'
import BatchTrackingView from '../components/BatchTrackingView'
import FastBatchTracking from '../components/FastBatchTracking'
import MobileBatchTracking from '../components/MobileBatchTracking'
import AIVerificationWidget from '../components/AIVerificationWidget'
import RuralConnectivityWidget from '../components/RuralConnectivityWidget'
import SMSBlockchainGateway from '../components/SMSBlockchainGateway'
import SustainabilityWidget from '../components/SustainabilityWidget'
import SecurityWidget from '../components/SecurityWidget'
import RegulatoryWidget from '../components/RegulatoryWidget'

export default function FarmerDApp() {
  // Authentication
  const { user, loading: authLoading, login, signup, updateProfile, logout } = useStandaloneAuth()
  const [showDashboard, setShowDashboard] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showBatchTracking, setShowBatchTracking] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [submissionResult, setSubmissionResult] = useState(null)
  const [connectivityTest, setConnectivityTest] = useState(null)
  const [aiVerificationResult, setAiVerificationResult] = useState(null)
  const [showAiVerification, setShowAiVerification] = useState(false)
  const [ruralConnectivityResult, setRuralConnectivityResult] = useState(null)
  const [showRuralConnectivity, setShowRuralConnectivity] = useState(false)
  const [smsGatewayResult, setSMSGatewayResult] = useState(null)
  const [showSMSGateway, setShowSMSGateway] = useState(false)
  const [sustainabilityResult, setSustainabilityResult] = useState(null)
  const [showSustainability, setShowSustainability] = useState(false)
  const [securityResult, setSecurityResult] = useState(null)
  const [showSecurity, setShowSecurity] = useState(false)
  const [regulatoryResult, setRegulatoryResult] = useState(null)
  const [showRegulatory, setShowRegulatory] = useState(false)

  // Login handler
  const handleLogin = async (credentials) => {
    setLoginLoading(true)
    try {
      const result = await login(credentials, 'farmer')
      if (result.success) {
        setShowDashboard(true)
        setShowSignup(false)
      } else {
        alert(result.error || 'Login failed')
      }
    } catch (error) {
      alert('Login failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Signup handler
  const handleSignup = async (formData) => {
    setLoginLoading(true)
    try {
      const result = await signup(formData)
      if (result.success) {
        setShowDashboard(true)
        setShowSignup(false)
      } else {
        alert(result.error || 'Signup failed')
      }
    } catch (error) {
      alert('Signup failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Profile update handler
  const handleUpdateProfile = async (profileData) => {
    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        alert('Profile updated successfully!')
      } else {
        alert(result.error || 'Profile update failed')
      }
    } catch (error) {
      alert('Profile update failed. Please try again.')
    }
  }

  // Dashboard handlers
  const handleCreateBatch = () => {
    setShowDashboard(false)
    setCurrentStep(2) // Skip farmer information step, go directly to herb collection details
  }

  const handleBackToDashboard = () => {
    setShowDashboard(true)
  }

  const handleLogout = () => {
    logout()
    setShowDashboard(true)
  }

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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile connectivity test function
  const testMobileConnectivity = async () => {
    const getBackendURL = () => {
      if (typeof window === 'undefined') return 'http://localhost:3000'
      const hostname = window.location.hostname
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:3000`
      }
      return 'http://localhost:3000'
    }

    const backendURL = getBackendURL()

    try {
      console.log('📱 Testing mobile connectivity to:', backendURL)

      const response = await axios.get(`${backendURL}/api/mobile/test`, {
        timeout: 10000,
        headers: {
          'X-Mobile-Client': 'true',
          'X-Source': 'farmer-mobile-dapp'
        }
      })

      setConnectivityTest({
        success: true,
        message: 'Mobile connectivity test successful!',
        backendURL: backendURL,
        data: response.data,
        timestamp: new Date().toISOString()
      })

      console.log('✅ Mobile connectivity test passed:', response.data)

    } catch (error) {
      console.error('❌ Mobile connectivity test failed:', error)

      setConnectivityTest({
        success: false,
        message: `Mobile connectivity test failed: ${error.message}`,
        backendURL: backendURL,
        error: {
          code: error.code,
          message: error.message,
          response: error.response?.data
        },
        timestamp: new Date().toISOString()
      })
    }
  }

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

      // Prepare batch data for local storage
      const batchData = {
        id: collectionId,
        collectionId: collectionId,
        batchId: collectionId,
        qrCode: qrCode,
        botanicalName: herbData.botanicalName,
        commonName: herbData.commonName,
        quantity: herbData.quantity,
        unit: herbData.unit,
        farmerName: farmerData.name,
        farmLocation: `${farmerData.village}, ${farmerData.district}`,
        farmSize: '5 acres', // Default value
        collectionMethod: herbData.collectionMethod,
        season: herbData.season,
        weatherConditions: herbData.weatherConditions,
        soilType: herbData.soilType,
        certifications: farmerData.certification,
        farmerData: farmerData,
        herbData: herbData,
        location: location,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: 'pending',
        synced: false
      }

      // Save to both farmer-specific and shared storage
      const existingFarmerBatches = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
      existingFarmerBatches.push(batchData)
      localStorage.setItem('farmerBatches', JSON.stringify(existingFarmerBatches))

      // Also save to shared batch storage for cross-portal sync
      const existingSharedBatches = JSON.parse(localStorage.getItem('traceHerbBatches') || '[]')
      existingSharedBatches.push(batchData)
      localStorage.setItem('traceHerbBatches', JSON.stringify(existingSharedBatches))

      // Trigger immediate update event
      window.dispatchEvent(new CustomEvent('batchAdded', { detail: batchData }))
      console.log('🎉 Batch added event dispatched:', batchData.qrCode)

      // If offline, add to pending sync queue
      if (!navigator.onLine) {
        const pendingSyncs = JSON.parse(localStorage.getItem('pendingSyncs') || '[]')
        pendingSyncs.push({
          type: 'batch_creation',
          data: batchData,
          timestamp: Date.now()
        })
        localStorage.setItem('pendingSyncs', JSON.stringify(pendingSyncs))

        // Generate QR code for offline use
        const qrCodeDataUrl = await QRCode.toDataURL(qrCode, {
          width: 256,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        })
        setQrCodeUrl(qrCodeDataUrl)

        setSubmissionResult({
          success: true,
          message: 'Batch saved locally. Will sync when online.',
          collectionId: collectionId,
          qrCode: qrCode,
          offline: true
        })

        setCurrentStep(4)
        setLoading(false)
        return
      }

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

      // Enhanced mobile blockchain sync with multiple fallback strategies
      let apiSubmissionSuccess = false

      // Determine the correct backend URL based on device
      const getBackendURL = () => {
        if (typeof window === 'undefined') return 'http://localhost:3000'

        const hostname = window.location.hostname

        // If accessing from mobile (not localhost), use the same IP for backend
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          return `http://${hostname}:3000`
        }

        return 'http://localhost:3000'
      }

      const backendURL = getBackendURL()
      console.log('📱 Mobile: Using backend URL:', backendURL)

      // Try multiple endpoints and strategies for better mobile connectivity
      const trySubmitToBlockchain = async () => {
        const endpoints = [
          `${backendURL}/api/collection/events`,
          `${backendURL}/api/collection/submit`,
          `${backendURL}/api/batches`
        ]

        for (const endpoint of endpoints) {
          try {
            console.log(`📱 Mobile: Trying endpoint: ${endpoint}`)

            const response = await axios.post(endpoint, collectionEventData, {
              timeout: 15000, // 15 second timeout for mobile
              headers: {
                'Content-Type': 'application/json',
                'X-Mobile-Client': 'true',
                'X-Source': 'farmer-mobile-dapp'
              }
            })

            if (response.data && (response.data.success || response.status === 200)) {
              console.log('✅ Successfully submitted to blockchain via:', endpoint)
              return true
            }
          } catch (error) {
            console.warn(`❌ Endpoint ${endpoint} failed:`, error.message)

            // Log detailed error information for debugging
            if (error.code === 'ECONNREFUSED') {
              console.error('📱 Connection refused - backend server may not be accessible from mobile')
            } else if (error.code === 'ETIMEDOUT') {
              console.error('📱 Request timeout - slow network connection')
            } else if (error.response) {
              console.error('📱 Server responded with error:', error.response.status, error.response.data)
            }
          }
        }

        return false
      }

      try {
        apiSubmissionSuccess = await trySubmitToBlockchain()

        if (!apiSubmissionSuccess) {
          console.warn('❌ All blockchain endpoints failed, storing locally')
          console.log('📱 Backend URL attempted:', backendURL)
          console.log('📱 Network status:', navigator.onLine ? 'Online' : 'Offline')

          // Additional mobile-specific debugging
          if (typeof window !== 'undefined') {
            console.log('📱 Current hostname:', window.location.hostname)
            console.log('📱 Current protocol:', window.location.protocol)
            console.log('📱 User agent:', navigator.userAgent)
          }
        }
      } catch (error) {
        console.error('❌ Blockchain submission completely failed:', error)
        apiSubmissionSuccess = false
      }

      // Store locally for later sync if blockchain submission failed
      if (!apiSubmissionSuccess) {
        const localData = JSON.parse(localStorage.getItem('trace-herb-pending-submissions') || '[]')
        localData.push({
          ...collectionEventData,
          submittedAt: new Date().toISOString(),
          syncStatus: 'pending',
          backendURL: backendURL,
          error: apiError.message
        })
        localStorage.setItem('trace-herb-pending-submissions', JSON.stringify(localData))
      }

      // Enhanced success message with mobile-specific information
      const getSuccessMessage = () => {
        if (apiSubmissionSuccess) {
          return isMobile
            ? '✅ Collection synced to blockchain successfully from mobile!'
            : '✅ Collection event recorded successfully on blockchain!'
        } else {
          const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
          const isMobileDevice = hostname !== 'localhost' && hostname !== '127.0.0.1'

          if (isMobileDevice) {
            return `📱 Collection saved locally on mobile. Backend: ${backendURL}. Check network connection and try again.`
          } else {
            return '💾 Collection data saved locally. Will sync to blockchain when connection is available.'
          }
        }
      }

      setSubmissionResult({
        success: true,
        qrCode: qrCode,
        collectionId: collectionId,
        message: getSuccessMessage(),
        backendURL: backendURL,
        isMobile: isMobile
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
      <div className="mobile-container bg-gradient-to-br from-herb-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-herb-green-600 mx-auto mb-4"></div>
          <p className="text-herb-green-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login/signup forms if user is not authenticated
  if (!user) {
    if (showSignup) {
      return (
        <>
          <Head>
            <title>TRACE HERB - Farmer Registration</title>
            <meta name="description" content="Register as a farmer to access the collection portal" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <SignupForm
            onSignup={handleSignup}
            onSwitchToLogin={() => setShowSignup(false)}
            loading={loginLoading}
          />
        </>
      )
    }

    return (
      <>
        <Head>
          <title>TRACE HERB - Farmer Portal Login</title>
          <meta name="description" content="Login to access the farmer collection portal" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="theme-color" content="#16a34a" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <LoginForm
          onLogin={handleLogin}
          onSwitchToSignup={() => setShowSignup(true)}
          portalName="Farmer Portal"
          portalIcon="🧑‍🌾"
          loading={loginLoading}
        />
      </>
    )
  }

  // Show profile view
  if (showProfile) {
    return (
      <>
        <Head>
          <title>TRACE HERB - Farmer Profile</title>
          <meta name="description" content="Manage your farmer profile" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <ProfileView
          user={user}
          onUpdateProfile={handleUpdateProfile}
          onBack={() => setShowProfile(false)}
          onLogout={logout}
        />
      </>
    )
  }

  // Show batch tracking view
  if (showBatchTracking && selectedBatchId) {
    return (
      <>
        <Head>
          <title>TRACE HERB - Batch Tracking</title>
          <meta name="description" content="Track your batch progress in real-time" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        {isMobile ? (
          <MobileBatchTracking
            key={selectedBatchId}
            batch={{ qrCode: selectedBatchId, ...{} }} // You might need to fetch full batch data
            onBack={() => {
              setShowBatchTracking(false)
              setSelectedBatchId(null)
            }}
          />
        ) : (
          <FastBatchTracking
            key={selectedBatchId} // Force re-render when batchId changes
            batchId={selectedBatchId}
            onBack={() => {
              setShowBatchTracking(false)
              setSelectedBatchId(null)
            }}
          />
        )}
      </>
    )
  }

  // Show dashboard if user is authenticated and showDashboard is true
  if (user && showDashboard) {
    return (
      <>
        <Head>
          <title>TRACE HERB - Farmer Dashboard</title>
          <meta name="description" content="Farmer dashboard for batch management" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <FastFarmerDashboard
          user={user}
          onCreateBatch={handleCreateBatch}
          onShowProfile={() => setShowProfile(true)}
          onShowBatchTracking={(batchId) => {
            console.log('📋 FARMER PORTAL: Setting selected batch ID:', batchId)
            setSelectedBatchId(batchId)
            setShowBatchTracking(true)
          }}
          onLogout={handleLogout}
          onTestConnectivity={testMobileConnectivity}
          connectivityTest={connectivityTest}
          isMobile={isMobile}
        />
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

      <div className="mobile-container bg-gradient-to-br from-herb-green-50 to-blue-50">
        {/* Header */}
        <header className="mobile-header bg-white/90 backdrop-blur-sm shadow-xl">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToDashboard}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors touch-manipulation"
                  title="Back to Dashboard"
                >
                  ←
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-herb-green-600 to-herb-green-700 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">🌿</span>
                </div>
                <div>
                  <h1 className="text-lg font-black bg-gradient-to-r from-herb-green-600 to-herb-green-800 bg-clip-text text-transparent">TRACE HERB</h1>
                  <p className="text-sm text-gray-600 font-medium">Farmer DApp</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Welcome</p>
                  <p className="text-sm font-semibold text-herb-green-700">{user.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Logout
                </button>
                <div className="text-right">
                  <p className="text-lg md:text-xl text-gray-600 font-medium">Step {currentStep} of 5</p>
                  <div className="w-32 bg-gray-200 rounded-full h-4 mt-2">
                    <div
                      className="bg-herb-green-600 h-4 rounded-full transition-all duration-300 shadow-lg"
                      style={{ width: `${(currentStep / 5) * 100}%` }}
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
                  onClick={handleBackToDashboard}
                  className="btn-secondary"
                >
                  Back to Dashboard
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
                  onClick={() => setShowAiVerification(!showAiVerification)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {showAiVerification ? 'Hide AI Tools' : 'Show AI Tools'}
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

                {showAiVerification && (
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

                {/* Sustainability & Incentives Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2">🌱 Sustainability & Incentives</h3>
                      <p className="text-green-700 text-sm mb-3">
                        Earn Green Tokens, build reputation, and generate carbon credits for sustainable practices.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSustainability(!showSustainability)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {showSustainability ? 'Hide Incentives' : 'Show Incentives'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Green Token Economy</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span>Reputation Scoring</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>Carbon Credits Marketplace</span>
                    </div>
                  </div>
                </div>

                {showSustainability && (
                  <SustainabilityWidget
                    onSustainabilityComplete={(result) => {
                      setSustainabilityResult(result);
                      console.log('Sustainability Result:', result);
                    }}
                    batchData={{
                      ...herbData,
                      ...farmerData,
                      location,
                      collectionDate: new Date().toISOString()
                    }}
                    farmerId={farmerData.farmerId || 'F001'}
                  />
                )}

                {sustainabilityResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">🌱 Sustainability Action Complete</h4>
                    <p className="text-green-700 text-sm">
                      Your sustainable action has been recorded and rewards have been calculated.
                    </p>
                  </div>
                )}

                {/* Security & Cyber Innovation Section */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-red-800 mb-2">🔐 Security & Cyber Innovation</h3>
                      <p className="text-red-700 text-sm mb-3">
                        Zero-Knowledge Proofs, end-to-end encryption, and advanced threat detection for maximum security.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSecurity(!showSecurity)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {showSecurity ? 'Hide Security' : 'Show Security'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span>Zero-Knowledge Proofs</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>End-to-End Encryption</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span>Threat Detection</span>
                    </div>
                  </div>
                </div>

                {showSecurity && (
                  <SecurityWidget
                    onSecurityComplete={(result) => {
                      setSecurityResult(result);
                      console.log('Security Result:', result);
                    }}
                    batchData={{
                      ...herbData,
                      ...farmerData,
                      location,
                      collectionDate: new Date().toISOString()
                    }}
                    farmerId={farmerData.farmerId || 'F001'}
                  />
                )}

                {securityResult && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">🔐 Security Operation Complete</h4>
                    <p className="text-red-700 text-sm">
                      Security operation has been completed successfully with advanced cryptographic protection.
                    </p>
                  </div>
                )}

                {/* Regulatory & Export Ready Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">📋 Regulatory & Export Ready</h3>
                      <p className="text-blue-700 text-sm mb-3">
                        GS1/FHIR compliance and automated export certificate generation for global markets.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowRegulatory(!showRegulatory)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {showRegulatory ? 'Hide Regulatory' : 'Show Regulatory'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>GS1 Global Standards</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>FHIR Healthcare</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span>Export Certificates</span>
                    </div>
                  </div>
                </div>

                {showRegulatory && (
                  <RegulatoryWidget
                    onRegulatoryComplete={(result) => {
                      setRegulatoryResult(result);
                      console.log('Regulatory Result:', result);
                    }}
                    batchData={{
                      ...herbData,
                      ...farmerData,
                      location,
                      collectionDate: new Date().toISOString()
                    }}
                    farmerId={farmerData.farmerId || 'F001'}
                  />
                )}

                {regulatoryResult && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Regulatory Compliance Complete</h4>
                    <p className="text-blue-700 text-sm">
                      Regulatory compliance has been generated successfully and is ready for global export.
                    </p>
                  </div>
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
                          onClick={() => {
                            resetForm()
                            setCurrentStep(2) // Go directly to herb collection details
                          }}
                          className="btn-secondary"
                        >
                          ➕ Add New Collection
                        </button>
                        <button
                          onClick={() => {
                            setShowDashboard(true)
                            // Refresh the farmer portal
                            window.location.reload()
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <span>🏠</span>
                          <span>Return to Home Page</span>
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
        </main>
      </div>
    </>
  )
}
