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
import AIVerificationWidget from '../components/AIVerificationWidget'
import RuralConnectivityWidget from '../components/RuralConnectivityWidget'
import SMSBlockchainGateway from '../components/SMSBlockchainGateway'
import SustainabilityWidget from '../components/SustainabilityWidget'
import SecurityWidget from '../components/SecurityWidget'
import RegulatoryWidget from '../components/RegulatoryWidget'
import { LanguageSelectionModal, LanguageSwitchButton, SimpleDropdown } from '../components/SimpleLanguageSelector'
import { t, getHerbOptions, getDropdownOptions } from '../utils/simpleTranslations'
import LanguageWelcomePage from '../components/LanguageWelcomePage'

// Simple in-memory cache for reverse geocoding results (keyed by rounded lat,lon)
const reverseGeocodeCache = new Map()

export default function FarmerDApp() {
  // Language state
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [languageSelected, setLanguageSelected] = useState(false)

  // Offline state and sync notifications
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSyncBatches, setPendingSyncBatches] = useState([])
  const [showSyncNotification, setShowSyncNotification] = useState(false)

  // Authentication
  const { user, loading: authLoading, login, signup, updateProfile, logout } = useStandaloneAuth()
  const [showDashboard, setShowDashboard] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showBatchTracking, setShowBatchTracking] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState(null)
  const [loginLoading, setLoginLoading] = useState(false)

  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [leafletMap, setLeafletMap] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [submissionResult, setSubmissionResult] = useState(null)
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

  // Language initialization
  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmerPortalLanguage')
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
      setLanguageSelected(true)
    } else {
      setLanguageSelected(false)
    }
  }, [])

  // Offline detection and sync management
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Try to sync pending batches when coming back online
      syncPendingBatches()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Load pending sync batches from localStorage
    const loadPendingSyncBatches = () => {
      const saved = localStorage.getItem('pendingSyncBatches')
      if (saved) {
        const batches = JSON.parse(saved)
        setPendingSyncBatches(batches)
        if (batches.length > 0) {
          setShowSyncNotification(true)
        }
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    loadPendingSyncBatches()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Language change handler
  const handleLanguageChange = (language) => {
    setCurrentLanguage(language)
    localStorage.setItem('farmerPortalLanguage', language)
    setShowLanguageSelector(false)
    setLanguageSelected(true)
  }

  // Handle initial language selection from welcome page
  const handleInitialLanguageSelect = (language) => {
    setCurrentLanguage(language)
    localStorage.setItem('farmerPortalLanguage', language)
    setLanguageSelected(true)
  }

  // Sync pending batches to blockchain
  const syncPendingBatches = async () => {
    if (pendingSyncBatches.length === 0) return

    try {
      for (const batch of pendingSyncBatches) {
        // Try to submit to blockchain
        const response = await axios.post('/api/herb-batches', batch)
        if (response.status === 200) {
          // Remove from pending list if successful
          const updatedPending = pendingSyncBatches.filter(b => b.id !== batch.id)
          setPendingSyncBatches(updatedPending)
          localStorage.setItem('pendingSyncBatches', JSON.stringify(updatedPending))
        }
      }

      if (pendingSyncBatches.length === 0) {
        setShowSyncNotification(false)
      }
    } catch (error) {
      console.log('Sync failed, will retry later:', error)
    }
  }

  // Add batch to pending sync when offline
  const addToPendingSync = (batchData) => {
    const newBatch = {
      ...batchData,
      id: uuidv4(),
      createdOffline: true,
      timestamp: new Date().toISOString()
    }

    const updated = [...pendingSyncBatches, newBatch]
    setPendingSyncBatches(updated)
    localStorage.setItem('pendingSyncBatches', JSON.stringify(updated))
    setShowSyncNotification(true)

    return newBatch
  }

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

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if Leaflet is already loaded
    if (window.L) {
      setMapLoaded(true)
      return
    }

    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = ''
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = ''
    script.onload = () => {
      setMapLoaded(true)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount
      if (link.parentNode) link.parentNode.removeChild(link)
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [])

  // Initialize or update map when location changes
  useEffect(() => {
    if (!mapLoaded || !location || !window.L) return

    const mapContainer = document.getElementById('location-map')
    if (!mapContainer) return

    try {
      // If map already exists, update it
      if (leafletMap) {
        leafletMap.setView([location.latitude, location.longitude], 15)
        leafletMap.eachLayer((layer) => {
          if (layer instanceof window.L.Marker) {
            leafletMap.removeLayer(layer)
          }
        })

        // Add new marker with place name above
        const marker = window.L.marker([location.latitude, location.longitude])
          .addTo(leafletMap)

        // Add place name as a permanent label above the marker
        if (location.placeName) {
          const placeLabel = window.L.divIcon({
            className: 'place-name-label',
            html: `<div style="background: rgba(59, 130, 246, 0.95); padding: 6px 12px; border-radius: 6px; border: 2px solid white; font-size: 13px; font-weight: bold; color: white; text-align: center; white-space: nowrap; box-shadow: 0 4px 8px rgba(0,0,0,0.3); max-width: 250px; overflow: hidden; text-overflow: ellipsis;">${location.placeName}</div>`,
            iconSize: [250, 30],
            iconAnchor: [125, 45]
          })

          window.L.marker([location.latitude, location.longitude], { icon: placeLabel })
            .addTo(leafletMap)
        }

        marker.bindPopup(`
          <div style="text-align: center;">
            <strong>📍 Location Captured</strong><br/>
            <small>Lat: ${location.latitude.toFixed(6)}</small><br/>
            <small>Lng: ${location.longitude.toFixed(6)}</small>
          </div>
        `).openPopup()

        return
      }

      // Create new map
      const map = window.L.map(mapContainer, {
        center: [location.latitude, location.longitude],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
      })

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      // Add marker with place name above
      const marker = window.L.marker([location.latitude, location.longitude])
        .addTo(map)

      // Add place name as a permanent label above the marker
      if (location.placeName) {
        const placeLabel = window.L.divIcon({
          className: 'place-name-label',
          html: `<div style="background: rgba(59, 130, 246, 0.95); padding: 6px 12px; border-radius: 6px; border: 2px solid white; font-size: 13px; font-weight: bold; color: white; text-align: center; white-space: nowrap; box-shadow: 0 4px 8px rgba(0,0,0,0.3); max-width: 250px; overflow: hidden; text-overflow: ellipsis;">${location.placeName}</div>`,
          iconSize: [250, 30],
          iconAnchor: [125, 45]
        })

        window.L.marker([location.latitude, location.longitude], { icon: placeLabel })
          .addTo(map)
      }

      marker.bindPopup(`
        <div style="text-align: center;">
          <strong>📍 Location Captured</strong><br/>
          <small>Lat: ${location.latitude.toFixed(6)}</small><br/>
          <small>Lng: ${location.longitude.toFixed(6)}</small>
        </div>
      `).openPopup()

      setLeafletMap(map)
    } catch (error) {
      console.warn('Map initialization failed:', error)
    }
  }, [mapLoaded, location, leafletMap])

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (leafletMap) {
        leafletMap.remove()
        setLeafletMap(null)
      }
    }
  }, [leafletMap])

  // Get current location with optimized settings and reverse geocoding
  const getCurrentLocation = async () => {
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

          // Convert coordinates to place name using reverse geocoding
          await new Promise(resolve => {
            // Try multiple geocoding services for better reliability (Tamil-first)
            const tryGeocoding = async () => {
              try {
                const key = `${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`
                const cached = reverseGeocodeCache.get(key)
                if (cached) {
                  locationData.placeName = cached.placeName
                  locationData.village = cached.village || ''
                  locationData.district = cached.district || ''
                  locationData.state = cached.state || ''
                  locationData.country = cached.country || ''
                  resolve(); return
                }

                // Nominatim (demo) with Tamil-first language
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=16&addressdetails=1&accept-language=ta,en`
                const nominatimResponse = await fetch(url, {
                  headers: {
                    'User-Agent': 'TraceHerbApp/1.0',
                    'Accept-Language': 'ta,en'
                  }
                })

                if (nominatimResponse.ok) {
                  const data = await nominatimResponse.json()
                  console.log('Nominatim geocoding response:', data)

                  if (data) {
                    const addr = data.address || {}
                    const state = addr.state || ''
                    const city = addr.city || addr.town || addr.municipality || addr.county || addr.district || ''
                    const locality = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.locality || addr.quarter || ''

                    // Build "State, City, Locality"
                    const formatted = [state, city, locality].filter(Boolean).join(', ')

                    if (formatted) {
                      locationData.placeName = formatted
                      locationData.village = city || ''
                      locationData.district = addr.state_district || addr.district || addr.county || ''
                      locationData.state = state || ''
                      locationData.country = addr.country || ''
                      reverseGeocodeCache.set(key, { placeName: locationData.placeName, village: locationData.village, district: locationData.district, state: locationData.state, country: locationData.country })
                      resolve(); return
                    } else if (data.display_name) {
                      locationData.placeName = data.display_name
                      locationData.village = city || ''
                      locationData.district = addr.state_district || addr.district || addr.county || ''
                      locationData.state = state || ''
                      locationData.country = addr.country || ''
                      reverseGeocodeCache.set(key, { placeName: locationData.placeName, village: locationData.village, district: locationData.district, state: locationData.state, country: locationData.country })
                      resolve(); return
                    }
                  }
                }

                // Fallback: Use a simple location description
                locationData.placeName = `Location near ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`
                resolve()

              } catch (error) {
                console.warn('Geocoding failed:', error)
                locationData.placeName = `Location at ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`
                resolve()
              }
            }

            tryGeocoding()
          })

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

          // Convert coordinates to place name using reverse geocoding
          await new Promise(resolve => {
            // Try multiple geocoding services for better reliability (Tamil-first)
            const tryGeocoding = async () => {
              try {
                const key = `${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`
                const cached = reverseGeocodeCache.get(key)
                if (cached) {
                  locationData.placeName = cached.placeName
                  locationData.village = cached.village || ''
                  locationData.district = cached.district || ''
                  locationData.state = cached.state || ''
                  locationData.country = cached.country || ''
                  resolve(); return
                }

                // Nominatim (demo) with Tamil-first language
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=16&addressdetails=1&accept-language=ta,en`
                const nominatimResponse = await fetch(url, {
                  headers: {
                    'User-Agent': 'TraceHerbApp/1.0',
                    'Accept-Language': 'ta,en'
                  }
                })

                if (nominatimResponse.ok) {
                  const data = await nominatimResponse.json()
                  console.log('Nominatim geocoding response:', data)

                  if (data) {
                    const addr = data.address || {}
                    const state = addr.state || ''
                    const city = addr.city || addr.town || addr.municipality || addr.county || addr.district || ''
                    const locality = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.locality || addr.quarter || ''

                    // Build "State, City, Locality"
                    const formatted = [state, city, locality].filter(Boolean).join(', ')

                    if (formatted) {
                      locationData.placeName = formatted
                      locationData.village = city || ''
                      locationData.district = addr.state_district || addr.district || addr.county || ''
                      locationData.state = state || ''
                      locationData.country = addr.country || ''
                      reverseGeocodeCache.set(key, { placeName: locationData.placeName, village: locationData.village, district: locationData.district, state: locationData.state, country: locationData.country })
                      resolve(); return
                    } else if (data.display_name) {
                      locationData.placeName = data.display_name
                      locationData.village = city || ''
                      locationData.district = addr.state_district || addr.district || addr.county || ''
                      locationData.state = state || ''
                      locationData.country = addr.country || ''
                      reverseGeocodeCache.set(key, { placeName: locationData.placeName, village: locationData.village, district: locationData.district, state: locationData.state, country: locationData.country })
                      resolve(); return
                    }
                  }
                }

                // Fallback: Use a simple location description
                locationData.placeName = `Location near ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`
                resolve()

              } catch (error) {
                console.warn('Geocoding failed:', error)
                locationData.placeName = `Location at ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`
                resolve()
              }
            }

            tryGeocoding()
          })

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
      isDemoLocation: true,
      placeName: 'Karnataka, Bengaluru, MG Road',
      village: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      country: 'India'
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
        // Store locally for later sync using our new notification system
        const offlineBatch = addToPendingSync({
          ...collectionEventData,
          submittedAt: new Date().toISOString(),
          syncStatus: 'pending'
        })

        // Also keep the old system for backward compatibility
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

  // Show language welcome page if language not selected
  if (!languageSelected) {
    return <LanguageWelcomePage onLanguageSelect={handleInitialLanguageSelect} />
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
            <title>TRACE HERB - {t('farmerInformation', currentLanguage)}</title>
            <meta name="description" content="Register as a farmer to access the collection portal" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <div className="relative">
            {/* Language Switch Button for Signup */}
            <div className="absolute top-4 right-4 z-10">
              <LanguageSwitchButton
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
              />
            </div>
            <SignupForm
              onSignup={handleSignup}
              onSwitchToLogin={() => setShowSignup(false)}
              loading={loginLoading}
              language={currentLanguage}
            />
          </div>
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
        <div className="relative">
          {/* Language Switch Button for Login */}
          <div className="absolute top-4 right-4 z-10">
            <LanguageSwitchButton
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
          <LoginForm
            onLogin={handleLogin}
            onSwitchToSignup={() => setShowSignup(true)}
            portalName={t('farmerInformation', currentLanguage)}
            portalIcon="🧑‍🌾"
            loading={loginLoading}
            language={currentLanguage}
          />
        </div>
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
        <FastBatchTracking
          key={selectedBatchId} // Force re-render when batchId changes
          batchId={selectedBatchId}
          onBack={() => {
            setShowBatchTracking(false)
            setSelectedBatchId(null)
          }}
          currentLanguage={currentLanguage}
        />
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
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>TRACE HERB - {t('farmerInformation', currentLanguage)}</title>
        <meta name="description" content="Herb collection data entry with geo-tagging" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-herb-green-50 via-white to-blue-50">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50">
          <div className="px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={handleBackToDashboard}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation"
                  title="Back to Dashboard"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-herb-green-500 via-herb-green-600 to-herb-green-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <span className="text-white font-bold text-xl sm:text-2xl">🌿</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-herb-green-600 via-herb-green-700 to-herb-green-800 bg-clip-text text-transparent truncate">TRACE HERB</h1>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold">Farmer Portal</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                {!isOnline && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Offline</span>
                  </div>
                )}
                <LanguageSwitchButton
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                />
                <div className="text-right hidden sm:block bg-gradient-to-r from-herb-green-50 to-herb-green-100 px-3 py-2 rounded-lg border border-herb-green-200">
                  <p className="text-xs text-herb-green-600 font-medium">Welcome</p>
                  <p className="text-sm font-bold text-herb-green-800 truncate max-w-24">{user.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">🚪</span>
                </button>
                <div className="text-right bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                  <p className="text-sm md:text-base text-gray-700 font-semibold">Step {currentStep} of 5</p>
                  <div className="w-28 sm:w-32 bg-gray-200 rounded-full h-2.5 mt-1.5">
                    <div
                      className="bg-gradient-to-r from-herb-green-500 to-herb-green-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${(currentStep / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Offline Sync Notification */}
        {showSyncNotification && pendingSyncBatches.length > 0 && (
          <div className="sticky top-16 z-30 mx-3 sm:mx-4 lg:mx-6 mt-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg shadow-lg border border-yellow-300 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {isOnline ? 'Syncing to Blockchain...' : 'Offline Mode'}
                    </p>
                    <p className="text-xs opacity-90">
                      {pendingSyncBatches.length} batch{pendingSyncBatches.length !== 1 ? 'es' : ''} pending sync
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSyncNotification(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
          {/* Step 1: Farmer Information */}
          {currentStep === 1 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-200/50 p-6 sm:p-12 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 sm:mb-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-herb-green-500 to-herb-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{t('farmerInformation', currentLanguage)}</h2>
                  <p className="text-sm sm:text-base text-gray-600 font-medium mt-2">Complete your profile information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <label className="block text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-herb-green-500 rounded-full mr-3"></span>
                    {t('fullName', currentLanguage)} *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-4 sm:px-6 sm:py-5 border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-herb-green-500 focus:border-herb-green-500 text-lg sm:text-xl font-medium transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm"
                    value={farmerData.name}
                    onChange={(e) => setFarmerData({...farmerData, name: e.target.value})}
                    placeholder={t('enterFullName', currentLanguage)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg sm:text-xl font-bold text-gray-700 mb-3 sm:mb-4">{t('phoneNumber', currentLanguage)} *</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-4 sm:px-6 sm:py-5 border-2 sm:border-4 border-gray-300 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-herb-green-500 focus:border-herb-green-500 text-lg sm:text-xl font-medium transition-all duration-300"
                    value={farmerData.phone}
                    onChange={(e) => setFarmerData({...farmerData, phone: e.target.value})}
                    placeholder={t('enterPhone', currentLanguage)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('farmerId', currentLanguage)}</label>
                  <input
                    type="text"
                    className="input-field"
                    value={farmerData.farmerId}
                    onChange={(e) => setFarmerData({...farmerData, farmerId: e.target.value})}
                    placeholder={t('farmerId', currentLanguage)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('village', currentLanguage)} *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={farmerData.village}
                    onChange={(e) => setFarmerData({...farmerData, village: e.target.value})}
                    placeholder={t('enterVillage', currentLanguage)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('district', currentLanguage)} *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={farmerData.district}
                    onChange={(e) => setFarmerData({...farmerData, district: e.target.value})}
                    placeholder={t('enterDistrict', currentLanguage)}
                    required
                  />
                </div>

                <SimpleDropdown
                  label={t('state', currentLanguage)}
                  value={farmerData.state}
                  onChange={(state) => setFarmerData({...farmerData, state})}
                  options={getDropdownOptions('states', currentLanguage)}
                  placeholder={t('selectState', currentLanguage)}
                  required={true}
                  language={currentLanguage}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('experience', currentLanguage)}</label>
                  <input
                    type="number"
                    className="input-field"
                    value={farmerData.experience}
                    onChange={(e) => setFarmerData({...farmerData, experience: e.target.value})}
                    placeholder={t('experience', currentLanguage)}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('certification', currentLanguage)}</label>
                  <select
                    className="input-field"
                    value={farmerData.certification}
                    onChange={(e) => setFarmerData({...farmerData, certification: e.target.value})}
                  >
                    <option value="">{t('certification', currentLanguage)}</option>
                    <option value="Organic">Organic Certified</option>
                    <option value="Fair Trade">Fair Trade Certified</option>
                    <option value="GAP">Good Agricultural Practices</option>
                    <option value="None">No Certification</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center sm:justify-end mt-8 sm:mt-12">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!farmerData.name || !farmerData.phone || !farmerData.village || !farmerData.district || !farmerData.state}
                  className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-herb-green-600 text-white rounded-xl sm:rounded-2xl font-black text-lg sm:text-2xl md:text-3xl shadow-2xl hover:shadow-3xl hover:bg-herb-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('next', currentLanguage)}: {t('herbDetails', currentLanguage)}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Herb Information */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <BeakerIcon className="w-8 h-8 text-herb-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">{t('herbDetails', currentLanguage)}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <SimpleDropdown
                    label={t('selectHerb', currentLanguage)}
                    value={herbData.commonName ? `${herbData.commonName} (${herbData.ayurvedicName})` : ''}
                    onChange={(selectedHerb) => {
                      const herbOptions = getHerbOptions(currentLanguage);
                      // Extract common name from display format "Common (Ayurvedic)"
                      const commonName = selectedHerb.split(' (')[0];
                      const herb = herbOptions.find(h => h.common === commonName);
                      if (herb) {
                        setHerbData({
                          ...herbData,
                          botanicalName: herb.botanical,
                          commonName: herb.common,
                          ayurvedicName: herb.ayurvedic
                        });
                      }
                    }}
                    options={getHerbOptions(currentLanguage).map(h => `${h.common} (${h.ayurvedic})`)}
                    placeholder={t('selectHerb', currentLanguage)}
                    required={true}
                    language={currentLanguage}
                  />
                </div>

                <SimpleDropdown
                  label={t('partUsed', currentLanguage)}
                  value={herbData.partUsed}
                  onChange={(part) => setHerbData({...herbData, partUsed: part})}
                  options={getDropdownOptions('partsUsed', currentLanguage)}
                  placeholder={t('selectPart', currentLanguage)}
                  required={true}
                  language={currentLanguage}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('quantity', currentLanguage)} *</label>
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
                    <div className="w-24">
                      <SimpleDropdown
                        label=""
                        value={herbData.unit}
                        onChange={(unit) => setHerbData({...herbData, unit})}
                        options={getDropdownOptions('units', currentLanguage)}
                        placeholder={t('unit', currentLanguage)}
                        required={false}
                        language={currentLanguage}
                      />
                    </div>
                  </div>
                </div>

                <SimpleDropdown
                  label={t('collectionMethod', currentLanguage)}
                  value={herbData.collectionMethod}
                  onChange={(method) => setHerbData({...herbData, collectionMethod: method})}
                  options={getDropdownOptions('collectionMethods', currentLanguage)}
                  placeholder={t('selectMethod', currentLanguage)}
                  required={true}
                  language={currentLanguage}
                />

                <SimpleDropdown
                  label={t('season', currentLanguage)}
                  value={herbData.season}
                  onChange={(season) => setHerbData({...herbData, season})}
                  options={getDropdownOptions('seasons', currentLanguage)}
                  placeholder={t('selectSeason', currentLanguage)}
                  required={true}
                  language={currentLanguage}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('weatherConditions', currentLanguage)}</label>
                  <input
                    type="text"
                    className="input-field"
                    value={herbData.weatherConditions}
                    onChange={(e) => setHerbData({...herbData, weatherConditions: e.target.value})}
                    placeholder={t('enterWeather', currentLanguage)}
                  />
                </div>

                <SimpleDropdown
                  label={t('soilType', currentLanguage)}
                  value={herbData.soilType}
                  onChange={(soil) => setHerbData({...herbData, soilType: soil})}
                  options={getDropdownOptions('soilTypes', currentLanguage)}
                  placeholder={t('enterSoil', currentLanguage)}
                  required={false}
                  language={currentLanguage}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('notes', currentLanguage)}</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    value={herbData.notes}
                    onChange={(e) => setHerbData({...herbData, notes: e.target.value})}
                    placeholder={t('enterNotes', currentLanguage)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6">
                <button
                  onClick={handleBackToDashboard}
                  className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
                >
                  {t('backToDashboard', currentLanguage)}
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!herbData.botanicalName || !herbData.commonName || !herbData.ayurvedicName || !herbData.partUsed || !herbData.quantity || !herbData.collectionMethod || !herbData.season}
                  className="btn-primary w-full sm:w-auto order-1 sm:order-2"
                >
                  {t('next', currentLanguage)}: {t('locationDetails', currentLanguage)}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Location Capture */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
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
                    <h3 className="text-lg font-semibold text-gray-900">{t('captureLocation', currentLanguage)}</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {t('preciseLocation', currentLanguage)}. {t('verifyOrigin', currentLanguage)}.
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800 max-w-md mx-auto mb-4">
                      <p><strong>📍 {t('locationRequired', currentLanguage)}:</strong> {t('allowLocationAccess', currentLanguage)}. {t('advancedGPS', currentLanguage)}.</p>
                    </div>
                    <button
                      onClick={getCurrentLocation}
                      className="btn-primary mb-3"
                    >
                      📍 {t('getLocation', currentLanguage)}
                    </button>
                    <div className="text-xs text-gray-500">
                      <button
                        onClick={useDemoLocation}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {t('useDemoLocation', currentLanguage)}
                      </button>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-herb-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <MapPinIcon className="w-12 h-12 text-herb-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('gettingLocation', currentLanguage)}</h3>
                    <p className="text-gray-600">{t('advancedGPS', currentLanguage)}.</p>
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

                    {/* Place/Area Name Display */}
                    {location.placeName && (
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 max-w-lg mx-auto">
                        <div className="text-lg font-semibold text-blue-800 mb-2">📍 Place/Area Name</div>
                        <div className="text-xl text-blue-900 font-bold">{location.placeName}</div>
                      </div>
                    )}

                    {/* Interactive Map */}
                    <div className="max-w-lg mx-auto">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3 text-center">📍 {t('locationOnMap', currentLanguage)}</h5>
                      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                        <div
                          id="location-map"
                          style={{ height: '300px', width: '100%' }}
                          className="bg-gray-100"
                        >
                          {!mapLoaded && (
                            <div className="h-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                                <p className="text-gray-600 text-sm">{t('loadingMap', currentLanguage)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {t('interactiveMap', currentLanguage)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={getCurrentLocation}
                        className="btn-secondary text-sm"
                      >
                        📍 {t('updateLocation', currentLanguage)}
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
                  {t('previous', currentLanguage)}
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
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
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
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <QrCodeIcon className="w-8 h-8 text-herb-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">{t('generateQRCode', currentLanguage)}</h2>
              </div>

              {!submissionResult && (
                <div className="text-center space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('collectionSummary', currentLanguage)}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
                      <div><strong>{t('farmer', currentLanguage)}:</strong> {farmerData.name}</div>
                      <div><strong>{t('location', currentLanguage)}:</strong> {farmerData.village}, {farmerData.district}</div>
                      <div><strong>{t('herb', currentLanguage)}:</strong> {herbData.ayurvedicName} ({herbData.botanicalName})</div>
                      <div><strong>{t('partUsed', currentLanguage)}:</strong> {herbData.partUsed}</div>
                      <div><strong>{t('quantity', currentLanguage)}:</strong> {herbData.quantity} {herbData.unit}</div>
                      <div><strong>{t('method', currentLanguage)}:</strong> {herbData.collectionMethod}</div>
                      <div><strong>{t('season', currentLanguage)}:</strong> {herbData.season}</div>
                      <div><strong>{t('gps', currentLanguage)}:</strong> {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}</div>
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
                        <span>{t('submittingToBlockchain', currentLanguage)}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl">🔗</span>
                        <span>{t('submitToBlockchain', currentLanguage)}</span>
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
                      <h3 className="text-xl font-bold text-green-900">{t('success', currentLanguage)}</h3>
                      <p className="text-green-700">{submissionResult.message}</p>

                      {qrCodeUrl && (
                        <div className="bg-white p-6 rounded-lg border-2 border-green-200 max-w-sm mx-auto">
                          <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto" />
                          <div className="mt-4 space-y-2">
                            <p className="font-semibold text-gray-900">QR Code: {submissionResult.qrCode}</p>
                            <p className="text-sm text-gray-600">{t('collectionID', currentLanguage)}: {submissionResult.collectionId}</p>
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
                          📱 {t('downloadQRCode', currentLanguage)}
                        </button>
                        <button
                          onClick={() => {
                            resetForm()
                            setCurrentStep(2) // Go directly to herb collection details
                          }}
                          className="btn-secondary"
                        >
                          ➕ {t('addNewCollection', currentLanguage)}
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

        {/* Language Selection Modal */}
        {showLanguageSelector && (
          <LanguageSelectionModal
            currentLanguage={currentLanguage}
            onLanguageSelect={handleLanguageChange}
          />
        )}
      </div>
    </>
  )
}
