import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { useStandaloneAuth } from '../hooks/useAuth'
import LoginForm from '../components/LoginForm'
import PlantSpeciesVerification from '../components/PlantSpeciesVerification'
import AnomalyDetection from '../components/AnomalyDetection'
import FHIRHealthcare from '../components/FHIRHealthcare'

export default function LabPortal() {
  // Authentication
  const { user, loading: authLoading, login, logout } = useStandaloneAuth()
  const [loginLoading, setLoginLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [batchData, setBatchData] = useState(null)
  const [qrCode, setQrCode] = useState('')
  const [viewOnly, setViewOnly] = useState(false)
  const [availableBatches, setAvailableBatches] = useState([])
  const [dashboardLoading, setDashboardLoading] = useState(false)

  // Advanced Features State
  const [showPlantVerification, setShowPlantVerification] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [showAnomalyDetection, setShowAnomalyDetection] = useState(false)
  const [anomalyResult, setAnomalyResult] = useState(null)
  const [showFHIRCompliance, setShowFHIRCompliance] = useState(false)
  const [fhirResult, setFhirResult] = useState(null)

  // Login handler
  const handleLogin = async (credentials) => {
    setLoginLoading(true)
    try {
      const result = await login(credentials, 'laboratory')
      if (!result.success) {
        alert(result.error || 'Login failed')
      }
    } catch (error) {
      alert('Login failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Form data states
  const [labData, setLabData] = useState({
    name: '',
    labId: '',
    accreditation: 'ISO/IEC 17025',
    location: '',
    contact: '',
    technician: '',
    equipment: ''
  })
  
  const [testData, setTestData] = useState({
    moisture: '',
    pesticides: 'Not Detected',
    heavyMetals: 'Within Limits',
    microbial: 'Acceptable',
    dnaAuthenticity: 'Confirmed',
    activeCompounds: '',
    purity: '',
    contamination: 'None',
    notes: ''
  })
  
  const [certificateData, setCertificateData] = useState({
    certificateId: `CERT_${Date.now()}_${uuidv4().substr(0, 8).toUpperCase()}`,
    testDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    overallGrade: 'A',
    compliance: 'Compliant',
    recommendations: '',
    notes: ''
  })

  // Fetch batch data by QR code with workflow validation
  const fetchBatchData = async () => {
    if (!qrCode.trim()) {
      toast.error('Please enter a QR code')
      return
    }

    setLoading(true)
    try {
      // Check workflow access first
      const accessResponse = await axios.get(`http://localhost:3000/api/workflow/access/lab/${qrCode}?accessType=edit`)

      if (!accessResponse.data.success || !accessResponse.data.data.accessAllowed) {
        toast.error(accessResponse.data.data?.reason || 'Access denied to this batch')
        return
      }

      if (accessResponse.data.data.hasBeenProcessed) {
        toast.warning('This batch has already been tested. Switching to view-only mode.')
        setBatchData(accessResponse.data.data.batch)
        setCurrentStep(2)
        setViewOnly(true)
        return
      }

      if (accessResponse.data.data.canEdit) {
        setBatchData(accessResponse.data.data.batch)
        toast.success('Batch data loaded successfully!')
        setCurrentStep(2)
        setViewOnly(false)
      } else {
        toast.error('Cannot edit this batch at current workflow stage')
      }
    } catch (error) {
      toast.error('Failed to fetch batch data')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Submit lab test data
  const submitLabData = async () => {
    setLoading(true)
    try {
      const labEventData = {
        originalQrCode: qrCode,
        testId: `TEST_${Date.now()}_${uuidv4().substr(0, 8).toUpperCase()}`,
        lab: labData,
        tests: testData,
        certificate: certificateData,
        timestamp: new Date().toISOString(),
        status: 'tested'
      }

      const response = await axios.post('http://localhost:3000/api/lab/events', labEventData)
      
      if (response.data.success) {
        toast.success('Lab test data recorded successfully!')
        // Refresh available batches to remove completed batch
        fetchAvailableBatches()
        setCurrentStep(5) // Success step
      } else {
        toast.error('Failed to record lab test data')
      }
    } catch (error) {
      toast.error('Failed to submit lab test data')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      submitLabData()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Fetch available batches for testing
  const fetchAvailableBatches = async () => {
    setDashboardLoading(true)
    try {
      const response = await axios.get('http://localhost:3000/api/workflow/batches/lab')
      if (response.data.success) {
        const batches = response.data.data.batches || []
        // Transform batch data for display
        const transformedBatches = batches.map(batch => ({
          qrCode: batch.target?.qrCode || batch.qrCode,
          productName: batch.product?.name || batch.target?.productName || 'Unknown Product',
          farmer: batch.events?.find(e => e.type === 'Collection')?.performer?.name || 'Unknown Farmer',
          processor: batch.events?.find(e => e.type === 'Processing')?.performer?.name || 'Unknown Processor',
          quantity: batch.events?.find(e => e.type === 'Collection')?.details?.quantity || 'Unknown',
          processedAt: batch.events?.find(e => e.type === 'Processing')?.timestamp
            ? new Date(batch.events.find(e => e.type === 'Processing').timestamp).toLocaleDateString()
            : 'Recently',
          status: batch.workflowStatus || 'processed',
          canEdit: batch.canEdit || false
        }))
        setAvailableBatches(transformedBatches)
      }
    } catch (error) {
      console.error('Error fetching available batches:', error)
    } finally {
      setDashboardLoading(false)
    }
  }

  // Load available batches on component mount and refresh every 30 seconds
  useEffect(() => {
    if (user) {
      fetchAvailableBatches()
      const interval = setInterval(fetchAvailableBatches, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-purple-50 to-herb-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lab-purple-600 mx-auto mb-4"></div>
          <p className="text-lab-purple-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <LoginForm
        onLogin={handleLogin}
        portalName="Laboratory Portal"
        portalIcon="🔬"
        loading={loginLoading}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-purple-50 to-herb-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-lab-purple-600 to-lab-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-4xl">🔬</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-lab-purple-600 to-lab-purple-800 bg-clip-text text-transparent">
                  TRACE HERB
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 font-medium">Laboratory Portal</p>
              </div>
            </div>

            {/* User Info and Progress */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-lg md:text-xl text-gray-600 font-medium">Step {currentStep} of 4</p>
                <div className="w-32 bg-gray-200 rounded-full h-4 mt-2">
                  <div
                    className="bg-lab-purple-600 h-4 rounded-full transition-all duration-300 shadow-lg"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* User Info and Logout */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Welcome</p>
                  <p className="font-semibold text-lab-purple-700">{user?.username || 'Lab Technician'}</p>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Dashboard Section */}
        {currentStep === 1 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-5xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-lab-purple-600 mr-3">🔬</span>
                Batches Ready for Testing
              </h3>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Processed batches automatically appear here</p>
                    <p className="text-gray-600 mt-1">Enter QR codes from processed batches to start testing</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-lab-purple-600">
                      {dashboardLoading ? '...' : availableBatches.length}
                    </div>
                    <div className="text-sm text-gray-500">Ready for Testing</div>
                  </div>
                </div>
                {/* Available Batches List */}
                {availableBatches.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">Processed Batches Ready for Testing:</h4>
                    {availableBatches.map((batch, index) => (
                      <div
                        key={batch.qrCode || index}
                        className="p-4 bg-white rounded-lg border border-purple-100 hover:border-purple-300 cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => {
                          setQrCode(batch.qrCode)
                          setTimeout(() => {
                            const qrInput = document.querySelector('input[placeholder*="QR_COL"]')
                            if (qrInput) {
                              qrInput.value = batch.qrCode
                              qrInput.dispatchEvent(new Event('input', { bubbles: true }))
                            }
                          }, 100)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm">🏭</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{batch.qrCode}</p>
                              <p className="text-sm text-gray-600">
                                {batch.productName} • Processed by {batch.processor} • {batch.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Ready for Testing
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{batch.processedAt}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-sm">🧪</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">No processed batches available yet</p>
                        <p className="text-xs text-gray-600 mt-1">
                          When processors complete batch processing, they will automatically appear here for testing.
                          You can also manually enter QR codes below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl mx-auto">
          
          {/* Step 1: QR Code Input */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-6 mb-12">
                <div className="w-16 h-16 bg-lab-purple-100 rounded-2xl flex items-center justify-center">
                  <span className="text-lab-purple-600 text-3xl">📱</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">Scan Batch QR Code</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">
                    Enter QR Code for Testing *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="QR_COL_XXXXXXXXX_XXXXXXXX or QR_PROC_XXXXXXXXX"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Scan or enter the QR code from farmer batch or processed batch for laboratory testing
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-12">
                <button
                  onClick={fetchBatchData}
                  disabled={loading || !qrCode.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Loading Batch...
                    </>
                  ) : (
                    'Load Batch Data'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Lab Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-6 mb-12">
                <div className="w-16 h-16 bg-lab-purple-100 rounded-2xl flex items-center justify-center">
                  <span className="text-lab-purple-600 text-3xl">🏥</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">Laboratory Information</h2>
              </div>
              
              {/* Show batch info */}
              {batchData && (
                <div className="bg-herb-green-50 p-6 rounded-2xl mb-8">
                  <h3 className="text-xl font-bold text-herb-green-800 mb-4">Batch Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-900">
                    <div><strong className="text-gray-900">Product:</strong> {batchData.product?.name}</div>
                    <div><strong className="text-gray-900">Batch:</strong> {batchData.target?.batchNumber}</div>
                    <div><strong className="text-gray-900">Status:</strong> {batchData.status || 'Collected'}</div>
                    <div><strong className="text-gray-900">Events:</strong> {batchData.events?.length || 0} recorded</div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Laboratory Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter laboratory name"
                    value={labData.name}
                    onChange={(e) => setLabData({...labData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Lab ID *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="LAB_001"
                    value={labData.labId}
                    onChange={(e) => setLabData({...labData, labId: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Accreditation</label>
                  <select
                    className="input-field"
                    value={labData.accreditation}
                    onChange={(e) => setLabData({...labData, accreditation: e.target.value})}
                  >
                    <option value="ISO/IEC 17025">ISO/IEC 17025</option>
                    <option value="NABL">NABL Accredited</option>
                    <option value="FDA">FDA Registered</option>
                    <option value="GLP">GLP Certified</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Contact</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="+91 9876543210"
                    value={labData.contact}
                    onChange={(e) => setLabData({...labData, contact: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Location</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="City, State"
                    value={labData.location}
                    onChange={(e) => setLabData({...labData, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Technician</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Lab technician name"
                    value={labData.technician}
                    onChange={(e) => setLabData({...labData, technician: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="btn-secondary">
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={!labData.name || !labData.labId}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Test Results
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Test Results */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-6 mb-12">
                <div className="w-16 h-16 bg-lab-purple-100 rounded-2xl flex items-center justify-center">
                  <span className="text-lab-purple-600 text-3xl">🧪</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">Test Results</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Moisture Content (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="8.5"
                    value={testData.moisture}
                    onChange={(e) => setTestData({...testData, moisture: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Pesticide Residues</label>
                  <select
                    className="input-field"
                    value={testData.pesticides}
                    onChange={(e) => setTestData({...testData, pesticides: e.target.value})}
                  >
                    <option value="Not Detected">Not Detected</option>
                    <option value="Within Limits">Within Acceptable Limits</option>
                    <option value="Above Limits">Above Acceptable Limits</option>
                    <option value="Detected">Detected - Requires Action</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Heavy Metals</label>
                  <select
                    className="input-field"
                    value={testData.heavyMetals}
                    onChange={(e) => setTestData({...testData, heavyMetals: e.target.value})}
                  >
                    <option value="Within Limits">Within Limits</option>
                    <option value="Above Limits">Above Limits</option>
                    <option value="Not Detected">Not Detected</option>
                    <option value="Requires Monitoring">Requires Monitoring</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Microbial Testing</label>
                  <select
                    className="input-field"
                    value={testData.microbial}
                    onChange={(e) => setTestData({...testData, microbial: e.target.value})}
                  >
                    <option value="Acceptable">Acceptable</option>
                    <option value="High Count">High Count</option>
                    <option value="Pathogen Detected">Pathogen Detected</option>
                    <option value="Sterile">Sterile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">DNA Authenticity</label>
                  <select
                    className="input-field"
                    value={testData.dnaAuthenticity}
                    onChange={(e) => setTestData({...testData, dnaAuthenticity: e.target.value})}
                  >
                    <option value="Confirmed">Species Confirmed</option>
                    <option value="Partial Match">Partial Match</option>
                    <option value="No Match">No Match</option>
                    <option value="Adulterated">Adulterated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Active Compounds (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="2.5"
                    value={testData.activeCompounds}
                    onChange={(e) => setTestData({...testData, activeCompounds: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Purity (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="95.5"
                    value={testData.purity}
                    onChange={(e) => setTestData({...testData, purity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Contamination</label>
                  <select
                    className="input-field"
                    value={testData.contamination}
                    onChange={(e) => setTestData({...testData, contamination: e.target.value})}
                  >
                    <option value="None">None Detected</option>
                    <option value="Foreign Matter">Foreign Matter</option>
                    <option value="Chemical">Chemical Contamination</option>
                    <option value="Biological">Biological Contamination</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xl font-bold text-gray-700 mb-4">Test Notes</label>
                  <textarea
                    className="input-field h-24"
                    placeholder="Additional test observations and notes..."
                    value={testData.notes}
                    onChange={(e) => setTestData({...testData, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="btn-secondary">
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Next: Certificate
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Certificate Generation */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-6 mb-12">
                <div className="w-16 h-16 bg-lab-purple-100 rounded-2xl flex items-center justify-center">
                  <span className="text-lab-purple-600 text-3xl">📜</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">Generate Certificate</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Certificate ID</label>
                  <input
                    type="text"
                    className="input-field bg-gray-100"
                    value={certificateData.certificateId}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Test Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={certificateData.testDate}
                    onChange={(e) => setCertificateData({...certificateData, testDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Certificate Expiry</label>
                  <input
                    type="date"
                    className="input-field"
                    value={certificateData.expiryDate}
                    onChange={(e) => setCertificateData({...certificateData, expiryDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Overall Grade</label>
                  <select
                    className="input-field"
                    value={certificateData.overallGrade}
                    onChange={(e) => setCertificateData({...certificateData, overallGrade: e.target.value})}
                  >
                    <option value="A+">A+ (Excellent)</option>
                    <option value="A">A (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="C">C (Fair)</option>
                    <option value="D">D (Poor)</option>
                    <option value="F">F (Failed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Compliance Status</label>
                  <select
                    className="input-field"
                    value={certificateData.compliance}
                    onChange={(e) => setCertificateData({...certificateData, compliance: e.target.value})}
                  >
                    <option value="Compliant">Fully Compliant</option>
                    <option value="Conditional">Conditionally Compliant</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Recommendations</label>
                  <textarea
                    className="input-field h-24"
                    placeholder="Quality improvement recommendations..."
                    value={certificateData.recommendations}
                    onChange={(e) => setCertificateData({...certificateData, recommendations: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xl font-bold text-gray-700 mb-4">Certificate Notes</label>
                  <textarea
                    className="input-field h-24"
                    placeholder="Additional certificate notes and observations..."
                    value={certificateData.notes}
                    onChange={(e) => setCertificateData({...certificateData, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="btn-secondary">
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Generating Certificate...
                    </>
                  ) : (
                    'Generate Certificate'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="w-32 h-32 bg-herb-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-herb-green-600 text-6xl">🏆</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">Testing Complete!</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Laboratory testing has been completed and digital certificate has been generated.
                All test results have been recorded on the blockchain for transparency.
              </p>

              <div className="bg-lab-purple-50 p-8 rounded-2xl max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-lab-purple-800 mb-4">Test Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="text-gray-900"><strong className="text-gray-900">QR Code:</strong> {qrCode}</div>
                  <div className="text-gray-900"><strong className="text-gray-900">Certificate:</strong> {certificateData.certificateId}</div>
                  <div className="text-gray-900"><strong className="text-gray-900">Grade:</strong> {certificateData.overallGrade}</div>
                  <div className="text-gray-900"><strong className="text-gray-900">Compliance:</strong> {certificateData.compliance}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentStep(1)
                  setBatchData(null)
                  setQrCode('')
                  setCertificateData({
                    ...certificateData,
                    certificateId: `CERT_${Date.now()}_${uuidv4().substr(0, 8).toUpperCase()}`
                  })
                  // Refresh available batches when returning to dashboard
                  fetchAvailableBatches()
                }}
                className="btn-primary"
              >
                Test Another Batch
              </button>
            </motion.div>
          )}

          {/* Advanced Features Section */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">🧪 Advanced Laboratory Features</h2>

              {/* Plant Species Verification */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-purple-800 mb-2">🔬 Plant Species Verification</h3>
                    <p className="text-purple-700 text-sm mb-3">
                      Cross-reference and validate species identification from samples.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPlantVerification(!showPlantVerification)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {showPlantVerification ? 'Hide Verification' : 'Show Verification'}
                  </button>
                </div>

                {verificationResult && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">🔬 Species Verification Complete</h4>
                    <p className="text-purple-700 text-sm">
                      Plant species has been verified and cross-referenced with authenticated databases.
                    </p>
                  </div>
                )}
              </div>

              {showPlantVerification && (
                <PlantSpeciesVerification
                  mode="lab"
                  onVerificationComplete={(result) => {
                    setVerificationResult(result);
                    console.log('Plant Verification Result:', result);
                  }}
                  batchData={{
                    ...batchData,
                    ...testData,
                    labData
                  }}
                />
              )}

              {/* Anomaly Detection */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-2">🔍 Lab Testing Anomalies</h3>
                    <p className="text-orange-700 text-sm mb-3">
                      Identify anomalies in laboratory test results and sample analysis.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAnomalyDetection(!showAnomalyDetection)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {showAnomalyDetection ? 'Hide Detection' : 'Show Detection'}
                  </button>
                </div>

                {anomalyResult && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">🔍 Anomaly Detection Complete</h4>
                    <p className="text-orange-700 text-sm">
                      Laboratory test results have been analyzed for anomalies and irregularities.
                    </p>
                  </div>
                )}
              </div>

              {showAnomalyDetection && (
                <AnomalyDetection
                  mode="lab"
                  onDetectionComplete={(result) => {
                    setAnomalyResult(result);
                    console.log('Lab Anomaly Detection Result:', result);
                  }}
                  batchData={{
                    ...batchData,
                    ...testData,
                    labData
                  }}
                />
              )}

              {/* FHIR Healthcare Compliance */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">❤️ FHIR Healthcare Compliance</h3>
                    <p className="text-red-700 text-sm mb-3">
                      Ensure laboratory compliance with healthcare standards and interoperability.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFHIRCompliance(!showFHIRCompliance)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {showFHIRCompliance ? 'Hide Compliance' : 'Show Compliance'}
                  </button>
                </div>

                {fhirResult && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">❤️ FHIR Compliance Complete</h4>
                    <p className="text-red-700 text-sm">
                      Healthcare compliance standards have been validated and documented.
                    </p>
                  </div>
                )}
              </div>

              {showFHIRCompliance && (
                <FHIRHealthcare
                  onComplianceComplete={(result) => {
                    setFhirResult(result);
                    console.log('FHIR Compliance Result:', result);
                  }}
                  batchData={{
                    ...batchData,
                    ...testData,
                    ...certificateData,
                    labData
                  }}
                />
              )}

            </motion.div>
          )}

        </div>
      </main>
    </div>
  )
}
