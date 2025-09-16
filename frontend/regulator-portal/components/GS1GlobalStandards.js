import React, { useState } from 'react';

const GS1GlobalStandards = ({ onStandardsComplete, batchData }) => {
  const [activeTab, setActiveTab] = useState('gtin');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [gtinInput, setGtinInput] = useState('');

  const validateStandards = async (type) => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockResult = {
        success: true,
        type: type,
        validation: {
          gtin: type === 'gtin' ? '01234567890123' : null,
          valid: true,
          checkDigit: type === 'gtin' ? 'Valid' : null,
          company: 'TRACE HERB Industries',
          product: batchData?.commonName || 'Ashwagandha Extract'
        },
        compliance: [
          { standard: 'GS1 General Specifications', status: 'Compliant', score: 98 },
          { standard: 'GTIN Allocation Rules', status: 'Compliant', score: 100 },
          { standard: 'Barcode Quality', status: 'Compliant', score: 95 },
          { standard: 'EPCIS Implementation', status: 'Compliant', score: 92 }
        ],
        recommendations: []
      };

      setResult(mockResult);
      
      if (onStandardsComplete) {
        onStandardsComplete(mockResult);
      }
    } catch (error) {
      console.error('Standards validation error:', error);
      setResult({
        success: false,
        error: 'Standards validation failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateGTIN = () => {
    // Generate a mock GTIN-13
    const companyPrefix = '123456';
    const itemReference = '78901';
    const partial = companyPrefix + itemReference;
    
    // Calculate check digit (simplified)
    let sum = 0;
    for (let i = 0; i < partial.length; i++) {
      const digit = parseInt(partial[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    const gtin = partial + checkDigit;
    setGtinInput(gtin);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2 text-blue-600">🌐</span>
            GS1 Global Standards
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Regulatory
            </span>
          </h2>
          <p className="text-gray-600 mt-1">
            Validate and implement GS1 global standards for product identification and traceability
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'gtin', label: 'GTIN Management', icon: '🏷️' },
          { id: 'barcode', label: 'Barcode Generation', icon: '📊' },
          { id: 'epcis', label: 'EPCIS Traceability', icon: '🔗' }
        ].map((tab) => {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
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
        {activeTab === 'gtin' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">GTIN Management & Validation</h3>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-800 mb-2">Product Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Product:</span>
                  <span className="ml-2">{batchData?.commonName || 'Ashwagandha Extract'}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Batch ID:</span>
                  <span className="ml-2">{batchData?.batchId || 'BATCH_001'}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Company:</span>
                  <span className="ml-2">TRACE HERB Industries</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">GCP:</span>
                  <span className="ml-2">123456</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GTIN-13 Number
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={gtinInput}
                    onChange={(e) => setGtinInput(e.target.value)}
                    placeholder="Enter GTIN or generate new"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    maxLength="13"
                  />
                  <button
                    onClick={generateGTIN}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <button
                onClick={() => validateStandards('gtin')}
                disabled={isProcessing || !gtinInput}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <span className="mr-2">🏷️</span>
                {isProcessing ? 'Validating GTIN...' : 'Validate GTIN Standards'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'barcode' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Barcode Generation & Quality</h3>
            
            <div className="space-y-4 mb-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Barcode Preview</h4>
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="font-mono text-xs mb-2">||||| || ||| |||| | ||| ||||</div>
                  <div className="text-sm text-gray-600">01234567890123</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800">Print Quality</div>
                  <div className="text-lg font-bold text-green-900">Grade A</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-800">Scan Rate</div>
                  <div className="text-lg font-bold text-blue-900">99.8%</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => validateStandards('barcode')}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">📊</span>
              {isProcessing ? 'Generating Barcode...' : 'Generate & Validate Barcode'}
            </button>
          </div>
        )}

        {activeTab === 'epcis' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">EPCIS Traceability Events</h3>
            
            <div className="space-y-3 mb-4">
              {[
                { event: 'Object Event', location: 'Farm Location', time: '2024-01-15 08:00', status: 'Recorded' },
                { event: 'Aggregation Event', location: 'Processing Facility', time: '2024-01-16 14:30', status: 'Recorded' },
                { event: 'Transformation Event', location: 'Manufacturing', time: '2024-01-17 10:15', status: 'Recorded' },
                { event: 'Transaction Event', location: 'Distribution', time: '2024-01-18 16:45', status: 'Pending' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-700">{item.event}</span>
                    <div className="text-sm text-gray-500">{item.location} • {item.time}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'Recorded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => validateStandards('epcis')}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">🔗</span>
              {isProcessing ? 'Validating EPCIS...' : 'Validate EPCIS Compliance'}
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
                <h4 className="font-semibold text-gray-800 mb-2">Standards Validation Results</h4>
                {result.success ? (
                  <div className="space-y-4">
                    {result.validation && (
                      <div className="bg-white rounded-lg p-3">
                        <h5 className="font-medium text-gray-800 mb-2">Validation Details:</h5>
                        <div className="space-y-1 text-sm">
                          {result.validation.gtin && (
                            <p><strong>GTIN:</strong> {result.validation.gtin}</p>
                          )}
                          <p><strong>Company:</strong> {result.validation.company}</p>
                          <p><strong>Product:</strong> {result.validation.product}</p>
                          {result.validation.checkDigit && (
                            <p><strong>Check Digit:</strong> {result.validation.checkDigit}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Compliance Status:</h5>
                      <div className="space-y-2">
                        {result.compliance.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                            <span className="text-sm">{item.standard}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-green-600">{item.score}%</span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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

export default GS1GlobalStandards;
