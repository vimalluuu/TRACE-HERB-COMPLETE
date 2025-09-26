import { motion } from 'framer-motion'

export default function SupplyChainOverview() {
  const portals = [
    {
      id: 1,
      name: 'Enhanced Consumer Portal',
      description: 'Advanced QR verification and provenance display with gamification',
      icon: '🚀',
      url: 'http://localhost:3001',
      color: 'from-orange-500 to-orange-600',
      features: ['QR Code Scanning', 'Provenance History', 'Interactive Maps', 'Authenticity Verification']
    },
    {
      id: 2,
      name: 'Farmer Portal',
      description: 'Herb collection data entry and QR generation',
      icon: '🌱',
      url: 'http://localhost:4005',
      color: 'from-green-500 to-green-600',
      features: ['GPS Location Tracking', 'Herb Details Entry', 'QR Code Generation', 'Blockchain Submission']
    },
    {
      id: 3,
      name: 'Processor Portal',
      description: 'Processing steps and quality control',
      icon: '🏭',
      url: 'http://localhost:3003',
      color: 'from-blue-500 to-blue-600',
      features: ['Batch Verification', 'Processing Details', 'Quality Control', 'Equipment Tracking']
    },
    {
      id: 4,
      name: 'Lab Portal',
      description: 'Quality testing and digital certificates',
      icon: '🔬',
      url: 'http://localhost:3004',
      color: 'from-purple-500 to-purple-600',
      features: ['Comprehensive Testing', 'Certificate Generation', 'Compliance Verification', 'DNA Authentication']
    },
    {
      id: 5,
      name: 'Regulator Portal',
      description: 'Compliance review and regulatory oversight',
      icon: '⚖️',
      url: 'http://localhost:3005',
      color: 'from-red-500 to-red-600',
      features: ['Batch Review', 'Compliance Management', 'Regulatory Reports', 'Approval/Rejection']
    },
    {
      id: 6,
      name: 'Stakeholder Dashboard',
      description: 'Real-time multi-stakeholder monitoring',
      icon: '📈',
      url: 'http://localhost:3006',
      color: 'from-teal-500 to-teal-600',
      features: ['Real-time Monitoring', 'Blockchain Status', 'Audit Trails', 'Compliance Reports']
    },
    {
      id: 7,
      name: 'Management Portal',
      description: 'System management and analytics dashboard',
      icon: '📊',
      url: 'http://localhost:3007',
      color: 'from-indigo-500 to-purple-600',
      features: ['System Monitoring', 'User Management', 'Analytics Dashboard', 'Settings']
    }
  ]

  const openPortal = (url) => {
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-herb-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-herb-green-600 to-herb-green-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-white font-bold text-5xl">🌿</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-herb-green-600 to-herb-green-800 bg-clip-text text-transparent mb-4">
              TRACE HERB
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 font-medium">
              Complete Supply Chain Traceability System
            </p>
            <p className="text-lg text-gray-500 mt-2">
              Blockchain-powered transparency from farm to consumer
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Supply Chain Flow */}
        <div className="mb-16">
          <h2 className="text-4xl font-black text-center text-gray-900 mb-12">
            Complete Supply Chain Flow
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <span className="text-green-600 text-2xl">🌱</span>
              </div>
              <span className="text-xl font-bold text-gray-700">Farmer</span>
            </div>
            
            <div className="text-4xl text-gray-400">→</div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-blue-600 text-2xl">🏭</span>
              </div>
              <span className="text-xl font-bold text-gray-700">Processor</span>
            </div>
            
            <div className="text-4xl text-gray-400">→</div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                <span className="text-purple-600 text-2xl">🔬</span>
              </div>
              <span className="text-xl font-bold text-gray-700">Laboratory</span>
            </div>
            
            <div className="text-4xl text-gray-400">→</div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                <span className="text-orange-600 text-2xl">📱</span>
              </div>
              <span className="text-xl font-bold text-gray-700">Consumer</span>
            </div>
          </div>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="portal-card"
            >
              <div className="text-center mb-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${portal.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                  <span className="text-white text-4xl">{portal.icon}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{portal.name}</h3>
                <p className="text-gray-600 text-lg">{portal.description}</p>
              </div>
              
              <div className="space-y-3 mb-8">
                {portal.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-herb-green-500 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => openPortal(portal.url)}
                className={`w-full btn-portal bg-gradient-to-r ${portal.color} text-white hover:opacity-90`}
              >
                Open Portal
              </button>
            </motion.div>
          ))}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">System Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-2xl">⛓️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800">Blockchain</h3>
                  <p className="text-green-600">CA-Connected Mode</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800">API Server</h3>
                  <p className="text-blue-600">Port 3000 - Running</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-2xl">🐳</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-800">Docker</h3>
                  <p className="text-purple-600">9 Containers Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
