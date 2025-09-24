import { useState } from 'react'

export default function HerbDetailsStep({ herbData, setHerbData, setCurrentStep, onAIPrefillFromSMS }) {
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
