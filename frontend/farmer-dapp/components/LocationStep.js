export default function LocationStep({ location, locationError, loading, getCurrentLocation, useDemoLocation, setCurrentStep, submitCollectionData }) {
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

            {location.placeName && (
              <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <div className="text-sm font-medium text-blue-800">📍 Location</div>
                <div className="text-sm text-blue-700">{location.placeName}</div>
                {location.village && (
                  <div className="text-xs text-blue-600 mt-1">
                    {location.village}, {location.district}, {location.state}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Latitude:</span>
                <span className="ml-2 text-gray-900">{location.latitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Longitude:</span>
                <span className="ml-2 text-gray-900">{location.longitude.toFixed(6)}</span>
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
