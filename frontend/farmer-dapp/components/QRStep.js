import { useState, useEffect } from 'react'
import { QrCodeIcon, CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

export default function QRStep({
  submissionResult,
  qrCodeDataURL,
  setCurrentStep,
  setCurrentView
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const startNewCollection = () => {
    setCurrentStep(1)
  }

  const goToDashboard = () => {
    setCurrentView('dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">✅ Collection Complete</h2>
        <p className="text-gray-600">Your herb collection has been successfully recorded</p>
      </div>

      {/* Success Message */}
      {submissionResult?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Collection Recorded Successfully!
              </h3>
              <p className="text-green-700 mb-4">
                {submissionResult.message}
              </p>
              
              {submissionResult.collectionId && (
                <div className="bg-white border border-green-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Collection ID:</span>
                      <div className="font-mono text-sm text-gray-900 mt-1">
                        {submissionResult.collectionId}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(submissionResult.collectionId)}
                      className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submissionResult && !submissionResult.success && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Submission Failed
              </h3>
              <p className="text-red-700">
                {submissionResult.error || 'An error occurred while submitting your collection data.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      {qrCodeDataURL && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <QrCodeIcon className="h-5 w-5 mr-2" />
            Collection QR Code
          </h3>
          
          <div className="text-center">
            <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg">
              <img 
                src={qrCodeDataURL} 
                alt="Collection QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Scan this QR code to view collection details
            </p>
          </div>
        </div>
      )}

      {/* Blockchain Transaction Info */}
      {submissionResult?.blockchainTxId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">🔗 Blockchain Transaction</h4>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-blue-700">Transaction ID:</span>
              <div className="font-mono text-xs text-blue-900 mt-1 break-all">
                {submissionResult.blockchainTxId}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(submissionResult.blockchainTxId)}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={startNewCollection}
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          🌿 Start New Collection
        </button>

        <button
          onClick={goToDashboard}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          📊 Go to Dashboard
        </button>
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">📋 What happens next?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Your collection data has been recorded on the blockchain</li>
          <li>• The QR code can be used to track this batch through the supply chain</li>
          <li>• Processors and consumers can verify the authenticity of your herbs</li>
          <li>• You can view all your collections in the dashboard</li>
        </ul>
      </div>
    </div>
  )
}
