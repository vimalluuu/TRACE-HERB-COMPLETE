import React, { useState } from 'react';
import { 
  HeartIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const FHIRHealthcare = ({ onComplianceComplete, batchData }) => {
  const [activeTab, setActiveTab] = useState('compliance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const checkCompliance = async (standard) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/fhir-compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          standard,
          batchData,
          testResults: getTestResults(),
          healthcareStandards: getHealthcareStandards(standard)
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (onComplianceComplete) {
        onComplianceComplete(data);
      }
    } catch (error) {
      console.error('FHIR compliance error:', error);
      setResult({
        success: false,
        error: 'Compliance check failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTestResults = () => {
    return {
      moisture: batchData?.moisture || 8.5,
      pesticides: batchData?.pesticides || 'Not Detected',
      heavyMetals: batchData?.heavyMetals || 'Within Limits',
      microbial: batchData?.microbial || 'Acceptable',
      activeCompounds: batchData?.activeCompounds || 2.5,
      purity: batchData?.purity || 95
    };
  };

  const getHealthcareStandards = (standard) => {
    const standards = {
      fhir: {
        name: 'FHIR R4',
        requirements: ['Patient Safety', 'Data Interoperability', 'Quality Assurance'],
        version: '4.0.1'
      },
      usp: {
        name: 'USP Standards',
        requirements: ['Purity Testing', 'Identity Verification', 'Potency Analysis'],
        version: 'USP 44'
      },
      who: {
        name: 'WHO Guidelines',
        requirements: ['Good Manufacturing Practice', 'Quality Control', 'Safety Assessment'],
        version: 'WHO 2020'
      }
    };
    return standards[standard] || standards.fhir;
  };

  const complianceStandards = [
    {
      id: 'fhir',
      name: 'FHIR R4 Compliance',
      description: 'Fast Healthcare Interoperability Resources standard compliance',
      icon: HeartIcon,
      color: 'bg-red-100 text-red-700',
      requirements: ['Patient Safety Data', 'Interoperability', 'Quality Metrics']
    },
    {
      id: 'usp',
      name: 'USP Standards',
      description: 'United States Pharmacopeia compliance for herbal products',
      icon: ShieldCheckIcon,
      color: 'bg-blue-100 text-blue-700',
      requirements: ['Purity Standards', 'Identity Testing', 'Potency Requirements']
    },
    {
      id: 'who',
      name: 'WHO Guidelines',
      description: 'World Health Organization guidelines for herbal medicines',
      icon: DocumentTextIcon,
      color: 'bg-green-100 text-green-700',
      requirements: ['GMP Compliance', 'Quality Control', 'Safety Assessment']
    }
  ];

  const getComplianceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceIcon = (score) => {
    if (score >= 90) return CheckCircleIcon;
    if (score >= 70) return ExclamationTriangleIcon;
    return ExclamationTriangleIcon;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <HeartIcon className="h-6 w-6 mr-2 text-red-600" />
            FHIR Healthcare Compliance
            <span className="ml-2 text-sm bg-red-100 text-red-700 px-2 py-1 rounded">Lab Standards</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Ensure laboratory compliance with healthcare standards and interoperability requirements
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'compliance', label: 'Compliance Check', icon: ShieldCheckIcon },
          { id: 'reports', label: 'Reports', icon: DocumentTextIcon },
          { id: 'standards', label: 'Standards', icon: ClipboardDocumentListIcon }
        ].map((tab) => {
          const Icon = tab.icon;
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
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'compliance' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Healthcare Standards Compliance</h3>
            
            {/* Current Test Results */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-3">Current Test Results</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Moisture Content:</span>
                  <span className="font-medium">8.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Purity:</span>
                  <span className="font-medium">95%</span>
                </div>
                <div className="flex justify-between">
                  <span>Pesticides:</span>
                  <span className="font-medium">Not Detected</span>
                </div>
                <div className="flex justify-between">
                  <span>Heavy Metals:</span>
                  <span className="font-medium">Within Limits</span>
                </div>
              </div>
            </div>

            {/* Compliance Standards */}
            <div className="space-y-4">
              {complianceStandards.map((standard) => {
                const Icon = standard.icon;
                return (
                  <div key={standard.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${standard.color} mr-3`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{standard.name}</h4>
                          <p className="text-sm text-gray-600">{standard.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => checkCompliance(standard.id)}
                        disabled={isProcessing}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {isProcessing ? 'Checking...' : 'Check Compliance'}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Requirements:</strong> {standard.requirements.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Compliance Reports</h3>
            <div className="space-y-3">
              {[
                { id: 'RPT_001', standard: 'FHIR R4', score: 95, date: '2024-01-15', status: 'Compliant' },
                { id: 'RPT_002', standard: 'USP Standards', score: 88, date: '2024-01-14', status: 'Compliant' },
                { id: 'RPT_003', standard: 'WHO Guidelines', score: 92, date: '2024-01-13', status: 'Compliant' }
              ].map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{report.id}</h4>
                      <p className="text-sm text-gray-600">{report.standard}</p>
                      <p className="text-xs text-gray-500">Generated: {report.date}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getComplianceColor(report.score)}`}>
                        {report.score}%
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        report.status === 'Compliant' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'standards' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Healthcare Standards Reference</h3>
            <div className="space-y-4">
              {complianceStandards.map((standard) => {
                const Icon = standard.icon;
                return (
                  <div key={standard.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg ${standard.color} mr-3 mt-1`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-2">{standard.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{standard.description}</p>
                        <div className="text-xs text-gray-500">
                          <strong>Key Requirements:</strong>
                          <ul className="list-disc list-inside mt-1 ml-2">
                            {standard.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              {React.createElement(getComplianceIcon(result.complianceScore || 0), {
                className: `h-6 w-6 mr-3 mt-1 ${getComplianceColor(result.complianceScore || 0)}`
              })}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Compliance Results</h4>
                {result.success ? (
                  <div className="space-y-2">
                    <p><strong>Standard:</strong> {result.standard}</p>
                    <p><strong>Compliance Score:</strong> 
                      <span className={`ml-1 font-bold ${getComplianceColor(result.complianceScore)}`}>
                        {result.complianceScore}%
                      </span>
                    </p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        result.complianceScore >= 90 ? 'bg-green-100 text-green-800' : 
                        result.complianceScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.complianceScore >= 90 ? 'Fully Compliant' : 
                         result.complianceScore >= 70 ? 'Partially Compliant' : 'Non-Compliant'}
                      </span>
                    </p>
                    {result.recommendations && (
                      <div className="mt-3">
                        <strong>Recommendations:</strong>
                        <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
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
