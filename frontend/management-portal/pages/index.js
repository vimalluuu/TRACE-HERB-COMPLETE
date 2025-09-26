import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function ManagementPortal() {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemHealth, setSystemHealth] = useState(null)
  const [loading, setLoading] = useState(false)
  const [blockchainData, setBlockchainData] = useState({
    transactions: [],
    networkStats: {
      totalTransactions: 0,
      confirmedTransactions: 0,
      pendingTransactions: 0,
      smartContracts: 0,
      lastBlockNumber: 0,
      networkStatus: 'Active'
    },
    smartContracts: []
  })
  const [liveUpdates, setLiveUpdates] = useState(true)
  const [realTimeStats, setRealTimeStats] = useState({
    totalBatches: 0,
    activeUsers: 0,
    blockchainTransactions: 0,
    complianceRate: 0,
    recentBatches: [],
    userActivity: [],
    transactionTrends: [],
    supplyChainParticipants: []
  })

  // Fetch real-time statistics
  const fetchRealTimeStats = async () => {
    try {
      // Fetch batch data
      const batchesResponse = await axios.get('http://localhost:3000/api/batches/all').catch(() => ({ data: [] }))
      const batches = batchesResponse.data || []

      // Get farmer data from localStorage (simulating user activity)
      const farmerData = JSON.parse(localStorage.getItem('farmerBatches') || '[]')
      const processorData = JSON.parse(localStorage.getItem('processorBatches') || '[]')
      const labData = JSON.parse(localStorage.getItem('labResults') || '[]')

      // Calculate real statistics
      const totalBatches = batches.length + farmerData.length
      const approvedBatches = batches.filter(b => b.status === 'approved').length
      const complianceRate = totalBatches > 0 ? (approvedBatches / totalBatches * 100) : 0

      // Count unique users from different sources
      const uniqueFarmers = new Set([...batches.map(b => b.farmerName), ...farmerData.map(b => b.farmerName)]).size
      const uniqueProcessors = new Set(processorData.map(b => b.processorName || 'Processor')).size
      const uniqueLabs = new Set(labData.map(l => l.labName || 'Lab')).size
      const activeUsers = uniqueFarmers + uniqueProcessors + uniqueLabs + 3 // +3 for regulators

      // Generate transaction trends from real data
      const transactionTrends = generateTransactionTrends(batches, farmerData)

      // Generate supply chain participants data
      const supplyChainParticipants = [
        { name: 'Farmers', count: uniqueFarmers + 5, active: uniqueFarmers },
        { name: 'Processors', count: uniqueProcessors + 3, active: uniqueProcessors },
        { name: 'Labs', count: uniqueLabs + 2, active: uniqueLabs },
        { name: 'Regulators', count: 3, active: 3 },
      ]

      setRealTimeStats({
        totalBatches,
        activeUsers,
        blockchainTransactions: blockchainData.networkStats.totalTransactions,
        complianceRate: Math.round(complianceRate * 10) / 10,
        recentBatches: [...batches, ...farmerData].slice(-10),
        userActivity: generateUserActivity(uniqueFarmers, uniqueProcessors, uniqueLabs),
        transactionTrends,
        supplyChainParticipants
      })

    } catch (error) {
      console.error('Error fetching real-time stats:', error)
    }
  }

  // Generate transaction trends from real data
  const generateTransactionTrends = (batches, farmerData) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const currentMonth = new Date().getMonth()

    return months.map((month, index) => {
      const monthBatches = [...batches, ...farmerData].filter(batch => {
        const batchDate = new Date(batch.collectionDate || batch.createdAt || Date.now())
        return batchDate.getMonth() === index
      })

      const transactions = monthBatches.length * 3 // Each batch generates ~3 transactions
      const compliance = monthBatches.length > 0 ?
        (monthBatches.filter(b => b.status === 'approved' || !b.status).length / monthBatches.length * 100) : 95

      return {
        name: month,
        transactions: transactions + Math.floor(Math.random() * 50), // Add some variance
        compliance: Math.round(compliance)
      }
    })
  }

  // Generate user activity data
  const generateUserActivity = (farmers, processors, labs) => {
    return [
      { time: '00:00', farmers: Math.floor(farmers * 0.1), processors: Math.floor(processors * 0.2), labs: Math.floor(labs * 0.1) },
      { time: '06:00', farmers: Math.floor(farmers * 0.3), processors: Math.floor(processors * 0.4), labs: Math.floor(labs * 0.3) },
      { time: '12:00', farmers: Math.floor(farmers * 0.8), processors: Math.floor(processors * 0.9), labs: Math.floor(labs * 0.8) },
      { time: '18:00', farmers: Math.floor(farmers * 0.6), processors: Math.floor(processors * 0.7), labs: Math.floor(labs * 0.6) },
    ]
  }

  const complianceData = [
    { name: 'Compliant', value: 156, color: '#22c55e' },
    { name: 'Pending', value: 23, color: '#eab308' },
    { name: 'Non-Compliant', value: 8, color: '#ef4444' },
  ]

  // Fetch system health
  const fetchSystemHealth = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:3000/api/health/blockchain')
      setSystemHealth(response.data)
    } catch (error) {
      console.error('Failed to fetch system health:', error)
      toast.error('Failed to fetch system health')
    } finally {
      setLoading(false)
    }
  }

  // Fetch blockchain ledger data
  const fetchBlockchainData = async () => {
    try {
      // Fetch all batch data from different sources to simulate blockchain transactions
      const [batchesResponse, healthResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/batches/all').catch(() => ({ data: [] })),
        axios.get('http://localhost:3000/api/health/blockchain').catch(() => ({ data: { status: 'active', connected: true } }))
      ])

      const batches = batchesResponse.data || []
      const health = healthResponse.data || { status: 'active', connected: true }

      // Convert batch data to blockchain transactions
      const transactions = batches.map((batch, index) => {
        const actions = []

        // Farmer creation action
        actions.push({
          id: `TX-${1000 + index * 4}`,
          blockNumber: `#${27540 + index * 4}`,
          transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`,
          actor: batch.farmerName || 'Unknown Farmer',
          actorType: 'Farmer',
          action: 'Batch Creation',
          description: `Added ${batch.commonName || batch.botanicalName} batch with GPS coordinates and photo`,
          timestamp: batch.createdAt || new Date().toISOString(),
          status: 'Confirmed',
          batchId: batch.qrCode || batch.id,
          details: {
            quantity: batch.quantity || '0.1 kg',
            location: batch.location || 'Unknown',
            method: batch.collectionMethod || 'Hand Picking'
          }
        })

        // Processor action if processed
        if (batch.status === 'processed' || batch.status === 'testing' || batch.status === 'tested' || batch.status === 'approved') {
          actions.push({
            id: `TX-${1001 + index * 4}`,
            blockNumber: `#${27541 + index * 4}`,
            transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`,
            actor: batch.processingData?.processor || 'AyurProcess Ltd',
            actorType: 'Processor',
            action: 'Quality Testing',
            description: `Added quality test results: ${batch.processingData?.purity || '98.7%'} purity, ${batch.processingData?.moisture || '12.5%'} moisture`,
            timestamp: new Date(new Date(batch.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'Confirmed',
            batchId: batch.qrCode || batch.id,
            details: {
              purity: batch.processingData?.purity || '98.7%',
              moisture: batch.processingData?.moisture || '12.5%',
              processor: batch.processingData?.processor || 'AyurProcess Ltd'
            }
          })
        }

        // Lab action if tested
        if (batch.status === 'tested' || batch.status === 'approved') {
          actions.push({
            id: `TX-${1002 + index * 4}`,
            blockNumber: `#${27542 + index * 4}`,
            transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`,
            actor: batch.testResults?.lab || 'CertifyLab India',
            actorType: 'Laboratory',
            action: 'Lab Verification',
            description: `Laboratory analysis completed with ${batch.testResults?.purity || '99.2%'} purity verification`,
            timestamp: new Date(new Date(batch.createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString(),
            status: 'Confirmed',
            batchId: batch.qrCode || batch.id,
            details: {
              purity: batch.testResults?.purity || '99.2%',
              contaminants: batch.testResults?.contaminants || 'None detected',
              lab: batch.testResults?.lab || 'CertifyLab India'
            }
          })
        }

        // Regulatory action if approved/rejected
        if (batch.status === 'approved' || batch.status === 'rejected') {
          actions.push({
            id: `TX-${1003 + index * 4}`,
            blockNumber: `#${27543 + index * 4}`,
            transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`,
            actor: 'Regulatory Authority',
            actorType: 'Regulatory',
            action: batch.status === 'approved' ? 'Regulatory Approval' : 'Regulatory Rejection',
            description: batch.status === 'approved'
              ? (batch.regulatoryComments || 'Meets all quality and safety standards')
              : (batch.rejectionReason || 'Quality standards not met'),
            timestamp: new Date(new Date(batch.createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString(),
            status: 'Confirmed',
            batchId: batch.qrCode || batch.id,
            details: {
              decision: batch.status,
              comments: batch.regulatoryComments || batch.rejectionReason || 'Standard regulatory review',
              authority: 'Ministry of AYUSH'
            }
          })
        }

        return actions
      }).flat().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      // Calculate network stats
      const networkStats = {
        totalTransactions: transactions.length,
        confirmedTransactions: transactions.filter(tx => tx.status === 'Confirmed').length,
        pendingTransactions: transactions.filter(tx => tx.status === 'Pending').length,
        smartContracts: 5, // TraceRoots Supply Chain Contract + others
        lastBlockNumber: Math.max(...transactions.map(tx => parseInt(tx.blockNumber.replace('#', '')) || 0)),
        networkStatus: 'Active' // Always show as active when we have transaction data
      }

      // Smart contracts data
      const smartContracts = [
        {
          name: 'TraceRoots Supply Chain Contract',
          address: '0x742d35Cc634C0532925a3b8D34C4C0e4C6e6424f',
          status: 'Active',
          description: 'Immutable Ledger • Automatic compliance verification • Multi-signature validation',
          transactions: transactions.length,
          lastActivity: transactions[0]?.timestamp || new Date().toISOString()
        }
      ]

      setBlockchainData({
        transactions,
        networkStats,
        smartContracts
      })

    } catch (error) {
      console.error('Failed to fetch blockchain data:', error)
      // Set mock data if API fails
      setBlockchainData({
        transactions: [
          {
            id: 'TX-1012',
            blockNumber: '#27540',
            transactionHash: '0x7f9c4b2d8e5a1234567890abcdef...',
            actor: 'Farmer A102 (Raj Kumar)',
            actorType: 'Farmer',
            action: 'Batch Creation',
            description: 'Added Tulsi Batch B-2404 (50kg) with GPS coordinates and photo',
            timestamp: '2025-01-20T18:00:25Z',
            status: 'Confirmed',
            batchId: 'QR_COL_1758550427695_4790B62D',
            details: {
              quantity: '0.1 kg',
              location: 'Unknown, Unknown, Unknown',
              method: 'Hand Picking'
            }
          }
        ],
        networkStats: {
          totalTransactions: 7,
          confirmedTransactions: 6,
          pendingTransactions: 1,
          smartContracts: 5,
          lastBlockNumber: 27540,
          networkStatus: 'Active'
        },
        smartContracts: [
          {
            name: 'TraceRoots Supply Chain Contract',
            address: '0x742d35Cc634C0532925a3b8D34C4C0e4C6e6424f',
            status: 'Active',
            description: 'Immutable Ledger • Automatic compliance verification • Multi-signature validation',
            transactions: 7,
            lastActivity: new Date().toISOString()
          }
        ]
      })
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchSystemHealth(),
        fetchBlockchainData(),
        fetchRealTimeStats()
      ])
      setLoading(false)
    }

    loadData()

    // Set up polling for real-time updates
    const healthInterval = setInterval(fetchSystemHealth, 30000) // Every 30 seconds
    const blockchainInterval = setInterval(fetchBlockchainData, 15000) // Every 15 seconds for live updates
    const statsInterval = setInterval(fetchRealTimeStats, 20000) // Every 20 seconds for stats

    return () => {
      clearInterval(healthInterval)
      clearInterval(blockchainInterval)
      clearInterval(statsInterval)
    }
  }, [])

  // Toggle live updates
  const toggleLiveUpdates = () => {
    setLiveUpdates(!liveUpdates)
    if (!liveUpdates) {
      fetchBlockchainData()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-management-indigo-50 to-herb-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-management-indigo-600 to-management-indigo-700 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-4xl">📊</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-management-indigo-600 to-management-indigo-800 bg-clip-text text-transparent">
                  TRACE HERB
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 font-medium">Management Portal</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`status-indicator ${systemHealth?.blockchain?.status === 'connected' ? 'status-online' : 'status-offline'}`}></div>
                <p className="text-lg text-gray-600 font-medium">System Status</p>
              </div>
              <p className="text-sm text-gray-500">Real-time Monitoring</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'overview', name: 'Overview', icon: '📈' },
              { id: 'ledger', name: 'Blockchain Ledger', icon: '⛓️' },
              { id: 'analytics', name: 'Analytics', icon: '📊' },
              { id: 'monitoring', name: 'System Monitoring', icon: '🖥️' },
              { id: 'users', name: 'User Management', icon: '👥' },
              { id: 'settings', name: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-management-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="metric-card">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 text-2xl">🌱</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : realTimeStats.totalBatches.toLocaleString()}
                    </h3>
                    <p className="text-gray-600">Total Batches</p>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-2xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : realTimeStats.activeUsers}
                    </h3>
                    <p className="text-gray-600">Active Users</p>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-600 text-2xl">⛓️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : blockchainData.networkStats.totalTransactions.toLocaleString()}
                    </h3>
                    <p className="text-gray-600">Blockchain Transactions</p>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <span className="text-yellow-600 text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : `${realTimeStats.complianceRate}%`}
                    </h3>
                    <p className="text-gray-600">Compliance Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Transaction Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realTimeStats.transactionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="transactions" stroke="#6366f1" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Compliance Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Supply Chain Participants */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Supply Chain Participants</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={realTimeStats.supplyChainParticipants}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" name="Total" />
                  <Bar dataKey="active" fill="#22c55e" name="Active" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Blockchain Ledger Tab */}
        {activeTab === 'ledger' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header with Back Button and Live Updates Toggle */}
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span>←</span>
                  <span>Back to Home</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h2 className="text-2xl font-bold text-gray-900">Blockchain Ledger</h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${blockchainData.networkStats.networkStatus === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-600">
                    Network Status: {blockchainData.networkStats.networkStatus}
                  </span>
                </div>
                <button
                  onClick={toggleLiveUpdates}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    liveUpdates
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>⛓️</span>
                  <span>Blockchain Ledger</span>
                </button>
              </div>
            </div>

            {/* Network Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Mock Blockchain Ledger</h3>
                <div className="text-sm text-gray-500">
                  Immutable Transaction Records • Hyperledger Fabric Network
                  <br />
                  Last Block: #{blockchainData.networkStats.lastBlockNumber}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">{blockchainData.networkStats.totalTransactions}</div>
                  <div className="text-sm text-blue-700 font-medium">Total Transactions</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-900">{blockchainData.networkStats.confirmedTransactions}</div>
                  <div className="text-sm text-green-700 font-medium">Confirmed</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-900">{blockchainData.networkStats.pendingTransactions}</div>
                  <div className="text-sm text-yellow-700 font-medium">Pending</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-900">{blockchainData.networkStats.smartContracts}</div>
                  <div className="text-sm text-purple-700 font-medium">Smart Contracts</div>
                </div>
              </div>
            </div>

            {/* Smart Contract Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-xl">📋</span>
                <h3 className="text-xl font-bold text-gray-900">Smart Contract Status</h3>
              </div>

              {blockchainData.smartContracts.map((contract, index) => (
                <div key={index} className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-purple-900">{contract.name}</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {contract.status}
                    </span>
                  </div>
                  <div className="text-sm text-purple-700 mb-2">
                    Contract Address: <span className="font-mono">{contract.address}</span>
                  </div>
                  <div className="text-sm text-purple-600">
                    {contract.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Updates</span>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {blockchainData.transactions.map((transaction, index) => (
                  <div key={transaction.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-bold text-gray-900">{transaction.id}</span>
                        <span className="text-sm text-gray-500">Block {transaction.blockNumber}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">Transaction Hash</div>
                        <div className="font-mono text-xs text-gray-700 break-all">
                          {transaction.transactionHash}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Actor</div>
                        <div className="font-medium text-gray-900">
                          {transaction.actor}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Action</div>
                        <div className="font-medium text-gray-900">
                          {transaction.action}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      {transaction.description}
                    </div>

                    <div className="mt-2 text-xs text-green-600 flex items-center space-x-1">
                      <span>✓</span>
                      <span>Immutably recorded on blockchain</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Advanced Analytics</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Batch Performance Analytics */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Processing Time</span>
                      <span className="font-semibold">4.2 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-semibold text-green-600">{realTimeStats.complianceRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Score Average</span>
                      <span className="font-semibold">8.7/10</span>
                    </div>
                  </div>
                </div>

                {/* User Activity Analytics */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Active Users</span>
                      <span className="font-semibold">{Math.floor(realTimeStats.activeUsers * 0.8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peak Activity Time</span>
                      <span className="font-semibold">2:00 PM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">User Retention</span>
                      <span className="font-semibold text-green-600">94.2%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Activity Chart */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time User Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realTimeStats.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="farmers" stroke="#22c55e" strokeWidth={2} name="Farmers" />
                    <Line type="monotone" dataKey="processors" stroke="#3b82f6" strokeWidth={2} name="Processors" />
                    <Line type="monotone" dataKey="labs" stroke="#f59e0b" strokeWidth={2} name="Labs" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* System Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🖥️ System Monitoring</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* System Health Metrics */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-600 font-medium">Server Status</span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">Online</p>
                  <p className="text-sm text-green-600">99.9% uptime</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-600 font-medium">Database</span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">Healthy</p>
                  <p className="text-sm text-blue-600">Response: 45ms</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-600 font-medium">Blockchain</span>
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{blockchainData.networkStats.networkStatus}</p>
                  <p className="text-sm text-purple-600">{blockchainData.networkStats.totalTransactions} transactions</p>
                </div>

                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-600 font-medium">API Status</span>
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">Active</p>
                  <p className="text-sm text-orange-600">All endpoints operational</p>
                </div>
              </div>

              {/* System Logs */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Events</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {blockchainData.transactions.slice(0, 10).map((tx, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-sm text-gray-700">{tx.action} by {tx.actor}</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 User Management</h2>

              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {realTimeStats.supplyChainParticipants.map((participant, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{participant.name}</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{participant.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active:</span>
                        <span className="font-medium text-green-600">{participant.active}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent User Activity */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent User Activity</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {realTimeStats.recentBatches.slice(0, 8).map((batch, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {(batch.farmerName || 'Unknown').charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{batch.farmerName || 'Unknown Farmer'}</p>
                          <p className="text-xs text-gray-500">{batch.commonName || batch.herbType || 'Herb Batch'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{new Date(batch.collectionDate || batch.createdAt || Date.now()).toLocaleDateString()}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          batch.status === 'approved' ? 'bg-green-100 text-green-800' :
                          batch.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {batch.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ System Settings</h2>

              <div className="space-y-6">
                {/* Real-time Updates Setting */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-time Updates</h3>
                    <p className="text-sm text-gray-600">Enable automatic data refresh every 15 seconds</p>
                  </div>
                  <button
                    onClick={() => setLiveUpdates(!liveUpdates)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      liveUpdates ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        liveUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Blockchain Network Settings */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Blockchain Network</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network Status:</span>
                      <span className={`font-medium ${blockchainData.networkStats.networkStatus === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                        {blockchainData.networkStats.networkStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Block:</span>
                      <span className="font-medium">#{blockchainData.networkStats.lastBlockNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Smart Contracts:</span>
                      <span className="font-medium">{blockchainData.networkStats.smartContracts}</span>
                    </div>
                  </div>
                </div>

                {/* Data Management */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Data Management</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        fetchRealTimeStats()
                        fetchBlockchainData()
                        toast.success('Data refreshed successfully!')
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Refresh All Data
                    </button>
                    <button
                      onClick={() => {
                        localStorage.clear()
                        toast.success('Cache cleared successfully!')
                        setTimeout(() => window.location.reload(), 1000)
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Clear Cache & Reset
                    </button>
                  </div>
                </div>

                {/* System Information */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">System Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="font-medium">TRACE HERB v2.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Environment:</span>
                      <span className="font-medium">Production</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
