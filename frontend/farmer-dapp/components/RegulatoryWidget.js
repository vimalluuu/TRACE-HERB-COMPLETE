import React, { useState } from 'react';
import { 
  DocumentCheckIcon,
  GlobeAltIcon,
  ClipboardDocumentCheckIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  IdentificationIcon,
  BanknotesIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const RegulatoryWidget = ({ onRegulatoryComplete, batchData, farmerId }) => {
  const [activeTab, setActiveTab] = useState('gs1'); // 'gs1', 'fhir', 'export'
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  // Mock organization data
  const mockOrganizationData = {
    name: 'TRACE HERB Farmers Cooperative',
    address: 'Hubli Agricultural Zone, Karnataka, India',
    license: 'AYUSH/EXP/2024/001',
    phone: '+91-8123456789',
    email: 'info@traceherb.com'
  };

  // Generate GS1 Compliance
  const generateGS1Compliance = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-gs1-compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productData: {
            commonName: batchData?.commonName || 'Ashwagandha',
            scientificName: batchData?.scientificName || 'Withania somnifera',
            quantity: batchData?.quantity || '5',
            category: 'Herbal Medicine'
          },
          batchId: `BATCH_${Date.now()}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onRegulatoryComplete) {
          onRegulatoryComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'GS1 compliance generation failed');
      }

    } catch (error) {
      console.error('GS1 Compliance Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate FHIR Compliance
  const generateFHIRCompliance = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-fhir-compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          herbData: {
            commonName: batchData?.commonName || 'Ashwagandha',
            scientificName: batchData?.scientificName || 'Withania somnifera',
            category: 'Traditional Medicine',
            indication: 'Stress relief and vitality enhancement'
          },
          organizationData: mockOrganizationData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onRegulatoryComplete) {
          onRegulatoryComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'FHIR compliance generation failed');
      }

    } catch (error) {
      console.error('FHIR Compliance Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Export Certificates
  const generateExportCertificates = async (destinationCountry) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const certificateMap = {
        'USA': ['Certificate of Analysis', 'Health Certificate'],
        'EU': ['Phytosanitary Certificate', 'Health Certificate'],
        'Germany': ['Phytosanitary Certificate', 'Health Certificate'],
        'India': ['Ayurvedic Pharmacopoeia Compliance'],
        'WHO': ['Certificate of Analysis', 'Health Certificate']
      };

      const requiredCertificates = certificateMap[destinationCountry] || ['Certificate of Analysis'];

      const response = await fetch('http://localhost:3000/api/ai/generate-export-certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productData: {
            commonName: batchData?.commonName || 'Ashwagandha',
            scientificName: batchData?.scientificName || 'Withania somnifera',
            quantity: batchData?.quantity || '5',
            farmerName: batchData?.farmerName || 'Rajesh Kumar'
          },
          destinationCountry,
          requiredCertificates
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onRegulatoryComplete) {
          onRegulatoryComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'Export certificate generation failed');
      }

    } catch (error) {
      console.error('Export Certificate Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getResultIcon = () => {
    if (result?.success && activeTab === 'gs1') return QrCodeIcon;
    if (result?.success && activeTab === 'fhir') return CpuChipIcon;
    if (result?.success && activeTab === 'export') return DocumentCheckIcon;
    if (result?.error) return ExclamationTriangleIcon;
    return InformationCircleIcon;
  };

  const getResultColor = () => {
    if (result?.success) return 'text-green-600';
    if (result?.error) return 'text-red-600';
    return 'text-blue-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <DocumentCheckIcon className="h-6 w-6 mr-2 text-blue-600" />
            Regulatory & Export Ready
          </h2>
          <p className="text-gray-600 mt-1">
            GS1/FHIR compliance and automated export certificate generation
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'gs1', label: 'GS1 Standards', icon: QrCodeIcon },
          { id: 'fhir', label: 'FHIR Healthcare', icon: CpuChipIcon },
          { id: 'export', label: 'Export Certificates', icon: TruckIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResult(null);
              }}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
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

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'gs1' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📊 GS1 Global Standards</h3>
              <p className="text-blue-700 text-sm mb-3">
                Generate GS1-compliant GTIN, barcodes, and DataMatrix codes for global supply chain integration. 
                Ensures worldwide product identification and traceability.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <QrCodeIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span>GTIN Generation</span>
                </div>
                <div className="flex items-center">
                  <IdentificationIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span>GS1-128 Barcodes</span>
                </div>
              </div>
            </div>

            {/* GS1 Features */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">🏷️ GS1 Compliance Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { 
                    feature: 'GTIN (Global Trade Item Number)', 
                    description: '14-digit unique product identifier',
                    icon: IdentificationIcon,
                    color: 'bg-blue-100 text-blue-700'
                  },
                  { 
                    feature: 'GS1-128 Barcode', 
                    description: 'Batch, expiry, and production date encoding',
                    icon: QrCodeIcon,
                    color: 'bg-green-100 text-green-700'
                  },
                  { 
                    feature: 'DataMatrix Code', 
                    description: '2D barcode for high-density data',
                    icon: CpuChipIcon,
                    color: 'bg-purple-100 text-purple-700'
                  },
                  { 
                    feature: 'Application Identifiers', 
                    description: 'Standardized data element encoding',
                    icon: DocumentTextIcon,
                    color: 'bg-yellow-100 text-yellow-700'
                  }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className={`p-2 rounded-lg ${item.color} mr-3`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">{item.feature}</h5>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={generateGS1Compliance}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <QrCodeIcon className="h-5 w-5 mr-2" />
                {isProcessing ? 'Generating GS1 Compliance...' : 'Generate GS1 Standards'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'fhir' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">🏥 FHIR Healthcare Standards</h3>
              <p className="text-green-700 text-sm mb-3">
                Generate FHIR R4-compliant healthcare data for interoperability with global health systems. 
                Enables integration with hospitals, pharmacies, and health authorities.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <CpuChipIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>FHIR R4 Resources</span>
                </div>
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>Healthcare Interoperability</span>
                </div>
              </div>
            </div>

            {/* FHIR Resources */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">📋 FHIR Resource Types</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { 
                    resource: 'Medication', 
                    description: 'Herbal medicine definition and properties',
                    icon: DocumentTextIcon,
                    color: 'bg-green-100 text-green-700'
                  },
                  { 
                    resource: 'MedicationKnowledge', 
                    description: 'Usage guidelines and indications',
                    icon: InformationCircleIcon,
                    color: 'bg-blue-100 text-blue-700'
                  },
                  { 
                    resource: 'Substance', 
                    description: 'Active ingredient composition',
                    icon: CpuChipIcon,
                    color: 'bg-purple-100 text-purple-700'
                  },
                  { 
                    resource: 'Organization', 
                    description: 'Farmer cooperative details',
                    icon: BuildingOfficeIcon,
                    color: 'bg-yellow-100 text-yellow-700'
                  },
                  { 
                    resource: 'Location', 
                    description: 'Farm and processing locations',
                    icon: GlobeAltIcon,
                    color: 'bg-red-100 text-red-700'
                  },
                  { 
                    resource: 'Provenance', 
                    description: 'Supply chain history and traceability',
                    icon: DocumentCheckIcon,
                    color: 'bg-indigo-100 text-indigo-700'
                  }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className={`p-2 rounded-lg ${item.color} mr-3`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">{item.resource}</h5>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={generateFHIRCompliance}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <CpuChipIcon className="h-5 w-5 mr-2" />
                {isProcessing ? 'Generating FHIR Resources...' : 'Generate FHIR Compliance'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">🌍 Export Certificate Generation</h3>
              <p className="text-purple-700 text-sm mb-3">
                Automated generation of export certificates for global markets. 
                Supports FDA, EU, AYUSH, and WHO compliance standards.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <TruckIcon className="h-4 w-4 text-purple-600 mr-2" />
                  <span>Global Export Ready</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 text-purple-600 mr-2" />
                  <span>Regulatory Compliance</span>
                </div>
              </div>
            </div>

            {/* Export Destinations */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">🎯 Export Destinations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { 
                    country: 'USA', 
                    standards: ['FDA Registration', 'DUNS Number'],
                    certificates: ['Certificate of Analysis', 'Health Certificate'],
                    icon: TruckIcon,
                    color: 'bg-blue-100 text-blue-700'
                  },
                  { 
                    country: 'EU', 
                    standards: ['EORI Number', 'CE Marking'],
                    certificates: ['Phytosanitary Certificate', 'Health Certificate'],
                    icon: GlobeAltIcon,
                    color: 'bg-green-100 text-green-700'
                  },
                  { 
                    country: 'Germany', 
                    standards: ['EU Standards', 'REACH Compliance'],
                    certificates: ['Phytosanitary Certificate', 'Health Certificate'],
                    icon: DocumentCheckIcon,
                    color: 'bg-yellow-100 text-yellow-700'
                  },
                  { 
                    country: 'WHO', 
                    standards: ['WHO GMP', 'Quality Assurance'],
                    certificates: ['WHO Certificate', 'Certificate of Analysis'],
                    icon: ShieldCheckIcon,
                    color: 'bg-purple-100 text-purple-700'
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.country} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${item.color} mr-3`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800">{item.country}</h5>
                            <p className="text-sm text-gray-600">
                              {item.certificates.length} certificates required
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">Standards:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.standards.map((standard, index) => (
                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {standard}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => generateExportCertificates(item.country)}
                        disabled={isProcessing}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {isProcessing ? 'Generating...' : `Generate ${item.country} Certificates`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export Benefits */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">✨ Export Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>• Automated certificate generation</div>
                <div>• Digital signatures and QR verification</div>
                <div>• Multi-country compliance support</div>
                <div>• Real-time validation and updates</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start">
            {React.createElement(getResultIcon(), {
              className: `h-6 w-6 mr-3 mt-1 ${getResultColor()}`
            })}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-2">
                {result.success ? 'Regulatory Compliance Generated!' : 'Generation Failed'}
              </h4>
              
              {result.success ? (
                <div className="space-y-2 text-sm text-gray-600">
                  {activeTab === 'gs1' && result.gtin && (
                    <>
                      <p><strong>GS1 ID:</strong> {result.gs1Id}</p>
                      <p><strong>GTIN:</strong> {result.gtin}</p>
                      <p><strong>Compliance Level:</strong> {result.complianceReport?.complianceLevel}</p>
                      <p><strong>Standards:</strong> {result.standards ? Object.keys(result.standards).filter(k => result.standards[k]).join(', ') : 'N/A'}</p>
                    </>
                  )}
                  {activeTab === 'fhir' && result.fhirId && (
                    <>
                      <p><strong>FHIR Bundle ID:</strong> {result.fhirId}</p>
                      <p><strong>FHIR Version:</strong> {result.compliance?.fhirVersion}</p>
                      <p><strong>Resources Created:</strong> {result.compliance?.resourceCount}</p>
                      <p><strong>Validation Status:</strong> {result.compliance?.validationStatus}</p>
                    </>
                  )}
                  {activeTab === 'export' && result.exportId && (
                    <>
                      <p><strong>Export ID:</strong> {result.exportId}</p>
                      <p><strong>Destination:</strong> {result.destinationCountry}</p>
                      <p><strong>Certificates Generated:</strong> {result.certificates?.length}</p>
                      <p><strong>Compliance Score:</strong> {result.complianceScore}%</p>
                      <p><strong>Status:</strong> {result.complianceStatus}</p>
                      <p><strong>Validity:</strong> {result.validityPeriod}</p>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-600">{result.error}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryWidget;
