import React, { useState } from 'react';
import { 
  GlobeAltIcon,
  QrCodeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const GS1GlobalStandards = ({ onStandardsComplete, batchData }) => {
  const [activeTab, setActiveTab] = useState('gtin');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const validateStandard = async (standardType) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/gs1-standards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          standardType,
          batchData,
          productData: getProductData(),
          traceabilityData: getTraceabilityData()
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (onStandardsComplete) {
        onStandardsComplete(data);
      }
    } catch (error) {
      console.error('GS1 standards error:', error);
      setResult({
        success: false,
        error: 'Standards validation failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getProductData = () => {
    return {
      gtin: generateGTIN(),
      productName: batchData?.commonName || 'Ashwagandha',
      brand: 'TRACE HERB',
      manufacturer: 'Ayurvedic Processors Ltd',
      weight: batchData?.quantity || '100g',
      batchLot: batchData?.batchId || 'BATCH_001'
    };
  };

  const getTraceabilityData = () => {
    return {
      origin: batchData?.location || 'Karnataka, India',
      harvestDate: batchData?.collectionDate || new Date().toISOString().split('T')[0],
      processingDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  };

  const generateGTIN = () => {
    // Generate a sample GTIN-13
    return '8901234567890';
  };

  const gs1Standards = [
    {
      id: 'gtin',
      name: 'GTIN (Global Trade Item Number)',
      description: 'Unique product identification for global trade',
      icon: TagIcon,
      color: 'bg-blue-100 text-blue-700',
      requirements: ['Unique Identification', 'Global Recognition', 'Barcode Compatibility']
    },
    {
      id: 'gs1-128',
      name: 'GS1-128 Barcode',
      description: 'Advanced barcode with application identifiers',
      icon: QrCodeIcon,
      color: 'bg-green-100 text-green-700',
      requirements: ['Batch/Lot Numbers', 'Expiry Dates', 'Variable Data']
    },
    {
      id: 'epcis',
      name: 'EPCIS (Electronic Product Code Information Services)',
      description: 'Supply chain visibility and traceability standard',
      icon: GlobeAltIcon,
      color: 'bg-purple-100 text-purple-700',
      requirements: ['Event Capture', 'Supply Chain Visibility', 'Data Sharing']
    },
    {
      id: 'gdsn',
      name: 'GDSN (Global Data Synchronization Network)',
      description: 'Standardized product data exchange',
      icon: DocumentTextIcon,
      color: 'bg-yellow-100 text-yellow-700',
      requirements: ['Product Attributes', 'Data Quality', 'Global Synchronization']
    }
  ];

  const getValidationColor = (isValid) => {
    return isValid ? 'text-green-600' : 'text-red-600';
  };

  const getValidationIcon = (isValid) => {
    return isValid ? CheckCircleIcon : ExclamationTriangleIcon;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <GlobeAltIcon className="h-6 w-6 mr-2 text-blue-600" />
            GS1 Global Standards
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">Regulatory</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Validate and implement GS1 global standards for product identification and traceability
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'gtin', label: 'GTIN', icon: TagIcon },
          { id: 'barcode', label: 'Barcodes', icon: QrCodeIcon },
          { id: 'traceability', label: 'Traceability', icon: GlobeAltIcon },
          { id: 'validation', label: 'Validation', icon: ShieldCheckIcon }
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
        {activeTab === 'gtin' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">GTIN Management</h3>
            
            {/* Current Product Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-3">Product Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Product:</span>
                  <span className="font-medium">{batchData?.commonName || 'Ashwagandha'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Brand:</span>
                  <span className="font-medium">TRACE HERB</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className="font-medium">{batchData?.quantity || '100g'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Batch:</span>
                  <span className="font-medium">{batchData?.batchId || 'BATCH_001'}</span>
                </div>
              </div>
            </div>

            {/* GTIN Generation */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-800">Generated GTIN-13</h4>
                  <p className="text-sm text-gray-600">Global Trade Item Number for product identification</p>
                </div>
                <button
                  onClick={() => validateStandard('gtin')}
                  disabled={isProcessing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Validating...' : 'Validate GTIN'}
                </button>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 font-mono text-lg text-center">
                {generateGTIN()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'barcode' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Barcode Standards</h3>
            
            {/* Barcode Types */}
            <div className="space-y-4">
              {[
                { type: 'GS1-128', data: '(01)08901234567890(17)251231(10)BATCH001', description: 'Linear barcode with AI data' },
                { type: 'DataMatrix', data: '2D matrix code', description: '2D barcode for small items' },
                { type: 'QR Code', data: 'QR_DEMO_ASHWAGANDHA_001', description: 'Quick response code for mobile scanning' }
              ].map((barcode) => (
                <div key={barcode.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{barcode.type}</h4>
                    <button
                      onClick={() => validateStandard('barcode')}
                      disabled={isProcessing}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{barcode.description}</p>
                  <div className="bg-gray-100 rounded p-2 font-mono text-sm">
                    {barcode.data}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'traceability' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">EPCIS Traceability</h3>
            
            {/* Supply Chain Events */}
            <div className="space-y-3">
              {[
                { event: 'Harvest', location: 'Karnataka Farm', date: '2024-01-10', status: 'Completed' },
                { event: 'Processing', location: 'Processing Facility', date: '2024-01-15', status: 'Completed' },
                { event: 'Quality Testing', location: 'Lab Facility', date: '2024-01-18', status: 'In Progress' },
                { event: 'Packaging', location: 'Packaging Unit', date: '2024-01-20', status: 'Pending' }
              ].map((event, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{event.event}</h4>
                      <p className="text-sm text-gray-600">{event.location}</p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      event.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => validateStandard('epcis')}
              disabled={isProcessing}
              className="w-full mt-4 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Validating EPCIS...' : 'Validate Traceability Chain'}
            </button>
          </div>
        )}

        {activeTab === 'validation' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Standards Validation</h3>
            
            {/* Validation Results */}
            <div className="space-y-4">
              {gs1Standards.map((standard) => {
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
                        onClick={() => validateStandard(standard.id)}
                        disabled={isProcessing}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {isProcessing ? 'Validating...' : 'Validate'}
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

        {/* Results */}
        {result && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              {React.createElement(getValidationIcon(result.isValid), {
                className: `h-6 w-6 mr-3 mt-1 ${getValidationColor(result.isValid)}`
              })}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Validation Results</h4>
                {result.success ? (
                  <div className="space-y-2">
                    <p><strong>Standard:</strong> {result.standard}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        result.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.isValid ? 'Valid' : 'Invalid'}
                      </span>
                    </p>
                    {result.gtin && <p><strong>GTIN:</strong> {result.gtin}</p>}
                    {result.validationDetails && (
                      <div className="mt-3">
                        <strong>Details:</strong>
                        <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
                          {result.validationDetails.map((detail, index) => (
                            <li key={index}>{detail}</li>
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

export default GS1GlobalStandards;
