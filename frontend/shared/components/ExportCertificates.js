import React, { useState } from 'react';
import { 
  DocumentCheckIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  PrinterIcon,
  DownloadIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ExportCertificates = ({ mode = 'processor', onCertificateGenerated, batchData }) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState(['USA', 'EU']);

  const generateCertificate = async (type) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-export-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          mode,
          countries: selectedCountries,
          batchData,
          certificateData: getCertificateData(type)
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (onCertificateGenerated) {
        onCertificateGenerated(data);
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      setResult({
        success: false,
        error: 'Certificate generation failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCertificateData = (type) => {
    return {
      batchId: batchData?.batchId || 'BATCH_001',
      product: batchData?.commonName || 'Ashwagandha',
      quantity: batchData?.quantity || '100kg',
      quality: batchData?.quality || 'Grade A',
      origin: batchData?.location || 'Karnataka, India',
      processingDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  };

  const countries = [
    { code: 'USA', name: 'United States', flag: '🇺🇸' },
    { code: 'EU', name: 'European Union', flag: '🇪🇺' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
    { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
    { code: 'JPN', name: 'Japan', flag: '🇯🇵' }
  ];

  const certificateTypes = [
    {
      id: 'phytosanitary',
      name: 'Phytosanitary Certificate',
      description: 'Plant health certification for international trade',
      icon: ShieldCheckIcon,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'organic',
      name: 'Organic Certification',
      description: 'Certified organic product compliance',
      icon: CheckCircleIcon,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'quality',
      name: 'Quality Certificate',
      description: 'Product quality and purity certification',
      icon: DocumentCheckIcon,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'origin',
      name: 'Certificate of Origin',
      description: 'Product origin and authenticity verification',
      icon: GlobeAltIcon,
      color: 'bg-yellow-100 text-yellow-700'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <DocumentCheckIcon className="h-6 w-6 mr-2 text-blue-600" />
            Export Certificates
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {mode === 'processor' ? 'Processing' : 'Regulatory'}
            </span>
          </h2>
          <p className="text-gray-600 mt-1">
            Generate and manage international export certificates and compliance documents
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'generate', label: 'Generate', icon: DocumentCheckIcon },
          { id: 'manage', label: 'Manage', icon: ClockIcon },
          { id: 'download', label: 'Download', icon: DownloadIcon }
        ].map((tab) => {
          const Icon = tab.icon;
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
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'generate' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Generate Export Certificate</h3>
            
            {/* Country Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Destination Countries
              </label>
              <div className="grid grid-cols-2 gap-3">
                {countries.map((country) => (
                  <label key={country.code} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCountries([...selectedCountries, country.code]);
                        } else {
                          setSelectedCountries(selectedCountries.filter(c => c !== country.code));
                        }
                      }}
                      className="mr-3"
                    />
                    <span className="text-lg mr-2">{country.flag}</span>
                    <span className="text-sm font-medium text-gray-700">{country.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Certificate Types */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Certificate Types
              </label>
              <div className="grid grid-cols-1 gap-3">
                {certificateTypes.map((cert) => {
                  const Icon = cert.icon;
                  return (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${cert.color} mr-3`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{cert.name}</h4>
                            <p className="text-sm text-gray-600">{cert.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => generateCertificate(cert.id)}
                          disabled={isProcessing || selectedCountries.length === 0}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                        >
                          {isProcessing ? 'Generating...' : 'Generate'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Certificate Management</h3>
            <div className="space-y-3">
              {[
                { id: 'CERT_001', type: 'Phytosanitary', country: 'USA', status: 'Active', expiry: '2024-12-31' },
                { id: 'CERT_002', type: 'Organic', country: 'EU', status: 'Pending', expiry: '2024-11-15' },
                { id: 'CERT_003', type: 'Quality', country: 'UK', status: 'Active', expiry: '2025-01-20' }
              ].map((cert) => (
                <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{cert.id}</h4>
                      <p className="text-sm text-gray-600">{cert.type} - {cert.country}</p>
                      <p className="text-xs text-gray-500">Expires: {cert.expiry}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        cert.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cert.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800">
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'download' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Download Certificates</h3>
            <div className="text-center py-8">
              <DownloadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select certificates from the management tab to download</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircleIcon className="h-6 w-6 mr-3 mt-1 text-green-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Certificate Generated</h4>
                {result.success ? (
                  <div className="space-y-2">
                    <p><strong>Certificate ID:</strong> {result.certificateId}</p>
                    <p><strong>Type:</strong> {result.type}</p>
                    <p><strong>Countries:</strong> {result.countries?.join(', ')}</p>
                    <p><strong>Valid Until:</strong> {result.expiryDate}</p>
                    <div className="flex space-x-2 mt-3">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Download PDF
                      </button>
                      <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                        Print
                      </button>
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

export default ExportCertificates;
