import React, { useState } from 'react';

const ExportCertificates = ({ mode = 'regulatory', onCertificateGenerated, batchData }) => {
  const [activeTab, setActiveTab] = useState('validate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [certificateId, setCertificateId] = useState('');

  const validateCertificate = async (action) => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockResult = {
        success: true,
        action: action,
        certificateId: certificateId || `CERT_${Date.now()}`,
        validation: {
          valid: true,
          issuer: 'TRACE HERB Regulatory Authority',
          type: 'Phytosanitary Certificate',
          country: 'India',
          destination: 'United States',
          expiryDate: '2024-12-31',
          status: 'Active'
        },
        compliance: [
          { requirement: 'Plant Health Certificate', status: 'Valid', score: 100 },
          { requirement: 'Organic Certification', status: 'Valid', score: 98 },
          { requirement: 'Quality Standards', status: 'Valid', score: 95 },
          { requirement: 'Documentation Complete', status: 'Valid', score: 100 }
        ],
        recommendations: []
      };

      setResult(mockResult);
      
      if (onCertificateGenerated) {
        onCertificateGenerated(mockResult);
      }
    } catch (error) {
      console.error('Certificate validation error:', error);
      setResult({
        success: false,
        error: 'Certificate validation failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateCertificateId = () => {
    const timestamp = Date.now();
    const id = `CERT_REG_${timestamp}`;
    setCertificateId(id);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2 text-green-600">📋</span>
            Export Certificates
            <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
              Regulatory
            </span>
          </h2>
          <p className="text-gray-600 mt-1">
            Validate and approve international export certificates and compliance documents
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'validate', label: 'Validate', icon: '✅' },
          { id: 'approve', label: 'Approve', icon: '👍' },
          { id: 'audit', label: 'Audit Trail', icon: '📊' }
        ].map((tab) => {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-green-600 shadow-sm'
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
        {activeTab === 'validate' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Certificate Validation</h3>
            
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-green-800 mb-2">Certificate Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">Product:</span>
                  <span className="ml-2">{batchData?.commonName || 'Ashwagandha Extract'}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Batch ID:</span>
                  <span className="ml-2">{batchData?.batchId || 'BATCH_001'}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Origin:</span>
                  <span className="ml-2">Karnataka, India</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Destination:</span>
                  <span className="ml-2">United States</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    placeholder="Enter certificate ID or generate new"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={generateCertificateId}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <button
                onClick={() => validateCertificate('validate')}
                disabled={isProcessing || !certificateId}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <span className="mr-2">✅</span>
                {isProcessing ? 'Validating Certificate...' : 'Validate Export Certificate'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'approve' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Certificate Approval</h3>
            
            <div className="space-y-4 mb-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Pending Approvals</h4>
                <div className="space-y-3">
                  {[
                    { id: 'CERT_001', product: 'Ashwagandha', destination: 'USA', status: 'Pending Review' },
                    { id: 'CERT_002', product: 'Turmeric', destination: 'EU', status: 'Documentation Required' },
                    { id: 'CERT_003', product: 'Neem', destination: 'Canada', status: 'Ready for Approval' }
                  ].map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-700">{cert.id}</span>
                        <div className="text-sm text-gray-500">{cert.product} → {cert.destination}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          cert.status === 'Ready for Approval' ? 'bg-green-100 text-green-800' :
                          cert.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cert.status}
                        </span>
                        {cert.status === 'Ready for Approval' && (
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => validateCertificate('approve')}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">👍</span>
              {isProcessing ? 'Processing Approval...' : 'Approve Selected Certificates'}
            </button>
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Certificate Audit Trail</h3>
            
            <div className="space-y-3 mb-4">
              {[
                { action: 'Certificate Created', user: 'Processor Portal', time: '2024-01-15 10:30', status: 'Completed' },
                { action: 'Documentation Submitted', user: 'Lab Portal', time: '2024-01-15 14:20', status: 'Completed' },
                { action: 'Regulatory Review', user: 'Regulatory Officer', time: '2024-01-16 09:15', status: 'In Progress' },
                { action: 'Final Approval', user: 'Chief Regulator', time: '2024-01-16 16:00', status: 'Pending' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-700">{item.action}</span>
                    <div className="text-sm text-gray-500">{item.user} • {item.time}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => validateCertificate('audit')}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <span className="mr-2">📊</span>
              {isProcessing ? 'Generating Audit Report...' : 'Generate Audit Report'}
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
                <h4 className="font-semibold text-gray-800 mb-2">
                  {result.action === 'validate' ? 'Validation Results' :
                   result.action === 'approve' ? 'Approval Results' : 'Audit Results'}
                </h4>
                {result.success ? (
                  <div className="space-y-4">
                    {result.validation && (
                      <div className="bg-white rounded-lg p-3">
                        <h5 className="font-medium text-gray-800 mb-2">Certificate Details:</h5>
                        <div className="space-y-1 text-sm">
                          <p><strong>Certificate ID:</strong> {result.validation.certificateId || result.certificateId}</p>
                          <p><strong>Type:</strong> {result.validation.type}</p>
                          <p><strong>Issuer:</strong> {result.validation.issuer}</p>
                          <p><strong>Origin:</strong> {result.validation.country}</p>
                          <p><strong>Destination:</strong> {result.validation.destination}</p>
                          <p><strong>Status:</strong> {result.validation.status}</p>
                          <p><strong>Expires:</strong> {result.validation.expiryDate}</p>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Compliance Check:</h5>
                      <div className="space-y-2">
                        {result.compliance.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                            <span className="text-sm">{item.requirement}</span>
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

export default ExportCertificates;
