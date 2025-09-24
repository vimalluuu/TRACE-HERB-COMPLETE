// Collection workflow steps for the farmer portal
import { useState } from 'react'

export const HerbDetailsStep = ({ herbData, setHerbData, setCurrentStep, onAIPrefillFromSMS }) => {
  const [smsText, setSmsText] = useState('')
  return (
  <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Season *</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={herbData.season}
          onChange={(e) => setHerbData({...herbData, season: e.target.value})}
        >
          <option value="">Select season</option>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
          <option value="monsoon">Monsoon</option>
          <option value="autumn">Autumn</option>
          <option value="winter">Winter</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows="3"
          value={herbData.notes}
          onChange={(e) => setHerbData({...herbData, notes: e.target.value})}
          placeholder="Any additional information about the collection..."
        />
      </div>
    </div>

    {/* AI Assist section */}
    <div className="mt-6 border-t pt-6">
      <h4 className="font-semibold text-gray-900 mb-2">🤖 AI Assist (optional)</h4>
      <p className="text-sm text-gray-600 mb-3">Paste an SMS/text describing the collection and let AI prefill details.</p>
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        rows="2"
        value={smsText}
        onChange={(e) => setSmsText(e.target.value)}
        placeholder="e.g., Collected 12 kg Ashwagandha roots from Udupi, Karnataka"
      />
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => onAIPrefillFromSMS && onAIPrefillFromSMS(smsText)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Use AI to Prefill
        </button>
        <button
          onClick={() => setSmsText('')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
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
        disabled={!herbData.botanicalName || !herbData.commonName || !herbData.partUsed || !herbData.quantity || !herbData.collectionMethod || !herbData.season}
        className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next: Location
      </button>
    </div>


  </div>
)
}

export const LocationStep = ({ location, locationError, loading, getCurrentLocation, useDemoLocation, setCurrentStep, submitCollectionData }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
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

export const QRStep = ({ submissionResult, qrCodeUrl, resetForm, setCurrentView }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
    <h3 className="text-xl font-bold text-gray-900 mb-6">🎉 Collection Complete!</h3>

    {submissionResult && (
      <div className={`border rounded-lg p-6 mb-6 ${
        submissionResult.success
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <h4 className={`font-semibold mb-2 ${
          submissionResult.success ? 'text-green-800' : 'text-red-800'
        }`}>
          {submissionResult.success ? '✅ Success!' : '❌ Error'}
        </h4>
        <p className={submissionResult.success ? 'text-green-700' : 'text-red-700'}>
          {submissionResult.message}
        </p>
        {submissionResult.collectionId && (
          <p className="text-green-600 font-mono text-sm mt-2">
            Collection ID: {submissionResult.collectionId}
          </p>
        )}
      </div>
    )}

    {qrCodeUrl && (
      <div className="text-center mb-6">
        <h4 className="font-semibold text-gray-800 mb-4">QR Code for Collection</h4>
        <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
          <img src={qrCodeUrl} alt="Collection QR Code" className="w-48 h-48 mx-auto" />
        </div>
        <p className="text-gray-600 text-sm mt-4">
          Scan this QR code to view collection details on the blockchain
        </p>
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
)
