import { useState, useEffect, useRef } from 'react'
import { MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

export default function LocationStep({
  location,
  locationError,
  loading,
  getCurrentLocation,
  useDemoLocation,
  setCurrentStep,
  submitCollectionData
}) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  // Load Leaflet dynamically (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !mapLoaded) {
      const loadLeaflet = async () => {
        try {
          // Load Leaflet CSS
          if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
            link.crossOrigin = ''
            document.head.appendChild(link)
          }

          // Load Leaflet JS
          if (!window.L) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script')
              script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
              script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
              script.crossOrigin = ''
              script.onload = resolve
              script.onerror = reject
              document.head.appendChild(script)
            })
          }

          setMapLoaded(true)
        } catch (error) {
          console.error('Failed to load Leaflet:', error)
        }
      }

      loadLeaflet()
    }
  }, [mapLoaded])

  // Initialize or update map when location changes
  useEffect(() => {
    if (mapLoaded && location && mapRef.current && window.L) {
      const { latitude, longitude } = location

      if (!mapInstanceRef.current) {
        // Initialize map
        mapInstanceRef.current = window.L.map(mapRef.current, {
          center: [latitude, longitude],
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
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(mapInstanceRef.current)
      } else {
        // Update existing map center
        mapInstanceRef.current.setView([latitude, longitude], 15)
      }

      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
      }

      // Add new marker
      markerRef.current = window.L.marker([latitude, longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup(location.placeName || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        .openPopup()
    }
  }, [mapLoaded, location])

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📍 Location Capture</h2>
        <p className="text-gray-600">Capture your current location for herb collection tracking</p>
      </div>

      {/* Location Detection Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MapPinIcon className="h-5 w-5 mr-2" />
          {loading ? 'Detecting...' : 'Detect My Location'}
        </button>

        <button
          onClick={useDemoLocation}
          className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          <GlobeAltIcon className="h-5 w-5 mr-2" />
          Use Demo Location
        </button>
      </div>

      {/* Error Display */}
      {locationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{locationError}</p>
        </div>
      )}

      {/* Location Details */}
      {location && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-green-800 mb-4">📍 Captured Location Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="text"
                value={location.latitude?.toFixed(6) || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="text"
                value={location.longitude?.toFixed(6) || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address / Place Name</label>
            <textarea
              value={location.placeName || `${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}`}
              readOnly
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 resize-none"
            />
          </div>

          {/* Interactive Map Container */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Interactive Map</label>
            <div 
              id="mapContainer"
              ref={mapRef}
              className="w-full h-[300px] border border-gray-300 rounded-lg bg-gray-100"
              style={{ minHeight: '300px' }}
            >
              {!mapLoaded && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading map...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {location.accuracy && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Accuracy:</span> ±{Math.round(location.accuracy)}m
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          ← Back: Herb Details
        </button>

        <button
          onClick={submitCollectionData}
          disabled={!location || loading}
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Collection Data →
        </button>
      </div>
    </div>
  )
}
