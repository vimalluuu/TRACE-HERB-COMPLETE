import { useState } from 'react'
import { BeakerIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export default function HerbDetailsStep({
  herbData,
  setHerbData,
  setCurrentStep,
  onAIPrefillFromSMS
}) {
  const [smsMessage, setSmsMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const handleAIPrefill = async () => {
    if (!smsMessage.trim()) return
    setAiLoading(true)
    try {
      await onAIPrefillFromSMS(smsMessage)
    } finally {
      setAiLoading(false)
    }
  }

  const isFormValid = herbData.commonName && herbData.quantity && herbData.unit

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🌿 Herb Details</h2>
        <p className="text-gray-600">Enter details about the herbs you're collecting</p>
      </div>

      {/* AI SMS Prefill Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
          AI Quick Fill (Optional)
        </h3>
        <p className="text-blue-700 text-sm mb-3">
          Enter a message like: "Collected 5kg Grade A Ashwagandha from my farm"
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={smsMessage}
            onChange={(e) => setSmsMessage(e.target.value)}
            placeholder="e.g., Collected 5kg Grade A Ashwagandha..."
            className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAIPrefill}
            disabled={!smsMessage.trim() || aiLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? 'Processing...' : 'AI Fill'}
          </button>
        </div>
      </div>

      {/* Herb Details Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <BeakerIcon className="h-5 w-5 mr-2" />
          Herb Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Common Name *
            </label>
            <select
              value={herbData.commonName || ''}
              onChange={(e) => setHerbData(prev => ({ ...prev, commonName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select herb...</option>
              <option value="Ashwagandha">Ashwagandha</option>
              <option value="Turmeric">Turmeric</option>
              <option value="Brahmi">Brahmi</option>
              <option value="Shankhpushpi">Shankhpushpi</option>
              <option value="Safed Musli">Safed Musli</option>
              <option value="Shatavari">Shatavari</option>
              <option value="Neem">Neem</option>
              <option value="Tulsi">Tulsi</option>
              <option value="Amla">Amla</option>
              <option value="Giloy">Giloy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Botanical Name
            </label>
            <input
              type="text"
              value={herbData.botanicalName || ''}
              onChange={(e) => setHerbData(prev => ({ ...prev, botanicalName: e.target.value }))}
              placeholder="e.g., Withania somnifera"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={herbData.quantity || ''}
              onChange={(e) => setHerbData(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="e.g., 5.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit *
            </label>
            <select
              value={herbData.unit || ''}
              onChange={(e) => setHerbData(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select unit...</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="g">Grams (g)</option>
              <option value="tons">Tons</option>
              <option value="bundles">Bundles</option>
              <option value="pieces">Pieces</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Grade
            </label>
            <select
              value={herbData.qualityGrade || ''}
              onChange={(e) => setHerbData(prev => ({ ...prev, qualityGrade: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select grade...</option>
              <option value="A">Grade A - Premium</option>
              <option value="B">Grade B - Standard</option>
              <option value="C">Grade C - Basic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harvest Method
            </label>
            <select
              value={herbData.harvestMethod || ''}
              onChange={(e) => setHerbData(prev => ({ ...prev, harvestMethod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select method...</option>
              <option value="Hand-picked">Hand-picked</option>
              <option value="Machine harvested">Machine harvested</option>
              <option value="Traditional tools">Traditional tools</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={herbData.notes || ''}
            onChange={(e) => setHerbData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional information about the herbs..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          ← Back: Farmer Info
        </button>

        <button
          onClick={() => setCurrentStep(3)}
          disabled={!isFormValid}
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Location →
        </button>
      </div>
    </div>
  )
}
