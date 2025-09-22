import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { useStandaloneAuth } from '../hooks/useAuth'
import LoginForm from '../components/LoginForm'
import AnomalyDetection from '../components/AnomalyDetection'
import ExportCertificates from '../components/ExportCertificates'

export default function ProcessorPortal() {
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
  const [showAnomalyDetection, setShowAnomalyDetection] = useState(false)
  const [anomalyResult, setAnomalyResult] = useState(null)
  const [showExportCertificates, setShowExportCertificates] = useState(false)
  const [certificateResult, setCertificateResult] = useState(null)
  const [showCollectionSimulation, setShowCollectionSimulation] = useState(false)
  const [simulationResult, setSimulationResult] = useState(null)
  const [showReputationScoring, setShowReputationScoring] = useState(false)
  const [reputationResult, setReputationResult] = useState(null)
  const [showThreatDetection, setShowThreatDetection] = useState(false)
  const [threatResult, setThreatResult] = useState(null)

  // Login handler
  const handleLogin = async (credentials) => {
    setLoginLoading(true)
    try {
      const result = await login(credentials, 'processor')
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
  const [processorData, setProcessorData] = useState({
    name: '',
    facilityId: '',
    license: '',
    location: '',
    contact: '',
    certification: 'GMP'
  })
  
  const [processingData, setProcessingData] = useState({
    method: 'Drying',
    equipment: '',
    temperature: '',
    duration: '',
    humidity: '',
    batchSize: '',
    yield: '',
    notes: ''
  })
  
  const [qualityData, setQualityData] = useState({
    moisture: '',
    color: 'Good',
    texture: 'Good',
    aroma: 'Good',
    contamination: 'None',
    packaging: 'Sealed',
    storageConditions: 'Cool & Dry',
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
      const accessResponse = await axios.get(`http://localhost:3000/api/workflow/access/processor/${qrCode}?accessType=edit`)

      if (!accessResponse.data.success || !accessResponse.data.data.accessAllowed) {
        toast.error(accessResponse.data.data?.reason || 'Access denied to this batch')
        return
      }

      if (accessResponse.data.data.hasBeenProcessed) {
        toast.warning('This batch has already been processed. Switching to view-only mode.')
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

  // Submit processing data
  const submitProcessingData = async () => {
    setLoading(true)
    try {
      const processingEventData = {
        originalQrCode: qrCode,
        processingId: `PROC_${Date.now()}_${uuidv4().substr(0, 8).toUpperCase()}`,
        processor: processorData,
        processing: processingData,
        quality: qualityData,
        timestamp: new Date().toISOString(),
        status: 'processed'
      }

      const response = await axios.post('http://localhost:3000/api/processing/events', processingEventData)
      
      if (response.data.success) {
        toast.success('Processing data recorded successfully!')
        setCurrentStep(5) // Success step
      } else {
        toast.error('Failed to record processing data')
      }
    } catch (error) {
      toast.error('Failed to submit processing data')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      submitProcessingData()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Fetch available batches for processing
  const fetchAvailableBatches = async () => {
    setDashboardLoading(true)
    try {
      const response = await axios.get('http://localhost:3000/api/workflow/batches/processor')
      if (response.data.success) {
        const batches = response.data.data.batches || []
        // Transform batch data for display
        const transformedBatches = batches.map(batch => ({
          qrCode: batch.target?.qrCode || batch.qrCode,
          productName: batch.product?.name || batch.target?.productName || 'Unknown Product',
          farmer: batch.events?.find(e => e.type === 'Collection')?.performer?.name || 'Unknown Farmer',
          quantity: batch.events?.find(e => e.type === 'Collection')?.details?.quantity || 'Unknown',
          collectedAt: batch.events?.find(e => e.type === 'Collection')?.timestamp
            ? new Date(batch.events.find(e => e.type === 'Collection').timestamp).toLocaleDateString()
            : 'Recently',
          status: batch.workflowStatus || 'collected',
          canEdit: batch.canEdit || false
        }))
        setAvailableBatches(transformedBatches)
      }
    } catch (error) {
      console.error('Error fetching available batches:', error)
      // Don't show error toast for dashboard, just log it
    } finally {
      setDashboardLoading(false)
    }
  }

  // Load available batches on component mount and refresh every 30 seconds
  useEffect(() => {
    if (user) {
      fetchAvailableBatches()
      const interval = setInterval(fetchAvailableBatches, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-processor-blue-50 to-herb-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-processor-blue-600 mx-auto mb-4"></div>
          <p className="text-processor-blue-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <LoginForm
        onLogin={handleLogin}
        portalName="Processor Portal"
        portalIcon="🏭"
        loading={loginLoading}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-processor-blue-50 to-herb-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-processor-blue-600 to-processor-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-4xl">🏭</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-processor-blue-600 to-processor-blue-800 bg-clip-text text-transparent">
                  TRACE HERB
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 font-medium">Processor Portal</p>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome</p>
                <p className="font-semibold text-processor-blue-700">{user?.username || 'Processor'}</p>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-lg md:text-xl text-gray-600 font-medium">Step {currentStep} of 4</p>
                <div className="w-32 bg-gray-200 rounded-full h-4 mt-2">
                  <div
                    className="bg-processor-blue-600 h-4 rounded-full transition-all duration-300 shadow-lg"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 font-medium transition-colors"
              >
                Logout
              </button>
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
                <span className="text-processor-blue-600 mr-3">📊</span>
                Available Batches for Processing
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">New batches from farmers are automatically shown here</p>
                    <p className="text-gray-600 mt-1">Click on any batch below to start processing</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-processor-blue-600">
                      {dashboardLoading ? '...' : availableBatches.length}
                    </div>
                    <div className="text-sm text-gray-500">Available Batches</div>
                  </div>
                </div>
                {/* Available Batches List */}
                {availableBatches.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">Available Batches:</h4>
                    {availableBatches.map((batch, index) => (
                      <div
                        key={batch.qrCode || index}
                        className="p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => {
                          setQrCode(batch.qrCode)
                          // Trigger batch data fetch after setting QR code
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
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-sm">🌱</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{batch.qrCode}</p>
                              <p className="text-sm text-gray-600">
                                {batch.productName} • {batch.farmer} • {batch.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Ready to Process
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{batch.collectedAt}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">💡</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">No batches available yet</p>
                        <p className="text-xs text-gray-600 mt-1">
                          When farmers create new batches, they will automatically appear here for processing.
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
                <div className="w-16 h-16 bg-processor-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-processor-blue-600 text-3xl">📱</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">Scan Batch QR Code</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">
                    Enter QR Code from Farmer Batch *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="QR_COL_XXXXXXXXX_XXXXXXXX"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Scan or enter the QR code from the farmer's herb batch to begin processing
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

          {/* Step 2: Processor Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-6 mb-12">
                <div className="w-16 h-16 bg-processor-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-processor-blue-600 text-3xl">🏭</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">Processor Information</h2>
              </div>
              
              {/* Show batch info */}
              {batchData && (
                <div className="bg-herb-green-50 p-6 rounded-2xl mb-8">
                  <h3 className="text-xl font-bold text-herb-green-800 mb-4">Batch Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-900">
                    <div><strong className="text-gray-900">Product:</strong> {batchData.product?.name}</div>
                    <div><strong className="text-gray-900">Batch:</strong> {batchData.target?.batchNumber}</div>
                    <div><strong className="text-gray-900">Farmer:</strong> {batchData.events?.[0]?.performer?.name}</div>
                    <div><strong className="text-gray-900">Location:</strong> {batchData.events?.[0]?.location?.address}</div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Facility Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter facility name"
                    value={processorData.name}
                    onChange={(e) => setProcessorData({...processorData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Facility ID *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="PROC_FACILITY_001"
                    value={processorData.facilityId}
                    onChange={(e) => setProcessorData({...processorData, facilityId: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">License Number</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Processing license number"
                    value={processorData.license}
                    onChange={(e) => setProcessorData({...processorData, license: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Contact</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="+91 9876543210"
                    value={processorData.contact}
                    onChange={(e) => setProcessorData({...processorData, contact: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Location</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="City, State"
                    value={processorData.location}
                    onChange={(e) => setProcessorData({...processorData, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Certification</label>
                  <select
                    className="input-field"
                    value={processorData.certification}
                    onChange={(e) => setProcessorData({...processorData, certification: e.target.value})}
                  >
                    <option value="GMP">GMP Certified</option>
                    <option value="ISO">ISO Certified</option>
                    <option value="Organic">Organic Certified</option>
                    <option value="HACCP">HACCP Certified</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="btn-secondary">
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={!processorData.name || !processorData.facilityId}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Processing Details
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Processing Details */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-6 mb-12">
                <div className="w-16 h-16 bg-processor-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-processor-blue-600 text-3xl">⚙️</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">Processing Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Processing Method *</label>
                  <select
                    className="input-field"
                    value={processingData.method}
                    onChange={(e) => setProcessingData({...processingData, method: e.target.value})}
                    required
                  >
                    <option value="Drying">Drying</option>
                    <option value="Extraction">Extraction</option>
                    <option value="Grinding">Grinding</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Sterilization">Sterilization</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Equipment Used</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Tray dryer, Grinder, etc."
                    value={processingData.equipment}
                    onChange={(e) => setProcessingData({...processingData, equipment: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Temperature (°C)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="40"
                    value={processingData.temperature}
                    onChange={(e) => setProcessingData({...processingData, temperature: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Duration (hours)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="24"
                    value={processingData.duration}
                    onChange={(e) => setProcessingData({...processingData, duration: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Humidity (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="60"
                    value={processingData.humidity}
                    onChange={(e) => setProcessingData({...processingData, humidity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Batch Size (kg)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="10"
                    value={processingData.batchSize}
                    onChange={(e) => setProcessingData({...processingData, batchSize: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Yield (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="85"
                    value={processingData.yield}
                    onChange={(e) => setProcessingData({...processingData, yield: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Processing Notes</label>
                  <textarea
                    className="input-field h-24"
                    placeholder="Additional processing notes..."
                    value={processingData.notes}
                    onChange={(e) => setProcessingData({...processingData, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="btn-secondary">
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={!processingData.method}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Quality Control
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Quality Control */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-6 mb-12">
                <div className="w-16 h-16 bg-processor-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-processor-blue-600 text-3xl">🔬</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">Quality Control</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Moisture Content (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="8.5"
                    value={qualityData.moisture}
                    onChange={(e) => setQualityData({...qualityData, moisture: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Color Assessment</label>
                  <select
                    className="input-field"
                    value={qualityData.color}
                    onChange={(e) => setQualityData({...qualityData, color: e.target.value})}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Texture</label>
                  <select
                    className="input-field"
                    value={qualityData.texture}
                    onChange={(e) => setQualityData({...qualityData, texture: e.target.value})}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Aroma</label>
                  <select
                    className="input-field"
                    value={qualityData.aroma}
                    onChange={(e) => setQualityData({...qualityData, aroma: e.target.value})}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Contamination Check</label>
                  <select
                    className="input-field"
                    value={qualityData.contamination}
                    onChange={(e) => setQualityData({...qualityData, contamination: e.target.value})}
                  >
                    <option value="None">None Detected</option>
                    <option value="Minor">Minor</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Packaging</label>
                  <select
                    className="input-field"
                    value={qualityData.packaging}
                    onChange={(e) => setQualityData({...qualityData, packaging: e.target.value})}
                  >
                    <option value="Sealed">Vacuum Sealed</option>
                    <option value="Airtight">Airtight Container</option>
                    <option value="Standard">Standard Packaging</option>
                    <option value="Bulk">Bulk Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Storage Conditions</label>
                  <select
                    className="input-field"
                    value={qualityData.storageConditions}
                    onChange={(e) => setQualityData({...qualityData, storageConditions: e.target.value})}
                  >
                    <option value="Cool & Dry">Cool & Dry</option>
                    <option value="Refrigerated">Refrigerated</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Ambient">Ambient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">Quality Notes</label>
                  <textarea
                    className="input-field h-24"
                    placeholder="Quality assessment notes..."
                    value={qualityData.notes}
                    onChange={(e) => setQualityData({...qualityData, notes: e.target.value})}
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
                      Submitting...
                    </>
                  ) : (
                    'Submit Processing Data'
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
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 text-6xl">✅</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">Processing Complete!</h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
                Processing data has been successfully recorded on the blockchain.
                The batch is now ready for the next stage in the supply chain.
              </p>

              <div className="bg-blue-50 p-8 rounded-2xl max-w-2xl mx-auto border border-blue-200">
                <h3 className="text-2xl font-bold text-blue-800 mb-6">Processing Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="text-gray-800"><strong className="text-gray-900">Original QR:</strong> {qrCode}</div>
                  <div className="text-gray-800"><strong className="text-gray-900">Method:</strong> {processingData.method}</div>
                  <div className="text-gray-800"><strong className="text-gray-900">Facility:</strong> {processorData.name}</div>
                  <div className="text-gray-800"><strong className="text-gray-900">Quality:</strong> {qualityData.color}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 p-6 rounded-xl border border-green-200 max-w-2xl mx-auto">
                  <h4 className="text-lg font-bold text-green-800 mb-2">✅ Next Steps</h4>
                  <p className="text-green-700">
                    This batch is now available for laboratory testing. The lab portal will automatically
                    receive this batch for quality testing and certification.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCurrentStep(1)
                    setBatchData(null)
                    setQrCode('')
                    // Refresh the processor portal automatically
                    window.location.reload()
                  }}
                  className="btn-primary"
                >
                  Process Another Batch
                </button>
              </div>
            </motion.div>
          )}

          {/* Advanced Features Section */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">🏭 Advanced Processing Features</h2>

              {/* Anomaly Detection */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-2">🔍 Anomaly Detection</h3>
                    <p className="text-orange-700 text-sm mb-3">
                      Detect irregularities in processing parameters and quality metrics.
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
                      Processing parameters have been analyzed for irregularities and quality issues.
                    </p>
                  </div>
                )}
              </div>

              {showAnomalyDetection && (
                <AnomalyDetection
                  mode="processor"
                  onDetectionComplete={(result) => {
                    setAnomalyResult(result);
                    console.log('Anomaly Detection Result:', result);
                  }}
                  batchData={{
                    ...processingData,
                    ...qualityData,
                    batchId: batchData?.batchId,
                    commonName: batchData?.commonName
                  }}
                />
              )}

              {/* Export Certificates */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">📋 Export Certificates</h3>
                    <p className="text-blue-700 text-sm mb-3">
                      Generate international export certificates and compliance documents.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowExportCertificates(!showExportCertificates)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showExportCertificates ? 'Hide Certificates' : 'Show Certificates'}
                  </button>
                </div>

                {certificateResult && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Certificate Generated</h4>
                    <p className="text-blue-700 text-sm">
                      Export certificate has been generated and is ready for international trade.
                    </p>
                  </div>
                )}
              </div>

              {showExportCertificates && (
                <ExportCertificates
                  mode="processor"
                  onCertificateGenerated={(result) => {
                    setCertificateResult(result);
                    console.log('Certificate Result:', result);
                  }}
                  batchData={{
                    ...batchData,
                    ...processingData,
                    ...qualityData,
                    processorData
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
