import { useState, useEffect } from 'react'
import Head from 'next/head'
import { HerbDetailsStep, LocationStep, QRStep } from './CollectionSteps'
import ProfileView from './ProfileView'
import FastFarmerDashboard from './FastFarmerDashboard'
import FastBatchTracking from './FastBatchTracking'
import QRCode from 'qrcode'

export default function WorkingFarmerPortal({ user: authUser, onLogout, onUpdateProfile }) {
  const [mounted, setMounted] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard') // dashboard, collection, profile, batches, trackBatch
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState(null)

  // Use authenticated user if provided; fallback to demo
  const user = authUser || {
    id: 'demo-user',
    firstName: 'Demo',
    lastName: 'Farmer',
    name: 'Demo Farmer',
    profile: {
      phone: '+91 9876543210',
      farmName: 'Green Valley Farm',
      location: 'Keshavpur Village',
      farmId: 'FARM_001',
      certifications: ['Organic', 'Sustainable']
    }
  }

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
  const [filterStatus, setFilterStatus] = useState('all')

  // Batches persisted per user (and also mirrored to a global store for processor portal)
  const storageKey = `traceherb:batches:${user?.id || 'guest'}`
  const [batches, setBatches] = useState([])


  // Compute API base that works on mobile (uses current host instead of localhost)
  const API_BASE = (typeof window !== 'undefined')
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://localhost:3000'

  // Load existing batches on mount
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(storageKey) || '[]') : []
      setBatches(saved)
    } catch (e) {
      console.warn('Failed to load saved batches', e)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const saveBatches = (list) => {
    try {
      setBatches(list)
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(list))
      }
    } catch (e) { console.warn('Failed to save batches', e) }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get current location with reverse geocoding
  const getCurrentLocation = async () => {
    setLoading(true)
    setLocationError('')
    try {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser.')
        setLoading(false)
        return
      }
      if (!window.isSecureContext) {
        setLocationError('Location requires a secure origin (HTTPS). On mobile, use "Use Demo Location" or open over HTTPS.')
        setLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          }

          // Try reverse geocoding
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
            locationData.placeName = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          }

          setLocation(locationData)
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
    } catch (e) {
      setLocationError('Failed to get location.')
      setLoading(false)
    }
  }

  // Demo location fallback (for HTTP/mobile where geolocation requires HTTPS)
  const useDemoLocation = () => {
    const demo = {
      latitude: 12.971599,
      longitude: 77.594566,
      accuracy: 25,
      altitude: 0,
      timestamp: new Date().toISOString(),
      placeName: 'MG Road, Bengaluru, Karnataka, India',
      village: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      country: 'India'
    }
    setLocation(demo)
    setLocationError('')
  }

  // Minimal AI verification: prefill from SMS-like text via backend AI endpoint
  const aiPrefillFromSMS = async (message) => {
    try {
      if (!message || !message.trim()) return
      const resp = await fetch(`${API_BASE}/api/ai/sms-to-blockchain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: farmerData?.phone || '0000000000', message })
      })
      if (resp.ok) {
        const json = await resp.json()
        const ai = json?.data || {}
        const updates = {}
        if (ai?.herb?.commonName) updates.commonName = ai.herb.commonName
        if (ai?.herb?.botanicalName) updates.botanicalName = ai.herb.botanicalName
        if (ai?.quantity?.value || ai?.quantity) updates.quantity = ai.quantity?.value || ai.quantity
        if (ai?.unit) updates.unit = ai.unit
        setHerbData(prev => ({ ...prev, ...updates }))
        if (ai?.location?.latitude && ai?.location?.longitude) {
          setLocation({
            latitude: ai.location.latitude,
            longitude: ai.location.longitude,
            accuracy: ai.location.accuracy || 100,
            timestamp: new Date().toISOString(),
            placeName: ai.location.placeName || `${ai.location.latitude}, ${ai.location.longitude}`,
            village: ai.location.village || '',
            district: ai.location.district || '',
            state: ai.location.state || '',
            country: ai.location.country || ''
          })
        }
        setLocationError('')
      }
    } catch (e) {
      console.warn('AI prefill failed', e)
    }
  }



  // Submit collection data with QR generation (Blockchain-first, with local fallback)
  const submitCollectionData = async () => {
    setLoading(true)
    try {
      const collectionId = `COL_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      // 1) Try to submit to backend (writes to blockchain via CA-connected backend)
      let backendQrCode = null
      try {
        const payload = {


          collectionId,
          farmer: {
            id: user?.id,
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || ''),
            phone: farmerData.phone,
            village: farmerData.village,
            district: farmerData.district,
            state: farmerData.state
          },
          herb: {
            commonName: herbData.commonName,
            botanicalName: herbData.botanicalName,
            partUsed: herbData.partUsed,
            quantity: Number(herbData.quantity) || 0,
            unit: herbData.unit,
            notes: herbData.notes
          },
          location: {
            latitude: location?.latitude,
            longitude: location?.longitude,
            accuracy: location?.accuracy,
            altitude: location?.altitude,
            address: location?.placeName,
            village: location?.village,
            district: location?.district,
            state: location?.state,
            country: location?.country
          },
          metadata: { source: 'farmer-portal', submittedAt: new Date().toISOString() }
        }
        const resp = await fetch(`${API_BASE}/api/collection/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (resp.ok) {
          const json = await resp.json()
          if (json?.success && json?.data?.qrCode) {
            backendQrCode = json.data.qrCode
          }
        }
      } catch (e) {
        console.log('Backend submit failed, will fallback to local:', e?.message)
      }

      // 2) Generate QR image using backend QR code if available; else local payload QR
      let qrCodeDataUrl = ''
      let effectiveQrCode = backendQrCode || collectionId
      if (backendQrCode) {
        qrCodeDataUrl = await QRCode.toDataURL(backendQrCode, {
          width: 256,
          margin: 2,
          color: { dark: '#166534', light: '#FFFFFF' }
        })
      } else {
        const localPayload = {
          id: collectionId,
          portal: 'farmer',
          farmerId: user?.id,
          farmer: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || ''),
          herb: herbData.botanicalName,
          qty: herbData.quantity,
          unit: herbData.unit,
          lat: location?.latitude,
          lon: location?.longitude,
          place: location?.placeName,
          village: location?.village,
          district: location?.district,
          state: location?.state,
          country: location?.country,
          ts: new Date().toISOString()
        }
        qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(localPayload), {
          width: 256,
          margin: 2,
          color: { dark: '#166534', light: '#FFFFFF' }
        })
      }
      setQrCodeUrl(qrCodeDataUrl)

      // Build batch object for persistence and pipeline (compatible with old dashboard/tracking)
      const batch = {
        id: collectionId,
        collectionId,
        qrCode: effectiveQrCode,
        botanicalName: herbData.botanicalName,
        commonName: herbData.commonName,
        herb: herbData.commonName || herbData.botanicalName,
        herbDetails: { ...herbData },
        quantity: Number(herbData.quantity) || 0,
        unit: herbData.unit,
        date: new Date().toISOString().slice(0,10),
        createdAt: new Date().toISOString(),
        status: 'pending',
        stage: 'processor',
        qrCodeDataUrl,
        location: { ...location },
        ownerId: user?.id,
        farmerName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || ''),
        timeline: [
          { step: 'Collection Submitted', date: new Date().toLocaleString(), completed: true },
          { step: 'Waiting for Processor Pickup', date: 'Farmer', completed: false },
          { step: 'Laboratory Testing', date: 'Waiting', completed: false },
          { step: 'Regulatory Approval', date: 'Waiting', completed: false },
          { step: 'Available to Consumer', date: 'Locked until approval', completed: false }
        ]
      }

      // Persist locally (per user)
      const updated = [batch, ...batches]
      saveBatches(updated)

      // Mirror to old-portal stores so Fast dashboards can see the batch
      if (typeof window !== 'undefined') {
        // Farmer personal storage
        const farmerKey = 'farmerBatches'
        const farmerExisting = JSON.parse(localStorage.getItem(farmerKey) || '[]')
        farmerExisting.unshift(batch)
        localStorage.setItem(farmerKey, JSON.stringify(farmerExisting))

        // Shared storage visible across portals
        const sharedKey = 'traceHerbBatches'
        const sharedExisting = JSON.parse(localStorage.getItem(sharedKey) || '[]')
        sharedExisting.unshift(batch)
        localStorage.setItem(sharedKey, JSON.stringify(sharedExisting))

        // Legacy global mirror
        const globalKey = 'traceherb:all-batches'
        const all = JSON.parse(localStorage.getItem(globalKey) || '[]')
        all.unshift(batch)
        localStorage.setItem(globalKey, JSON.stringify(all))

        // Notify listeners
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: farmerKey, newValue: JSON.stringify(farmerExisting), storageArea: localStorage }))
          window.dispatchEvent(new StorageEvent('storage', { key: sharedKey, newValue: JSON.stringify(sharedExisting), storageArea: localStorage }))
          window.dispatchEvent(new CustomEvent('batchAdded', { detail: batch }))
        } catch (e) { /* ignore */ }
      }

      setSubmissionResult({ success: true, message: 'Collection event recorded successfully!', collectionId })
      setCurrentStep(4)
    } catch (e) {
      setSubmissionResult({ success: false, message: 'Failed to submit collection data. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Reset form
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

  // Filter batches
  const filteredBatches = filterStatus === 'all' ? batches : batches.filter(batch => batch.status === filterStatus)
  const totalQuantityKg = batches.reduce((sum, b) => {
    const q = parseFloat(b?.herbDetails?.quantity || (b?.quantity || '').toString().split(' ')[0])
    return sum + (isNaN(q) ? 0 : q)
  }, 0)

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Farmer Portal...</p>
        </div>
      </div>
    )
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
        <header className="bg-white/90 backdrop-blur-sm shadow-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3 md:space-x-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-2xl md:text-3xl">🌿</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">TRACE HERB</h1>
                  <p className="text-sm md:text-lg text-gray-600 font-medium">Farmer Collection Portal</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs md:text-sm text-gray-500">Welcome,</p>
                  <p className="text-sm md:text-lg font-semibold text-green-700">{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name}</p>
                  <p className="text-xs text-gray-400">{user.profile?.farmName || user.farmName}</p>
                </div>
                {onLogout && (
                  <button onClick={onLogout} className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-16 md:top-20 z-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex space-x-4 md:space-x-8 overflow-x-auto">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`py-3 md:py-4 px-3 md:px-2 border-b-2 font-medium text-sm md:text-base whitespace-nowrap ${
                  currentView === 'dashboard'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => { setCurrentView('collection'); setCurrentStep(1); }}
                className={`py-3 md:py-4 px-3 md:px-2 border-b-2 font-medium text-sm md:text-base whitespace-nowrap ${
                  currentView === 'collection'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🌿 New Collection
              </button>
              <button
                onClick={() => setCurrentView('batches')}
                className={`py-3 md:py-4 px-3 md:px-2 border-b-2 font-medium text-sm md:text-base whitespace-nowrap ${
                  currentView === 'batches'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📦 Batch Tracking
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`py-3 md:py-4 px-3 md:px-2 border-b-2 font-medium text-sm md:text-base whitespace-nowrap ${
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
        <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <FastFarmerDashboard
              user={authUser || user}
              onCreateBatch={() => { setCurrentView('collection'); setCurrentStep(1); }}
              onShowProfile={() => setCurrentView('profile')}
              onShowBatchTracking={(id) => { setSelectedBatchId(id); setCurrentView('trackBatch'); }}
              onLogout={onLogout}
            />
          )}

          {/* Batch Tracking View */}
          {currentView === 'batches' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Batch Tracking</h2>

              {/* Filter Options */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Batches</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      filterStatus === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All Batches
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      filterStatus === 'pending' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilterStatus('processing')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      filterStatus === 'processing' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => setFilterStatus('approved')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      filterStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Approved
                  </button>
                </div>
              </div>

              {/* Batch List with Progress Timeline */}
              <div className="space-y-6">
                {filteredBatches.map((batch) => (
                  <div key={batch.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{batch.id} - {batch.herb}</h4>
                        <p className="text-gray-600">{batch.quantity} • Collected on {batch.date}</p>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        batch.status === 'approved' ? 'bg-green-100 text-green-800' :
                        batch.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                      </span>
                    </div>

                    {/* Progress Timeline */}
                    <div className="mt-6">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Progress Timeline</h5>
                      <div className="space-y-3">
                        {batch.timeline.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <div className={`w-4 h-4 rounded-full ${
                              step.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <div className="ml-3 flex-1">
                              <p className={`text-sm font-medium ${
                                step.completed ? 'text-gray-900' : 'text-gray-500'
                              }`}>
                                {step.step}
                              </p>
                              <p className={`text-xs ${
                                step.completed ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                {step.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Track specific batch (old portal tracking) */}
          {currentView === 'trackBatch' && (
            <FastBatchTracking
              batchId={selectedBatchId}
              onBack={() => setCurrentView('dashboard')}
            />
          )}

          {/* Profile View */}
          {currentView === 'profile' && (
            <ProfileView
              user={authUser || user}
              onUpdateProfile={onUpdateProfile}
              onBack={() => setCurrentView('dashboard')}
              onLogout={onLogout}
            />
          )}

          {/* Collection Workflow */}
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
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
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

          {/* Track specific batch (old portal tracking) */}
          {currentView === 'trackBatch' && (
            <FastBatchTracking
              batchId={selectedBatchId}
              onBack={() => setCurrentView('dashboard')}
            />
          )}


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

              {/* Step 2: Herb Details */}
              {currentStep === 2 && (
                <HerbDetailsStep
                  herbData={herbData}
                  setHerbData={setHerbData}
                  setCurrentStep={setCurrentStep}
                  onAIPrefillFromSMS={aiPrefillFromSMS}
                />
              )}

              {/* Step 3: Location Capture */}
              {currentStep === 3 && (
                <LocationStep
                  location={location}
                  locationError={locationError}
                  loading={loading}
                  getCurrentLocation={getCurrentLocation}
                  useDemoLocation={useDemoLocation}
                  setCurrentStep={setCurrentStep}
                  submitCollectionData={submitCollectionData}
                />
              )}

              {/* Step 4: QR Code & Success */}
              {currentStep === 4 && (
                <QRStep
                  submissionResult={submissionResult}
                  qrCodeUrl={qrCodeUrl}
                  resetForm={resetForm}
                  setCurrentView={setCurrentView}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
