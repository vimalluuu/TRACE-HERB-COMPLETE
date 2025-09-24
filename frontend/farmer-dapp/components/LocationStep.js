import { useEffect, useRef, useState } from 'react'

export default function LocationStep({ location, locationError, loading, getCurrentLocation, useDemoLocation, setCurrentStep, submitCollectionData }) {
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [leafletMap, setLeafletMap] = useState(null)

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
    if (!mapLoaded || !location || !window.L || !mapRef.current) return

    try {
      // If map already exists, update it
      if (leafletMap) {
        leafletMap.setView([location.latitude, location.longitude], 15)
        leafletMap.eachLayer((layer) => {
          if (layer instanceof window.L.Marker) {
            leafletMap.removeLayer(layer)
          }
        })

        // Add new marker
        const marker = window.L.marker([location.latitude, location.longitude])
          .addTo(leafletMap)
          .bindPopup(`
            <div style="text-align: center;">
              <strong>📍 Location Captured</strong><br/>
              <small>${location.placeName || 'Location detected'}</small><br/>
              <small>Lat: ${location.latitude.toFixed(6)}</small><br/>
              <small>Lng: ${location.longitude.toFixed(6)}</small>
            </div>
          `)
          .openPopup()

        return
      }

      // Create new map
      const map = window.L.map(mapRef.current, {
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

      // Add marker
      const marker = window.L.marker([location.latitude, location.longitude])
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center;">
            <strong>📍 Location Captured</strong><br/>
            <small>${location.placeName || 'Location detected'}</small><br/>
            <small>Lat: ${location.latitude.toFixed(6)}</small><br/>
            <small>Lng: ${location.longitude.toFixed(6)}</small>
          </div>
        `)
        .openPopup()

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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6">📍 GPS Location Capture</h3>

      {!location ? (
        <div>
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">
              Click the button below to capture your current GPS location with place information.
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

          <div className="mt-4">
            <button
              onClick={useDemoLocation}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Use Demo Location (for testing)
            </button>
            <p className="text-xs text-gray-500 mt-2">Tip: On mobile, precise GPS requires HTTPS. If you see a secure-origin error, use Demo Location or open the portal over HTTPS.</p>
          </div>
        </div>

      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-green-800 mb-4">✅ Location Captured Successfully!</h4>

            {/* Place/Area Name Display */}
            {location.placeName && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="text-lg font-semibold text-blue-800 mb-2">📍 Place/Area Name</div>
                <div className="text-base text-blue-700 font-medium">{location.placeName}</div>
                {location.village && (
                  <div className="text-sm text-blue-600 mt-2">
                    {location.village}, {location.district}, {location.state}
                  </div>
                )}
              </div>
            )}

            {/* Coordinates Display */}
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3">GPS Coordinates</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Latitude:</span>
                  <span className="ml-2 text-gray-900 font-mono">{location.latitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Longitude:</span>
                  <span className="ml-2 text-gray-900 font-mono">{location.longitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Accuracy:</span>
                  <span className="ml-2 text-gray-900">{Math.round(location.accuracy)} meters</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Timestamp:</span>
                  <span className="ml-2 text-gray-900">{new Date(location.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="mb-6">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">📍 Location on Map</h5>
            <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div
                ref={mapRef}
                style={{ height: '300px', width: '100%' }}
                className="bg-gray-100"
              >
                {!mapLoaded && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Interactive map showing your captured location with marker
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors mr-4"
            >
              📍 Update Location
            </button>
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
  )
}
