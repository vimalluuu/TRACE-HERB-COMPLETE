import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function ManagementPortal() {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemHealth, setSystemHealth] = useState(null)
  const [loading, setLoading] = useState(false)

  // Mock data for charts
  const transactionData = [
    { name: 'Jan', transactions: 120, compliance: 95 },
    { name: 'Feb', transactions: 150, compliance: 97 },
    { name: 'Mar', transactions: 180, compliance: 94 },
    { name: 'Apr', transactions: 200, compliance: 96 },
    { name: 'May', transactions: 240, compliance: 98 },
    { name: 'Jun', transactions: 280, compliance: 97 },
  ]

  const supplyChainData = [
    { name: 'Farmers', count: 45, active: 42 },
    { name: 'Processors', count: 12, active: 11 },
    { name: 'Labs', count: 8, active: 8 },
    { name: 'Regulators', count: 3, active: 3 },
  ]

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

  useEffect(() => {
    fetchSystemHealth()
    // Set up polling for real-time updates
    const interval = setInterval(fetchSystemHealth, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

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
                    <h3 className="text-2xl font-bold text-gray-900">1,247</h3>
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
                    <h3 className="text-2xl font-bold text-gray-900">68</h3>
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
                    <h3 className="text-2xl font-bold text-gray-900">3,891</h3>
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
                    <h3 className="text-2xl font-bold text-gray-900">96.8%</h3>
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
                  <LineChart data={transactionData}>
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
                <BarChart data={supplyChainData}>
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

        {/* Additional tabs will be added in the next part */}
        
      </div>
    </div>
  )
}
