import React, { useState } from 'react';

const AnomalyDetection = ({ mode = 'lab', onDetectionComplete, batchData }) => {
  const [activeTab, setActiveTab] = useState('contamination');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const detectAnomalies = async (type) => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        success: true,
        anomalies: type === 'contamination' ? [
          {
            parameter: 'Heavy Metals',
            severity: 'low',
            description: 'Trace amounts of lead detected, within acceptable limits',
            expected: '< 0.1 ppm',
            actual: '0.08 ppm'
          }
        ] : [],
        analysisTime: Math.floor(Math.random() * 1000) + 500
      };

      setResult(mockResult);
      
      if (onDetectionComplete) {
        onDetectionComplete(mockResult);
      }
    } catch (error) {
      console.error('Anomaly detection error:', error);
      setResult({
        success: false,
        error: 'Detection failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2 text-orange-600">⚠️</span>
            Lab Testing Anomalies
            <span className="ml-2 text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded">
              Laboratory
            </span>
          </h2>
          <p className="text-gray-600 mt-1">
            Identify anomalies in laboratory test results and sample analysis
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'contamination', label: 'Contamination', icon: '🧪' },
          { id: 'purity', label: 'Purity', icon: '💎' },
          { id: 'potency', label: 'Potency', icon: '⚡' }
        ].map((tab) => {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-orange-600 shadow-sm'
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
        {activeTab === 'contamination' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Contamination Analysis</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Pesticides</span>
                  <span className="text-lg font-bold text-green-900">Clear</span>
                </div>
                <div className="text-xs text-green-600 mt-1">No residues detected</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Heavy Metals</span>
                  <span className="text-lg font-bold text-blue-900">0.08 ppm</span>
                </div>
                <div className="text-xs text-blue-600 mt-1">Within limits: &lt; 0.1 ppm</div>
              </div>
            </div>
            <button
              onClick={() => detectAnomalies('contamination')}
              disabled={isProcessing}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">🧪</span>
              {isProcessing ? 'Analyzing Contamination...' : 'Detect Contamination Anomalies'}
            </button>
          </div>
        )}

        {activeTab === 'purity' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Purity Assessment</h3>
            <div className="space-y-3 mb-4">
              {[
                { compound: 'Withanolides', purity: '3.2%', status: 'Good', target: '≥ 2.5%' },
                { compound: 'Alkaloids', purity: '0.8%', status: 'Good', target: '≤ 1.0%' },
                { compound: 'Moisture', purity: '8.5%', status: 'Good', target: '≤ 10%' },
                { compound: 'Ash Content', purity: '4.2%', status: 'Good', target: '≤ 5%' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-700">{item.compound}</span>
                    <div className="text-sm text-gray-500">Target: {item.target}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{item.purity}</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => detectAnomalies('purity')}
              disabled={isProcessing}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">💎</span>
              {isProcessing ? 'Analyzing Purity...' : 'Detect Purity Anomalies'}
            </button>
          </div>
        )}

        {activeTab === 'potency' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Potency Analysis</h3>
            <div className="space-y-3 mb-4">
              {[
                { test: 'Bioactivity Assay', result: '95%', status: 'Excellent', range: '≥ 80%' },
                { test: 'Active Compounds', result: '3.2%', status: 'Good', range: '2.5-4.0%' },
                { test: 'Antioxidant Activity', result: '87%', status: 'Good', range: '≥ 70%' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-700">{item.test}</span>
                    <div className="text-sm text-gray-500">Range: {item.range}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{item.result}</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                      item.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => detectAnomalies('potency')}
              disabled={isProcessing}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">⚡</span>
              {isProcessing ? 'Analyzing Potency...' : 'Detect Potency Anomalies'}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3 mt-1">
                {result.success ? (result.anomalies?.length === 0 ? '✅' : '⚠️') : '❌'}
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Detection Results</h4>
                {result.success ? (
                  <div className="space-y-3">
                    {result.anomalies?.length === 0 ? (
                      <p className="text-green-600">No anomalies detected. All parameters within normal ranges.</p>
                    ) : (
                      <div>
                        <p className="text-gray-700 mb-3">
                          Found {result.anomalies.length} anomal{result.anomalies.length === 1 ? 'y' : 'ies'}:
                        </p>
                        <div className="space-y-2">
                          {result.anomalies.map((anomaly, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-800">{anomaly.parameter}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                                  {anomaly.severity.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{anomaly.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Expected: {anomaly.expected} | Actual: {anomaly.actual}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Analysis Time:</strong> {result.analysisTime}ms
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

export default AnomalyDetection;
