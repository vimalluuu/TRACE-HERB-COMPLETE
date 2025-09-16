import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  ClockIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const AnomalyDetection = ({ mode = 'processor', onDetectionComplete, batchData }) => {
  const [activeTab, setActiveTab] = useState('processing');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const detectAnomalies = async (type) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/detect-anomalies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          mode,
          batchData,
          parameters: getParametersForType(type)
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (onDetectionComplete) {
        onDetectionComplete(data);
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

  const getParametersForType = (type) => {
    switch (type) {
      case 'processing':
        return {
          temperature: batchData?.temperature || 60,
          humidity: batchData?.humidity || 45,
          duration: batchData?.duration || 24,
          yield: batchData?.yield || 85
        };
      case 'testing':
        return {
          moisture: batchData?.moisture || 8.5,
          purity: batchData?.purity || 95,
          contamination: batchData?.contamination || 'None',
          activeCompounds: batchData?.activeCompounds || 2.5
        };
      case 'quality':
        return {
          color: batchData?.color || 'Good',
          texture: batchData?.texture || 'Good',
          aroma: batchData?.aroma || 'Good',
          packaging: batchData?.packaging || 'Sealed'
        };
      default:
        return {};
    }
  };

  const getResultColor = () => {
    if (result?.anomalies?.length === 0) return 'text-green-600';
    if (result?.anomalies?.some(a => a.severity === 'high')) return 'text-red-600';
    if (result?.anomalies?.some(a => a.severity === 'medium')) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getResultIcon = () => {
    if (result?.anomalies?.length === 0) return CheckCircleIcon;
    if (result?.anomalies?.some(a => a.severity === 'high')) return XCircleIcon;
    if (result?.anomalies?.some(a => a.severity === 'medium')) return ExclamationTriangleIcon;
    return InformationCircleIcon;
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
            <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-orange-600" />
            Anomaly Detection
            <span className="ml-2 text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded">
              {mode === 'processor' ? 'Processing' : 'Lab Testing'}
            </span>
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === 'processor' 
              ? 'Detect irregularities in processing parameters and quality metrics'
              : 'Identify anomalies in laboratory test results and sample analysis'
            }
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {mode === 'processor' ? [
          { id: 'processing', label: 'Processing', icon: ChartBarIcon },
          { id: 'quality', label: 'Quality', icon: CheckCircleIcon },
          { id: 'timeline', label: 'Timeline', icon: ClockIcon }
        ] : [
          { id: 'testing', label: 'Test Results', icon: BeakerIcon },
          { id: 'quality', label: 'Sample Quality', icon: CheckCircleIcon },
          { id: 'contamination', label: 'Contamination', icon: ExclamationTriangleIcon }
        ]}.map((tab) => {
          const Icon = tab.icon;
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
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'processing' && mode === 'processor' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Processing Parameter Analysis</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Temperature</span>
                  <span className="text-lg font-bold text-blue-900">60°C</span>
                </div>
                <div className="text-xs text-blue-600 mt-1">Normal Range: 55-65°C</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Humidity</span>
                  <span className="text-lg font-bold text-green-900">45%</span>
                </div>
                <div className="text-xs text-green-600 mt-1">Normal Range: 40-50%</div>
              </div>
            </div>
            <button
              onClick={() => detectAnomalies('processing')}
              disabled={isProcessing}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              {isProcessing ? 'Analyzing Parameters...' : 'Detect Processing Anomalies'}
            </button>
          </div>
        )}

        {activeTab === 'testing' && mode === 'lab' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Laboratory Test Analysis</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-800">Moisture Content</span>
                  <span className="text-lg font-bold text-purple-900">8.5%</span>
                </div>
                <div className="text-xs text-purple-600 mt-1">Standard: ≤10%</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-800">Purity</span>
                  <span className="text-lg font-bold text-indigo-900">95%</span>
                </div>
                <div className="text-xs text-indigo-600 mt-1">Standard: ≥90%</div>
              </div>
            </div>
            <button
              onClick={() => detectAnomalies('testing')}
              disabled={isProcessing}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <BeakerIcon className="h-5 w-5 mr-2" />
              {isProcessing ? 'Analyzing Test Results...' : 'Detect Testing Anomalies'}
            </button>
          </div>
        )}

        {activeTab === 'quality' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Quality Assessment</h3>
            <div className="space-y-3 mb-4">
              {['Color', 'Texture', 'Aroma', 'Packaging'].map((param) => (
                <div key={param} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{param}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Good</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => detectAnomalies('quality')}
              disabled={isProcessing}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {isProcessing ? 'Analyzing Quality...' : 'Detect Quality Anomalies'}
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
