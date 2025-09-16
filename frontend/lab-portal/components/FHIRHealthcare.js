import React, { useState } from 'react';

const FHIRHealthcare = ({ onComplianceComplete, batchData }) => {
  const [activeTab, setActiveTab] = useState('fhir');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const checkCompliance = async (standard) => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockResult = {
        success: true,
        standard: standard,
        overallScore: Math.floor(Math.random() * 20) + 80,
        compliance: [
          { category: 'Data Structure', score: 95, status: 'Compliant' },
          { category: 'Interoperability', score: 88, status: 'Compliant' },
          { category: 'Security', score: 92, status: 'Compliant' },
          { category: 'Documentation', score: 85, status: 'Compliant' }
        ],
        recommendations: [
          'Update patient consent forms to FHIR R4 standards',
          'Implement additional security protocols for data transmission'
        ]
      };

      setResult(mockResult);
      
      if (onComplianceComplete) {
        onComplianceComplete(mockResult);
      }
    } catch (error) {
      console.error('Compliance check error:', error);
      setResult({
        success: false,
        error: 'Compliance check failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2 text-red-600">❤️</span>
            FHIR Healthcare Compliance
            <span className="ml-2 text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
              Laboratory
            </span>
          </h2>
          <p className="text-gray-600 mt-1">
            Ensure laboratory compliance with healthcare standards and interoperability
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'fhir', label: 'FHIR R4', icon: '🏥' },
          { id: 'usp', label: 'USP Standards', icon: '💊' },
          { id: 'who', label: 'WHO Guidelines', icon: '🌍' }
        ].map((tab) => {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-red-600 shadow-sm'
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
        {activeTab === 'fhir' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">FHIR R4 Compliance Check</h3>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-800 mb-2">Current Implementation</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">FHIR Version:</span>
                  <span className="ml-2">R4 (4.0.1)</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Resources:</span>
                  <span className="ml-2">Patient, Observation, DiagnosticReport</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Endpoints:</span>
                  <span className="ml-2">REST API, GraphQL</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Security:</span>
                  <span className="ml-2">OAuth 2.0, SMART on FHIR</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => checkCompliance('FHIR R4')}
              disabled={isProcessing}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">🏥</span>
              {isProcessing ? 'Checking FHIR Compliance...' : 'Check FHIR R4 Compliance'}
            </button>
          </div>
        )}

        {activeTab === 'usp' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">USP Standards Compliance</h3>
            <div className="space-y-3 mb-4">
              {[
                { standard: 'USP <1058> Analytical Instrument Qualification', status: 'Compliant', score: 95 },
                { standard: 'USP <1225> Validation of Compendial Procedures', status: 'Compliant', score: 88 },
                { standard: 'USP <1226> Verification of Compendial Procedures', status: 'Compliant', score: 92 },
                { standard: 'USP <1010> Analytical Data - Interpretation', status: 'Review', score: 78 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 text-sm">{item.standard}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                      {item.score}%
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'Compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => checkCompliance('USP Standards')}
              disabled={isProcessing}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">💊</span>
              {isProcessing ? 'Checking USP Compliance...' : 'Check USP Standards'}
            </button>
          </div>
        )}

        {activeTab === 'who' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">WHO Guidelines Compliance</h3>
            <div className="space-y-3 mb-4">
              {[
                { guideline: 'Good Manufacturing Practices (GMP)', compliance: 'Full', score: 96 },
                { guideline: 'Quality Control of Medicinal Plants', compliance: 'Full', score: 94 },
                { guideline: 'Traditional Medicine Strategy', compliance: 'Partial', score: 82 },
                { guideline: 'Pharmacovigilance Guidelines', compliance: 'Full', score: 89 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 text-sm">{item.guideline}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                      {item.score}%
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.compliance === 'Full' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.compliance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => checkCompliance('WHO Guidelines')}
              disabled={isProcessing}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">🌍</span>
              {isProcessing ? 'Checking WHO Compliance...' : 'Check WHO Guidelines'}
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
                <h4 className="font-semibold text-gray-800 mb-2">Compliance Assessment</h4>
                {result.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Compliance Score:</span>
                      <span className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
                        {result.overallScore}%
                      </span>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Category Breakdown:</h5>
                      <div className="space-y-2">
                        {result.compliance.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                            <span className="text-sm">{item.category}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                                {item.score}%
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {result.recommendations && result.recommendations.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Recommendations:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {result.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
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

export default FHIRHealthcare;
