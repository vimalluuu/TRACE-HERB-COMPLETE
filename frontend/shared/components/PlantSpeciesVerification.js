import React, { useState } from 'react';
import { 
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CameraIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const PlantSpeciesVerification = ({ mode = 'farmer', onVerificationComplete, batchData }) => {
  const [activeTab, setActiveTab] = useState('visual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const verifySpecies = async (method) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/verify-species', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method,
          species: batchData?.commonName || 'Ashwagandha',
          image: uploadedImage,
          mode,
          ...batchData
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (onVerificationComplete) {
        onVerificationComplete(data);
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

  const getResultColor = () => {
    if (result?.success && result?.confidence > 0.8) return 'text-green-600';
    if (result?.success && result?.confidence > 0.6) return 'text-yellow-600';
    if (result?.error) return 'text-red-600';
    return 'text-blue-600';
  };

  const getResultIcon = () => {
    if (result?.success && result?.confidence > 0.8) return CheckCircleIcon;
    if (result?.success && result?.confidence > 0.6) return InformationCircleIcon;
    if (result?.error) return XCircleIcon;
    return InformationCircleIcon;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <BeakerIcon className="h-6 w-6 mr-2 text-purple-600" />
            Plant Species Verification
            {mode === 'lab' && <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">Lab Mode</span>}
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === 'farmer' 
              ? 'AI-powered species identification and authenticity verification'
              : 'Cross-reference and validate species identification from samples'
            }
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'visual', label: 'Visual Analysis', icon: CameraIcon },
          { id: 'dna', label: 'DNA Matching', icon: BeakerIcon },
          { id: 'morphology', label: 'Morphology', icon: DocumentTextIcon }
        ].map((tab) => {
          const Icon = tab.icon;
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
              <Icon className="h-4 w-4 mr-2" />
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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Uploaded plant" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <div>
                    <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload plant image</p>
                  </div>
                )}
              </label>
            </div>

            <button
              onClick={() => verifySpecies('visual')}
              disabled={isProcessing || !uploadedImage}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <BeakerIcon className="h-5 w-5 mr-2" />
              {isProcessing ? 'Analyzing Image...' : 'Verify Species Visually'}
            </button>
          </div>
        )}

        {activeTab === 'dna' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">DNA Sequence Matching</h3>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                Compare genetic markers against authenticated reference database
              </p>
            </div>
            <button
              onClick={() => verifySpecies('dna')}
              disabled={isProcessing}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <BeakerIcon className="h-5 w-5 mr-2" />
              {isProcessing ? 'Processing DNA...' : 'Run DNA Analysis'}
            </button>
          </div>
        )}

        {activeTab === 'morphology' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Morphological Analysis</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leaf Shape</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Ovate</option>
                  <option>Lanceolate</option>
                  <option>Elliptic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flower Color</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>White</option>
                  <option>Yellow</option>
                  <option>Purple</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => verifySpecies('morphology')}
              disabled={isProcessing}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              {isProcessing ? 'Analyzing Morphology...' : 'Verify Morphological Features'}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              {React.createElement(getResultIcon(), {
                className: `h-6 w-6 mr-3 mt-1 ${getResultColor()}`
              })}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Verification Results</h4>
                {result.success ? (
                  <div className="space-y-2">
                    <p><strong>Species:</strong> {result.species}</p>
                    <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
                    <p><strong>Method:</strong> {result.method}</p>
                    {result.matches && (
                      <div>
                        <strong>Database Matches:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1">
                          {result.matches.map((match, index) => (
                            <li key={index}>{match}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600">{result.error}</p>
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
