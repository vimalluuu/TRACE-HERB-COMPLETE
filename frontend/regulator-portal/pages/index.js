import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { useStandaloneAuth } from '../hooks/useAuth'
import LoginForm from '../components/LoginForm'
import GS1GlobalStandards from '../components/GS1GlobalStandards'
import ExportCertificates from '../components/ExportCertificates'

export default function RegulatorPortal() {
  // Authentication
  const { user, loading: authLoading, login, logout } = useStandaloneAuth()
  const [loginLoading, setLoginLoading] = useState(false)

  // Login handler
  const handleLogin = async (credentials) => {
    setLoginLoading(true)
    try {
      const result = await login(credentials, 'regulatory')
      if (!result.success) {
        alert(result.error || 'Login failed')
      }
    } catch (error) {
      alert('Login failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [batchData, setBatchData] = useState(null)
  const [complianceData, setComplianceData] = useState([])
  const [availableBatches, setAvailableBatches] = useState([])
  const [dashboardLoading, setDashboardLoading] = useState(false)

  // Advanced Features State
  const [showGS1Standards, setShowGS1Standards] = useState(false)
  const [gs1Result, setGs1Result] = useState(null)
  const [showExportCertificates, setShowExportCertificates] = useState(false)
  const [certificateResult, setCertificateResult] = useState(null)
  const [showZKProofs, setShowZKProofs] = useState(false)
  const [zkResult, setZkResult] = useState(null)
  const [showEncryption, setShowEncryption] = useState(false)
  const [encryptionResult, setEncryptionResult] = useState(null)
  const [showThreatDetection, setShowThreatDetection] = useState(false)
  const [threatResult, setThreatResult] = useState(null)
  const [dashboardStats, setDashboardStats] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
    complianceRate: 0
  })
  const [commonIssues, setCommonIssues] = useState([
    { name: 'Pesticide Residue', percentage: 0 },
    { name: 'Missing Documentation', percentage: 0 },
    { name: 'Quality Standards', percentage: 0 },
    { name: 'Traceability Gaps', percentage: 0 }
  ])
  
  // Mock compliance data - in real app this would come from API
  const [mockCompliance] = useState([
    {
      id: 'COMP_001',
      qrCode: 'QR_COL_1757267400000_NEWTEST',
      product: 'Ashwagandha',
      farmer: 'Rajesh Kumar',
      processor: 'Premium Herb Processing',
      lab: 'Premium Quality Labs',
      status: 'pending',
      submittedDate: '2025-09-07',
      issues: [],
      grade: 'A',
      compliance: 'Compliant'
    },
    {
      id: 'COMP_002',
      qrCode: 'QR_COL_DEMO_002',
      product: 'Turmeric',
      farmer: 'Priya Sharma',
      processor: 'Organic Processing Ltd',
      lab: 'Quality Labs India',
      status: 'approved',
      submittedDate: '2025-09-06',
      issues: [],
      grade: 'A+',
      compliance: 'Fully Compliant'
    },
    {
      id: 'COMP_003',
      qrCode: 'QR_COL_DEMO_003',
      product: 'Neem',
      farmer: 'Suresh Patel',
      processor: 'Herbal Solutions',
      lab: 'Testing Labs Pvt Ltd',
      status: 'rejected',
      submittedDate: '2025-09-05',
      issues: ['Pesticide residue above limits', 'Missing organic certification'],
      grade: 'C',
      compliance: 'Non-Compliant'
    }
  ])

  // Fetch batch data for review with workflow validation
  const fetchBatchForReview = async () => {
    if (!qrCode.trim()) {
      toast.error('Please enter a QR code')
      return
    }

    setLoading(true)
    try {
      // Check workflow access first
      const accessResponse = await axios.get(`http://localhost:3000/api/workflow/access/regulator/${qrCode}?accessType=edit`)

      if (!accessResponse.data.success || !accessResponse.data.data.accessAllowed) {
        toast.error(accessResponse.data.data?.reason || 'Access denied to this batch')
        return
      }

      if (accessResponse.data.data.hasBeenProcessed) {
        toast.warning('This batch has already been reviewed. Showing previous decision.')
        setBatchData(accessResponse.data.data.batch)
        return
      }

      if (accessResponse.data.data.canEdit) {
        setBatchData(accessResponse.data.data.batch)
        toast.success('Batch data loaded for regulatory review!')
      } else {
        toast.error('Cannot review this batch at current workflow stage')
      }
    } catch (error) {
      toast.error('Failed to fetch batch data')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Approve compliance
  const approveCompliance = async (qrCodeToApprove, reason = 'Meets all regulatory standards') => {
    try {
      setLoading(true)
      const reviewData = {
        qrCode: qrCodeToApprove,
        decision: 'approved',
        reviewerId: `REV_${Date.now()}`,
        reviewer: {
          name: 'Regulatory Authority',
          regulatorId: 'REG_001',
          contact: '+91 9876543211',
          certification: 'FDA Approved',
          location: 'Regulatory Office'
        },
        reason: reason,
        timestamp: new Date().toISOString()
      }

      const response = await axios.post('http://localhost:3000/api/regulator/review', reviewData)

      if (response.data.success) {
        toast.success('Batch approved successfully!')
        // Refresh all data
        fetchDashboardStats()
        fetchComplianceData()
        fetchAvailableBatches()
        // Clear current batch data to force refresh
        setBatchData(null)
      } else {
        toast.error('Failed to approve batch')
      }
    } catch (error) {
      toast.error('Failed to approve compliance')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reject compliance
  const rejectCompliance = async (qrCodeToReject, reason = 'Does not meet regulatory standards') => {
    try {
      setLoading(true)
      const reviewData = {
        qrCode: qrCodeToReject,
        decision: 'rejected',
        reviewerId: `REV_${Date.now()}`,
        reviewer: {
          name: 'Regulatory Authority',
          regulatorId: 'REG_001',
          contact: '+91 9876543211',
          certification: 'FDA Approved',
          location: 'Regulatory Office'
        },
        reason: reason,
        timestamp: new Date().toISOString()
      }

      const response = await axios.post('http://localhost:3000/api/regulator/review', reviewData)

      if (response.data.success) {
        toast.error('Batch rejected')
        // Refresh all data
        fetchDashboardStats()
        fetchComplianceData()
        fetchAvailableBatches()
        // Clear current batch data to force refresh
        setBatchData(null)
      } else {
        toast.error('Failed to reject batch')
      }
    } catch (error) {
      toast.error('Failed to reject compliance')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const [historyResponse, pendingResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/regulator/history'),
        axios.get('http://localhost:3000/api/regulator/pending')
      ])

      if (historyResponse.data.success && pendingResponse.data.success) {
        const approved = historyResponse.data.data.approved || 0
        const rejected = historyResponse.data.data.rejected || 0
        const pending = pendingResponse.data.data.totalPending || 0
        const total = approved + rejected + pending
        const complianceRate = total > 0 ? ((approved / (approved + rejected)) * 100).toFixed(1) : 0

        setDashboardStats({
          approved,
          pending,
          rejected,
          complianceRate: parseFloat(complianceRate)
        })

        // Calculate common issues from rejected batches
        const rejectedBatches = historyResponse.data.data.batches?.filter(b => b.status === 'rejected') || []
        const totalRejected = rejectedBatches.length

        if (totalRejected > 0) {
          const issueCount = {
            'Pesticide Residue': 0,
            'Missing Documentation': 0,
            'Quality Standards': 0,
            'Traceability Gaps': 0
          }

          rejectedBatches.forEach(batch => {
            const reason = batch.regulatory?.reason || ''
            if (reason.toLowerCase().includes('pesticide') || reason.toLowerCase().includes('residue')) {
              issueCount['Pesticide Residue']++
            } else if (reason.toLowerCase().includes('documentation') || reason.toLowerCase().includes('certificate')) {
              issueCount['Missing Documentation']++
            } else if (reason.toLowerCase().includes('quality') || reason.toLowerCase().includes('standard')) {
              issueCount['Quality Standards']++
            } else {
              issueCount['Traceability Gaps']++
            }
          })

          setCommonIssues([
            { name: 'Pesticide Residue', percentage: Math.round((issueCount['Pesticide Residue'] / totalRejected) * 100) },
            { name: 'Missing Documentation', percentage: Math.round((issueCount['Missing Documentation'] / totalRejected) * 100) },
            { name: 'Quality Standards', percentage: Math.round((issueCount['Quality Standards'] / totalRejected) * 100) },
            { name: 'Traceability Gaps', percentage: Math.round((issueCount['Traceability Gaps'] / totalRejected) * 100) }
          ])
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  // Fetch compliance data from API
  const fetchComplianceData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/regulator/history')
      if (response.data.success) {
        const apiData = response.data.data.batches.map(batch => ({
          id: batch.id,
          qrCode: batch.target?.qrCode || batch.qrCode,
          product: batch.product?.name || 'Unknown',
          farmer: batch.events?.find(e => e.type === 'Collection')?.performer?.name || 'Unknown',
          processor: batch.events?.find(e => e.type === 'Processing')?.performer?.name || 'Unknown',
          lab: batch.events?.find(e => e.type === 'Laboratory Testing')?.performer?.name || 'Unknown',
          status: batch.status,
          submittedDate: batch.lastUpdated?.split('T')[0] || new Date().toISOString().split('T')[0],
          issues: batch.regulatory?.reason && batch.status === 'rejected' ? [batch.regulatory.reason] : [],
          grade: batch.certificate?.overallGrade || 'N/A',
          compliance: batch.certificate?.compliance || 'N/A'
        }))
        setComplianceData([...mockCompliance, ...apiData])
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error)
      // Fall back to mock data
      setComplianceData(mockCompliance)
    }
  }

  // Fetch available batches for regulatory review
  const fetchAvailableBatches = async () => {
    setDashboardLoading(true)
    try {
      const response = await axios.get('http://localhost:3000/api/regulator/pending')
      if (response.data.success) {
        const batches = response.data.data.batches || []
        // Transform batch data for display
        const transformedBatches = batches.map(batch => ({
          qrCode: batch.target?.qrCode || batch.qrCode,
          productName: batch.product?.name || batch.target?.productName || 'Unknown Product',
          farmer: batch.events?.find(e => e.type === 'Collection')?.performer?.name || 'Unknown Farmer',
          lab: batch.events?.find(e => e.type === 'Testing')?.performer?.name || 'Unknown Lab',
          quantity: batch.events?.find(e => e.type === 'Collection')?.details?.quantity || 'Unknown',
          testedAt: batch.events?.find(e => e.type === 'Testing')?.timestamp
            ? new Date(batch.events.find(e => e.type === 'Testing').timestamp).toLocaleDateString()
            : 'Recently',
          status: batch.workflowStatus || 'tested',
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

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
      fetchComplianceData()
      fetchAvailableBatches()
      const interval = setInterval(() => {
        fetchDashboardStats()
        fetchAvailableBatches()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-regulator-red-50 to-herb-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-regulator-red-600 mx-auto mb-4"></div>
          <p className="text-regulator-red-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <LoginForm
        onLogin={handleLogin}
        portalName="Regulatory Portal"
        portalIcon="🏛️"
        loading={loginLoading}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-regulator-red-50 to-herb-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-regulator-red-600 to-regulator-red-700 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-4xl">⚖️</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-regulator-red-600 to-regulator-red-800 bg-clip-text text-transparent">
                  TRACE HERB
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 font-medium">Regulatory Authority Portal</p>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-lg text-gray-600 font-medium">Compliance & Certification</p>
                <p className="text-sm text-gray-500">Regulatory Oversight</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Welcome</p>
                  <p className="font-semibold text-regulator-red-700">{user?.username || 'Regulator'}</p>
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

      {/* Navigation Tabs */}
      <div className="container mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'review', name: 'Batch Review', icon: '🔍' },
              { id: 'compliance', name: 'Compliance', icon: '✅' },
              { id: 'reports', name: 'Reports', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-regulator-red-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{dashboardLoading ? '...' : dashboardStats.approved}</h3>
                    <p className="text-gray-600">Approved Batches</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <span className="text-yellow-600 text-2xl">⏳</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{dashboardLoading ? '...' : dashboardStats.pending}</h3>
                    <p className="text-gray-600">Pending Review</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-red-600 text-2xl">❌</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{dashboardLoading ? '...' : dashboardStats.rejected}</h3>
                    <p className="text-gray-600">Rejected Batches</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-2xl">📈</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{dashboardLoading ? '...' : `${dashboardStats.complianceRate}%`}</h3>
                    <p className="text-gray-600">Compliance Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Automatic Batch Notifications */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-regulator-red-600 mr-3">🔔</span>
                Batches Ready for Review
              </h2>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Tested batches automatically appear here</p>
                    <p className="text-gray-600 mt-1">Review lab-tested batches for regulatory compliance</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-regulator-red-600">
                      {dashboardLoading ? '...' : availableBatches.length}
                    </div>
                    <div className="text-sm text-gray-500">Awaiting Review</div>
                  </div>
                </div>
                {/* Available Batches List */}
                {availableBatches.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">Tested Batches Ready for Review:</h4>
                    {availableBatches.map((batch, index) => (
                      <div
                        key={batch.qrCode || index}
                        className="p-4 bg-white rounded-lg border border-red-100 hover:border-red-300 cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => {
                          setActiveTab('review')
                          setQrCode(batch.qrCode)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 text-sm">🔬</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{batch.qrCode}</p>
                              <p className="text-sm text-gray-600">
                                {batch.productName} • Tested by {batch.lab} • {batch.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              Ready for Review
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{batch.testedAt}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-red-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-sm">⚖️</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">No tested batches available yet</p>
                        <p className="text-xs text-gray-600 mt-1">
                          When labs complete testing, batches will automatically appear here for regulatory review.
                          You can also manually enter QR codes in the Batch Review tab.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Regulatory Activities</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 text-2xl">📋</span>
                    </div>
                    <p className="text-gray-600 font-medium">No recent regulatory activities</p>
                    <p className="text-gray-500 text-sm mt-1">Activities will appear here as you review and approve batches</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Batch Review Tab */}
        {activeTab === 'review' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Batch Review & Inspection</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">
                    Enter QR Code for Regulatory Review *
                  </label>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="QR_COL_XXXXXXXXX_XXXXXXXX"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      required
                    />
                    <button
                      onClick={fetchBatchForReview}
                      disabled={loading || !qrCode.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Review Batch'}
                    </button>
                  </div>
                </div>

                {batchData && (
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Batch Details for Regulatory Review</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-gray-700 mb-2">Product Information</h4>
                        <div className="space-y-2 text-sm text-gray-900">
                          <div><strong className="text-gray-900">Product:</strong> {batchData.product?.name}</div>
                          <div><strong className="text-gray-900">Botanical Name:</strong> {batchData.product?.botanicalName}</div>
                          <div><strong className="text-gray-900">Batch Number:</strong> {batchData.target?.batchNumber}</div>
                          <div><strong className="text-gray-900">Status:</strong> {batchData.status || 'Under Review'}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-700 mb-2">Supply Chain Events</h4>
                        <div className="space-y-2 text-sm text-gray-900">
                          {batchData.events?.map((event, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-900">{event.type} - {event.performer?.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {batchData.certificate && (
                      <div className="mt-6 p-4 bg-green-50 rounded-xl">
                        <h4 className="font-bold text-green-800 mb-2">Laboratory Certificate</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-900">
                          <div><strong className="text-gray-900">Certificate ID:</strong> {batchData.certificate.certificateId}</div>
                          <div><strong className="text-gray-900">Grade:</strong> {batchData.certificate.overallGrade}</div>
                          <div><strong className="text-gray-900">Compliance:</strong> {batchData.certificate.compliance}</div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex space-x-4">
                      <button
                        onClick={() => approveCompliance(batchData.target?.qrCode || qrCode)}
                        className="btn-approve"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Approve Compliance'}
                      </button>
                      <button
                        onClick={() => rejectCompliance(batchData.target?.qrCode || qrCode, 'Requires additional documentation')}
                        className="btn-reject"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Reject Compliance'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance Management</h2>

              <div className="space-y-4">
                {complianceData.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{item.product}</h3>
                        <p className="text-gray-600">QR: {item.qrCode}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`status-badge ${
                          item.status === 'approved' ? 'status-approved' :
                          item.status === 'rejected' ? 'status-rejected' : 'status-pending'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">{item.submittedDate}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Farmer</p>
                        <p className="font-bold">{item.farmer}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Processor</p>
                        <p className="font-bold">{item.processor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Laboratory</p>
                        <p className="font-bold">{item.lab}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">Grade: <strong>{item.grade}</strong></span>
                        <span className="text-sm">Compliance: <strong>{item.compliance}</strong></span>
                      </div>

                      {item.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveCompliance(item.id)}
                            className="btn-approve text-sm px-4 py-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectCompliance(item.id, 'Requires review')}
                            className="btn-reject text-sm px-4 py-2"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {item.issues.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-bold text-red-800 mb-2">Issues Found:</p>
                        <ul className="text-sm text-red-700 space-y-1">
                          {item.issues.map((issue, index) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Regulatory Reports & Analytics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Compliance Summary</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                      <span className="font-bold text-green-800">Fully Compliant</span>
                      <span className="text-2xl font-bold text-green-600">{dashboardLoading ? '...' : dashboardStats.approved}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                      <span className="font-bold text-yellow-800">Under Review</span>
                      <span className="text-2xl font-bold text-yellow-600">{dashboardLoading ? '...' : dashboardStats.pending}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                      <span className="font-bold text-red-800">Non-Compliant</span>
                      <span className="text-2xl font-bold text-red-600">{dashboardLoading ? '...' : dashboardStats.rejected}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Common Issues</h3>

                  <div className="space-y-3">
                    {commonIssues.map((issue, index) => (
                      <div key={issue.name} className="flex items-center justify-between">
                        <span className="text-gray-700">{issue.name}</span>
                        <span className={`font-bold ${
                          index === 0 ? 'text-red-600' :
                          index === 1 ? 'text-orange-600' :
                          index === 2 ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {dashboardLoading ? '...' : `${issue.percentage}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-4">
                <button className="btn-primary">
                  Generate Full Report
                </button>
                <button className="btn-secondary">
                  Export Data
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Advanced Features Section */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">🏛 Advanced Regulatory Features</h2>

            {/* GS1 Global Standards */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">🌐 GS1 Global Standards</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Validate and implement GS1 global standards for product identification and traceability.
                  </p>
                </div>
                <button
                  onClick={() => setShowGS1Standards(!showGS1Standards)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showGS1Standards ? 'Hide Standards' : 'Show Standards'}
                </button>
              </div>

              {gs1Result && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🌐 GS1 Standards Validated</h4>
                  <p className="text-blue-700 text-sm">
                    Global standards compliance has been verified and documented.
                  </p>
                </div>
              )}
            </div>

            {showGS1Standards && (
              <GS1GlobalStandards
                onStandardsComplete={(result) => {
                  setGs1Result(result);
                  console.log('GS1 Standards Result:', result);
                }}
                batchData={batchData}
              />
            )}

            {/* Export Certificates */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">📋 Export Certificates</h3>
                  <p className="text-green-700 text-sm mb-3">
                    Generate and validate international export certificates and compliance documents.
                  </p>
                </div>
                <button
                  onClick={() => setShowExportCertificates(!showExportCertificates)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {showExportCertificates ? 'Hide Certificates' : 'Show Certificates'}
                </button>
              </div>

              {certificateResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">📋 Certificate Validated</h4>
                  <p className="text-green-700 text-sm">
                    Export certificate has been validated for regulatory compliance.
                  </p>
                </div>
              )}
            </div>

            {showExportCertificates && (
              <ExportCertificates
                mode="regulatory"
                onCertificateGenerated={(result) => {
                  setCertificateResult(result);
                  console.log('Regulatory Certificate Result:', result);
                }}
                batchData={batchData}
              />
            )}

          </motion.div>
        )}

      </div>
    </div>
  )
}
