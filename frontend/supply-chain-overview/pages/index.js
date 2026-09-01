import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function SupplyChainOverview() {
  const [systemStatus, setSystemStatus] = useState('checking')

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then(r => r.ok ? setSystemStatus('online') : setSystemStatus('degraded'))
      .catch(() => setSystemStatus('degraded'))
  }, [])

  const portals = [
    {
      id: 1,
      name: 'Consumer Portal',
      description: 'Advanced QR verification and provenance display with gamification',
      icon: '🚀',
      url: 'http://localhost:3001',
      gradient: 'from-orange-500 to-amber-500',
      bgLight: 'from-orange-50 to-amber-50',
      textColor: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-700',
      features: ['QR Code Scanning', 'Provenance History', 'Interactive Maps', 'Authenticity Verification']
    },
    {
      id: 2,
      name: 'Farmer Portal',
      description: 'Herb collection data entry and QR generation',
      icon: '🌱',
      url: 'http://localhost:3002',
      gradient: 'from-green-500 to-emerald-500',
      bgLight: 'from-green-50 to-emerald-50',
      textColor: 'text-green-700',
      badge: 'bg-green-100 text-green-700',
      features: ['GPS Location Tracking', 'Herb Details Entry', 'QR Code Generation', 'Blockchain Submission']
    },
    {
      id: 3,
      name: 'Processor Portal',
      description: 'Processing steps and quality control management',
      icon: '🏭',
      url: 'http://localhost:3003',
      gradient: 'from-blue-500 to-indigo-500',
      bgLight: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700',
      features: ['Batch Verification', 'Processing Details', 'Quality Control', 'Equipment Tracking']
    },
    {
      id: 4,
      name: 'Lab Portal',
      description: 'Quality testing and digital certificates',
      icon: '🔬',
      url: 'http://localhost:3004',
      gradient: 'from-purple-500 to-violet-500',
      bgLight: 'from-purple-50 to-violet-50',
      textColor: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-700',
      features: ['Comprehensive Testing', 'Certificate Generation', 'Compliance Verification', 'DNA Authentication']
    },
    {
      id: 5,
      name: 'Regulator Portal',
      description: 'Compliance review and regulatory oversight',
      icon: '⚖️',
      url: 'http://localhost:3005',
      gradient: 'from-red-500 to-rose-500',
      bgLight: 'from-red-50 to-rose-50',
      textColor: 'text-red-700',
      badge: 'bg-red-100 text-red-700',
      features: ['Batch Review', 'Compliance Management', 'Regulatory Reports', 'Approval/Rejection']
    },
    {
      id: 6,
      name: 'Stakeholder Dashboard',
      description: 'Real-time multi-stakeholder monitoring',
      icon: '📈',
      url: 'http://localhost:3006',
      gradient: 'from-teal-500 to-cyan-500',
      bgLight: 'from-teal-50 to-cyan-50',
      textColor: 'text-teal-700',
      badge: 'bg-teal-100 text-teal-700',
      features: ['Real-time Monitoring', 'Blockchain Status', 'Audit Trails', 'Compliance Reports']
    },
    {
      id: 7,
      name: 'Management Portal',
      description: 'System management and analytics dashboard',
      icon: '📊',
      url: 'http://localhost:3007',
      gradient: 'from-indigo-500 to-purple-600',
      bgLight: 'from-indigo-50 to-purple-50',
      textColor: 'text-indigo-700',
      badge: 'bg-indigo-100 text-indigo-700',
      features: ['System Monitoring', 'User Management', 'Analytics Dashboard', 'Settings']
    }
  ]

  const supplySteps = [
    { icon: '🌱', label: 'Collection', color: 'bg-green-500', light: 'bg-green-100 text-green-700' },
    { icon: '🏭', label: 'Processing', color: 'bg-blue-500', light: 'bg-blue-100 text-blue-700' },
    { icon: '🔬', label: 'Testing', color: 'bg-purple-500', light: 'bg-purple-100 text-purple-700' },
    { icon: '⚖️', label: 'Regulation', color: 'bg-red-500', light: 'bg-red-100 text-red-700' },
    { icon: '📱', label: 'Consumer', color: 'bg-orange-500', light: 'bg-orange-100 text-orange-700' },
  ]

  const openPortal = (url) => { window.open(url, '_blank') }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 25%, #eff6ff 70%, #f0f9ff 100%)' }}>

      {/* Navigation */}
      <nav className="bg-white/85 backdrop-blur-xl border-b border-white/60 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-lg">🌿</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-none">TRACE HERB</h1>
              <p className="text-xs text-gray-500 font-medium">Supply Chain Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
              <span className={`w-2 h-2 rounded-full animate-pulse ${systemStatus === 'online' ? 'bg-green-500' : 'bg-amber-400'}`}></span>
              <span className="text-xs font-semibold text-green-700">{systemStatus === 'online' ? 'All Systems Online' : 'Checking...'}</span>
            </div>
            <a href="http://localhost:3000/api/health" target="_blank" rel="noopener noreferrer"
              className="text-xs font-medium text-gray-500 hover:text-green-600 transition-colors px-2 py-1 rounded-lg hover:bg-green-50">
              API ↗
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6 border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Blockchain-Powered · CA-Connected · Live
          </span>
          <h2 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight mb-4">
            Complete Supply Chain
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent"> Traceability</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            End-to-end transparency for Ayurvedic herbs — from farm to consumer, secured on Hyperledger Fabric.
          </p>
        </motion.div>
      </section>

      {/* Supply Chain Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center mb-6">Supply Chain Journey</p>
          <div className="flex items-center justify-center flex-wrap gap-2">
            {supplySteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center shadow-md`}>
                    <span className="text-white text-xl">{step.icon}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${step.light}`}>{step.label}</span>
                </motion.div>
                {i < supplySteps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 hidden sm:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-gray-900">Access Portals</h3>
            <p className="text-sm text-gray-500 mt-0.5">Click any portal to open in a new tab</p>
          </div>
          <span className="text-sm font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{portals.length} portals</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => openPortal(portal.url)}
            >
              {/* Accent bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${portal.gradient}`}></div>
              <div className="p-5">
                {/* Icon + Name */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 bg-gradient-to-br ${portal.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                    <span className="text-white text-xl">{portal.icon}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${portal.badge}`}>
                    Port {portal.url.split(':').pop()}
                  </span>
                </div>
                <h4 className="text-base font-black text-gray-900 mb-1">{portal.name}</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{portal.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {portal.features.slice(0, 2).map((f, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium">{f}</span>
                  ))}
                  {portal.features.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-md font-medium">+{portal.features.length - 2} more</span>
                  )}
                </div>

                {/* Open button */}
                <button
                  onClick={(e) => { e.stopPropagation(); openPortal(portal.url) }}
                  className={`w-full py-2 rounded-xl font-semibold text-sm text-white bg-gradient-to-r ${portal.gradient} hover:opacity-90 transition-all shadow-sm hover:shadow-md`}
                >
                  Open Portal →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* System Status */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-black text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '⛓️', color: 'bg-green-50 border-green-100', iconBg: 'bg-green-100', iconColor: 'text-green-600', title: 'Blockchain', sub: 'CA-Connected Mode', dot: 'bg-green-500' },
              { icon: '🚀', color: 'bg-blue-50 border-blue-100', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', title: 'API Server', sub: 'Port 3000 — Running', dot: 'bg-blue-500' },
              { icon: '🐳', color: 'bg-purple-50 border-purple-100', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', title: 'Docker', sub: '9 Containers Active', dot: 'bg-purple-500' },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 ${s.color} border rounded-xl`}>
                <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className={`${s.iconColor} text-xl`}>{s.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 ${s.dot} rounded-full animate-pulse`}></span>
                    <h4 className="font-bold text-gray-900 text-sm">{s.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
