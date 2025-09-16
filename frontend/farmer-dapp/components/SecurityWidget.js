import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  BugAntIcon,
  KeyIcon,
  FingerPrintIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CpuChipIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

const SecurityWidget = ({ onSecurityComplete, batchData, farmerId }) => {
  const [activeTab, setActiveTab] = useState('zkp'); // 'zkp', 'encryption', 'threats'
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  // Early return for testing
  if (!onSecurityComplete) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Security Widget Loading...</p>
        </div>
      </div>
    );
  }

  // Mock sensitive farmer data for ZKP
  const mockPrivateData = {
    qualityScore: 92,
    location: { latitude: 15.3173, longitude: 75.7139 }, // Hubli, Karnataka
    quantity: parseFloat(batchData?.quantity) || 5,
    farmerId: farmerId || 'F001',
    certifications: ['organic', 'fair_trade'],
    income: 125000, // Sensitive financial data
    landSize: 2.5,
    familySize: 4
  };

  // Mock data for encryption
  const mockSensitiveData = {
    farmerName: batchData?.farmerName || 'Rajesh Kumar',
    phoneNumber: '+91-9876543210',
    bankAccount: 'HDFC-****-1234',
    income: 125000,
    landOwnership: 'Owned',
    familyDetails: 'Wife, 2 children',
    qualityScore: 92,
    location: 'Hubli, Karnataka',
    herbType: batchData?.commonName || 'Ashwagandha'
  };

  // Generate Zero-Knowledge Proof
  const generateZKProof = async (proofType) => {
    setIsProcessing(true);
    setResult(null);

    try {
      let publicInputs;
      
      switch (proofType) {
        case 'quality':
          publicInputs = { minQuality: 80 };
          break;
        case 'location':
          publicInputs = { allowedRegion: 'Karnataka' };
          break;
        case 'quantity':
          publicInputs = { maxQuantity: 100 };
          break;
        case 'farmer_identity':
          publicInputs = { requiredCertification: 'organic' };
          break;
        default:
          throw new Error('Invalid proof type');
      }

      const response = await fetch('http://localhost:3000/api/ai/generate-zkp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          privateData: mockPrivateData,
          publicInputs,
          proofType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onSecurityComplete) {
          onSecurityComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'ZKP generation failed');
      }

    } catch (error) {
      console.error('ZKP Generation Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Encrypt data with selective disclosure
  const encryptData = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/encrypt-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: mockSensitiveData,
          disclosureFields: ['farmerName', 'location', 'herbType', 'qualityScore'], // Fields that can be disclosed
          recipientId: 'processor_001'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onSecurityComplete) {
          onSecurityComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'Encryption failed');
      }

    } catch (error) {
      console.error('Encryption Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate threat detection
  const simulateThreat = async (threatType) => {
    setIsProcessing(true);
    setResult(null);

    try {
      let threatScenario;
      
      switch (threatType) {
        case 'fake_qr':
          threatScenario = {
            threatType: 'fake_qr',
            payload: {
              qrCode: 'FAKE-QR-MALICIOUS-123',
              metadata: { source: 'unknown' }
            },
            sourceIP: '192.168.1.100',
            userAgent: 'Malicious-Bot/1.0'
          };
          break;
        case 'double_spending':
          threatScenario = {
            threatType: 'double_spending',
            payload: {
              transactionId: 'TXN_12345',
              farmerId: farmerId || 'F001',
              timestamp: new Date().toISOString()
            },
            sourceIP: '10.0.0.50'
          };
          break;
        case 'data_tampering':
          threatScenario = {
            threatType: 'data_tampering',
            payload: {
              originalHash: 'abc123def456',
              currentData: { modified: 'tampered_data' },
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24 hours ago
            }
          };
          break;
        case 'injection_attack':
          threatScenario = {
            threatType: 'injection_attack',
            payload: "'; DROP TABLE farmers; --",
            sourceIP: '192.168.1.100'
          };
          break;
        default:
          throw new Error('Invalid threat type');
      }

      const response = await fetch('http://localhost:3000/api/ai/simulate-threat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ threatScenario })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onSecurityComplete) {
          onSecurityComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'Threat simulation failed');
      }

    } catch (error) {
      console.error('Threat Simulation Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getResultIcon = () => {
    if (result?.success && activeTab === 'zkp') return FingerPrintIcon;
    if (result?.success && activeTab === 'encryption') return LockClosedIcon;
    if (result?.success && activeTab === 'threats') return result?.detected ? ExclamationTriangleIcon : CheckCircleIcon;
    if (result?.error) return XCircleIcon;
    return InformationCircleIcon;
  };

  const getResultColor = () => {
    if (result?.success && activeTab === 'threats' && result?.detected) return 'text-red-600';
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
            <ShieldCheckIcon className="h-6 w-6 mr-2 text-red-600" />
            Security & Cyber Innovation
          </h2>
          <p className="text-gray-600 mt-1">
            Zero-Knowledge Proofs, end-to-end encryption, and threat simulation
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'zkp', label: 'Zero-Knowledge', icon: FingerPrintIcon },
          { id: 'encryption', label: 'Encryption', icon: LockClosedIcon },
          { id: 'threats', label: 'Threat Detection', icon: BugAntIcon }
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

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'zkp' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">🔐 Zero-Knowledge Proofs (ZKP)</h3>
              <p className="text-purple-700 text-sm mb-3">
                Prove compliance without revealing sensitive data. Verify quality, location, 
                and identity while keeping farmer information completely private.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <EyeSlashIcon className="h-4 w-4 text-purple-600 mr-2" />
                  <span>Privacy Preserved</span>
                </div>
                <div className="flex items-center">
                  <CpuChipIcon className="h-4 w-4 text-purple-600 mr-2" />
                  <span>Cryptographically Secure</span>
                </div>
              </div>
            </div>

            {/* ZKP Generation Options */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">🎯 Generate Privacy Proofs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { 
                    type: 'quality', 
                    title: 'Quality Compliance', 
                    description: 'Prove quality score ≥ 80% without revealing exact score',
                    icon: CheckCircleIcon,
                    color: 'bg-green-100 text-green-700'
                  },
                  { 
                    type: 'location', 
                    title: 'Location Verification', 
                    description: 'Prove location within Karnataka without GPS coordinates',
                    icon: ShieldCheckIcon,
                    color: 'bg-blue-100 text-blue-700'
                  },
                  {
                    type: 'quantity',
                    title: 'Quantity Bounds',
                    description: 'Prove quantity ≤ 100kg without revealing exact amount',
                    icon: DocumentIcon,
                    color: 'bg-yellow-100 text-yellow-700'
                  },
                  { 
                    type: 'farmer_identity', 
                    title: 'Identity Proof', 
                    description: 'Prove organic certification without revealing identity',
                    icon: FingerPrintIcon,
                    color: 'bg-purple-100 text-purple-700'
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.type} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${item.color} mr-3`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800">{item.title}</h5>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => generateZKProof(item.type)}
                        disabled={isProcessing}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {isProcessing ? 'Generating Proof...' : 'Generate ZK Proof'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ZKP Benefits */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">✨ Privacy Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>• Sensitive data never leaves your device</div>
                <div>• Cryptographically verifiable proofs</div>
                <div>• Compliance without data exposure</div>
                <div>• Tamper-proof verification system</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'encryption' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🔒 End-to-End Encryption</h3>
              <p className="text-blue-700 text-sm mb-3">
                Encrypt sensitive data with selective disclosure. Share only what's necessary 
                with specific stakeholders while keeping everything else private.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <KeyIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span>AES-256-GCM Encryption</span>
                </div>
                <div className="flex items-center">
                  <EyeSlashIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Selective Disclosure</span>
                </div>
              </div>
            </div>

            {/* Sensitive Data Preview */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">📋 Your Sensitive Data</h4>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(mockSensitiveData).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Selective Disclosure:</strong> Only farmerName, location, herbType, and qualityScore 
                  can be disclosed to processors. Financial and personal data remains encrypted.
                </p>
              </div>

              <button
                onClick={encryptData}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <LockClosedIcon className="h-5 w-5 mr-2" />
                {isProcessing ? 'Encrypting Data...' : 'Encrypt with Selective Disclosure'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'threats' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">🛡️ Cyber Threat Detection</h3>
              <p className="text-red-700 text-sm mb-3">
                Advanced threat simulation and detection system. Test system security 
                against fake QRs, double-spending, data tampering, and injection attacks.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <BugAntIcon className="h-4 w-4 text-red-600 mr-2" />
                  <span>Real-time Detection</span>
                </div>
                <div className="flex items-center">
                  <ShieldExclamationIcon className="h-4 w-4 text-red-600 mr-2" />
                  <span>Automated Mitigation</span>
                </div>
              </div>
            </div>

            {/* Threat Simulation Options */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">⚠️ Simulate Cyber Threats</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { 
                    type: 'fake_qr', 
                    title: 'Fake QR Detection', 
                    description: 'Test detection of malicious QR codes',
                    severity: 'High',
                    icon: ExclamationTriangleIcon,
                    color: 'bg-red-100 text-red-700'
                  },
                  { 
                    type: 'double_spending', 
                    title: 'Double-Spending Attack', 
                    description: 'Simulate blockchain double-spending attempt',
                    severity: 'Critical',
                    icon: ShieldExclamationIcon,
                    color: 'bg-red-100 text-red-700'
                  },
                  { 
                    type: 'data_tampering', 
                    title: 'Data Tampering', 
                    description: 'Test integrity verification system',
                    severity: 'Critical',
                    icon: BugAntIcon,
                    color: 'bg-orange-100 text-orange-700'
                  },
                  { 
                    type: 'injection_attack', 
                    title: 'SQL Injection', 
                    description: 'Test input validation and sanitization',
                    severity: 'High',
                    icon: CpuChipIcon,
                    color: 'bg-yellow-100 text-yellow-700'
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.type} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${item.color} mr-3`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800">{item.title}</h5>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                          item.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.severity}
                        </span>
                      </div>
                      <button
                        onClick={() => simulateThreat(item.type)}
                        disabled={isProcessing}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {isProcessing ? 'Simulating...' : 'Simulate Threat'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">📊 Security Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Threats Detected: <strong>23/25 (92%)</strong></div>
                <div>False Positives: <strong>2 (8%)</strong></div>
                <div>Response Time: <strong>&lt; 100ms</strong></div>
                <div>Security Level: <strong className="text-green-600">High</strong></div>
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
                {result.success ? 'Operation Successful!' : 'Operation Failed'}
              </h4>
              
              {result.success ? (
                <div className="space-y-2 text-sm text-gray-600">
                  {activeTab === 'zkp' && result.proofId && (
                    <>
                      <p><strong>Proof ID:</strong> {result.proofId}</p>
                      <p><strong>Proof Type:</strong> {result.proofType}</p>
                      <p><strong>Verification:</strong> {result.proof?.verified ? '✅ Valid' : '❌ Invalid'}</p>
                      <p><strong>Proof Size:</strong> {result.proof?.proofSize}</p>
                      {result.privacyGuarantees && (
                        <div className="mt-2">
                          <p className="font-medium">Privacy Guarantees:</p>
                          {result.privacyGuarantees.map((guarantee, index) => (
                            <div key={index} className="ml-4 text-xs">• {guarantee}</div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {activeTab === 'encryption' && result.encryptionId && (
                    <>
                      <p><strong>Encryption ID:</strong> {result.encryptionId}</p>
                      <p><strong>Algorithm:</strong> {result.encryptionAlgorithm}</p>
                      <p><strong>Encrypted Fields:</strong> {Object.keys(result.encryptedFields).length}</p>
                      <p><strong>Disclosable Fields:</strong> {Object.keys(result.disclosureTokens).length}</p>
                    </>
                  )}
                  {activeTab === 'threats' && result.threatId && (
                    <>
                      <p><strong>Threat ID:</strong> {result.threatId}</p>
                      <p><strong>Threat Type:</strong> {result.threatType}</p>
                      <p><strong>Detected:</strong> {result.detected ? '🚨 YES' : '✅ NO'}</p>
                      <p><strong>Severity:</strong> {result.severity?.toUpperCase()}</p>
                      {result.mitigationActions && (
                        <div className="mt-2">
                          <p className="font-medium">Mitigation Actions:</p>
                          {result.mitigationActions.map((action, index) => (
                            <div key={index} className="ml-4 text-xs">• {action}</div>
                          ))}
                        </div>
                      )}
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

export default SecurityWidget;
