import React, { useState } from 'react';

const PlantSpeciesVerification = ({ mode = 'lab', onVerificationComplete, batchData }) => {
  const [activeTab, setActiveTab] = useState('visual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const verifySpecies = async (method) => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult = {
        success: true,
        species: batchData?.commonName || 'Withania somnifera',
        commonName: 'Ashwagandha',
        confidence: Math.floor(Math.random() * 20) + 80,
        method: method,
        characteristics: [
          'Oval-shaped leaves with smooth margins',
          'Small greenish-yellow flowers',
          'Orange-red berries when mature',
          'Distinctive root structure'
        ],
        dnaMatch: method === 'dna' ? '99.2%' : null,
        verified: true
      };

      setResult(mockResult);
      
      if (onVerificationComplete) {
        onVerificationComplete(mockResult);
      }
    } catch (error) {
      console.error('Species verification error:', error);
      setResult({
        success: false,
        error: 'Verification failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2 text-purple-600">🔬</span>
            Plant Species Verification
            <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
              {mode === 'lab' ? 'Laboratory' : 'Field'}
            </span>
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === 'lab' 
              ? 'Cross-reference and validate species identification from samples'
              : 'AI-powered species identification and verification'
            }
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'visual', label: 'Visual Analysis', icon: '👁️' },
          { id: 'dna', label: 'DNA Matching', icon: '🧬' },
          { id: 'morphology', label: 'Morphology', icon: '🌿' }
        ].map((tab) => {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'visual' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Visual Species Analysis</h3>
            
            {/* Image Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
              {uploadedImage ? (
                <div>
                  <img src={uploadedImage} alt="Uploaded plant" className="max-w-xs mx-auto mb-4 rounded" />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div>
                  <span className="text-4xl mb-4 block">📷</span>
                  <p className="text-gray-600 mb-4">Upload plant image for analysis</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                  >
                    Choose Image
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={() => verifySpecies('visual')}
              disabled={isProcessing || !uploadedImage}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">👁️</span>
              {isProcessing ? 'Analyzing Image...' : 'Analyze Visual Features'}
            </button>
          </div>
        )}

        {activeTab === 'dna' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">DNA Sequence Matching</h3>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-800 mb-2">Sample Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Sample ID:</span>
                  <span className="ml-2">{batchData?.batchId || 'LAB_001'}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Expected Species:</span>
                  <span className="ml-2">{batchData?.commonName || 'Ashwagandha'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => verifySpecies('dna')}
              disabled={isProcessing}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">🧬</span>
              {isProcessing ? 'Processing DNA...' : 'Run DNA Analysis'}
            </button>
          </div>
        )}

        {activeTab === 'morphology' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Morphological Analysis</h3>
            <div className="space-y-3 mb-4">
              {[
                { feature: 'Leaf Shape', value: 'Oval', status: 'Match' },
                { feature: 'Leaf Margin', value: 'Smooth', status: 'Match' },
                { feature: 'Flower Color', value: 'Greenish-yellow', status: 'Match' },
                { feature: 'Root Type', value: 'Tuberous', status: 'Match' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-700">{item.feature}</span>
                    <div className="text-sm text-gray-500">{item.value}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    item.status === 'Match' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => verifySpecies('morphology')}
              disabled={isProcessing}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">🌿</span>
              {isProcessing ? 'Analyzing Morphology...' : 'Verify Morphological Features'}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3 mt-1">
                {result.success ? '✅' : '❌'}
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Verification Results</h4>
                {result.success ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Species:</strong> <em>{result.species}</em></p>
                    <p><strong>Common Name:</strong> {result.commonName}</p>
                    <p><strong>Confidence:</strong> {result.confidence}%</p>
                    <p><strong>Method:</strong> {result.method}</p>
                    {result.dnaMatch && <p><strong>DNA Match:</strong> {result.dnaMatch}</p>}
                    <div className="mt-3">
                      <strong>Key Characteristics:</strong>
                      <ul className="list-disc list-inside mt-1 text-gray-600">
                        {result.characteristics.map((char, index) => (
                          <li key={index}>{char}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600 text-sm">{result.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantSpeciesVerification;
