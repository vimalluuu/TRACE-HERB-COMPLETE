export default function QRStep({ submissionResult, qrCodeDataURL, setCurrentStep, resetForm }) {
  return (
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

      {qrCodeDataURL && (
        <div className="text-center mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">QR Code for Collection</h4>
          <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
            <img src={qrCodeDataURL} alt="Collection QR Code" className="w-48 h-48 mx-auto" />
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
          onClick={() => setCurrentStep(1)}
          className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
