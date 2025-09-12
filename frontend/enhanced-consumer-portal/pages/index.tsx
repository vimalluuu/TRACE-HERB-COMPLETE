import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCodeIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BeakerIcon,
  UserGroupIcon,
  SparklesIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  HomeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Toaster } from 'react-hot-toast'
import BlockchainStatus from '../components/BlockchainStatus'
import PortalNavigation from '../components/PortalNavigation'
import WorkingProvenanceDisplay from '../components/WorkingProvenanceDisplay'
import QRScanner from '../components/QRScanner'
import BatchTracker from '../components/BatchTracker'
import { useAuth } from '../lib/useAuth'

interface RecentScan {
  qrCode: string
  productName: string
  timestamp: number
  verified: boolean
}

const HomePage: React.FC = () => {
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuth()
  const [showScanner, setShowScanner] = useState(false)
  const [currentQRCode, setCurrentQRCode] = useState<string | null>(null)
  const [manualQRInput, setManualQRInput] = useState('')
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [showBatchTracker, setShowBatchTracker] = useState(false)
  const [trackingBatchId, setTrackingBatchId] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load recent scans from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('trace-herb-recent-scans')
    if (saved) {
      try {
        setRecentScans(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent scans:', error)
      }
    }
  }, [])

  // Save recent scans to localStorage
  const saveRecentScan = (qrCode: string, productName: string) => {
    const newScan: RecentScan = {
      qrCode,
      productName,
      timestamp: Date.now(),
      verified: true
    }

    const updatedScans = [newScan, ...recentScans.filter(scan => scan.qrCode !== qrCode)].slice(0, 5)
    setRecentScans(updatedScans)
    localStorage.setItem('trace-herb-recent-scans', JSON.stringify(updatedScans))
  }

  // Handle QR code scan
  const handleQRScan = (qrCode: string) => {
    setCurrentQRCode(qrCode)
    setShowScanner(false)
    // Don't save to recent scans immediately - wait for provenance data to load
  }

  // Handle manual QR input
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualQRInput.trim()) {
      handleQRScan(manualQRInput.trim())
      setManualQRInput('')
    }
  }

  // Handle successful provenance load
  const handleProvenanceLoaded = (qrCode: string, productName: string) => {
    saveRecentScan(qrCode, productName)
  }

  // Handle batch tracking
  const handleTrackBatch = (batchId: string) => {
    setTrackingBatchId(batchId)
    setShowBatchTracker(true)
  }

  // Extract batch ID from QR code
  const extractBatchId = (qrCode: string) => {
    // Try to extract batch ID from various QR code formats
    if (qrCode.includes('TH-2024-')) {
      const match = qrCode.match(/TH-2024-\d{3}/)
      return match ? match[0] : null
    }
    if (qrCode.startsWith('TH-')) {
      return qrCode
    }
    return null
  }

  // Demo QR codes for testing
  const demoQRCodes = [
    { code: 'TH-2024-001', name: 'Turmeric Batch', origin: 'Kerala' },
    { code: 'QR_DEMO_ASHWAGANDHA_001', name: 'Ashwagandha Root', origin: 'Maharashtra' },
    { code: 'QR_DEMO_TURMERIC_002', name: 'Turmeric Powder', origin: 'Kerala' },
    { code: 'QR_DEMO_BRAHMI_003', name: 'Brahmi Leaves', origin: 'Karnataka' }
  ]

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TRACE HERB...</p>
        </div>
      </div>
    )
  }

  // Show login redirect message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>TRACE HERB - Verify Authentic Ayurvedic Products</title>
        <meta name="description" content="Scan QR codes to verify the authenticity and traceability of Ayurvedic herbs with blockchain technology" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TRACE HERB" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-trace-green-50 via-white to-trace-blue-50 relative overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-trace-green-200/40 to-trace-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-purple-200/40 to-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-yellow-200/40 to-orange-200/40 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              x: [0, 120, 0],
              y: [0, -40, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 10
            }}
          />

          {/* Floating Particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-trace-green-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Offline Banner */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 text-center text-sm font-medium shadow-lg relative z-50"
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>You're offline. Some features may be limited.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/95 backdrop-blur-xl shadow-2xl sticky top-0 z-50 border-b border-white/20"
        >
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-trace-green-600 via-trace-green-700 to-trace-blue-600 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <HomeIcon className="w-9 h-9 text-white relative z-10" />
                </motion.div>
                <div>
                  <motion.h1
                    className="text-3xl md:text-4xl font-black bg-gradient-to-r from-trace-green-600 via-trace-blue-600 to-trace-green-800 bg-clip-text text-transparent"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    TRACE HERB
                  </motion.h1>
                  <p className="text-lg text-gray-600 font-medium">Authentic Ayurvedic Verification</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-4"
              >
                <BlockchainStatus />
                {user && (
                  <PortalNavigation currentPortal="consumer" />
                )}
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="relative container mx-auto px-4 py-20 overflow-hidden">
          {/* Floating Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-trace-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div className="absolute top-32 right-10 w-64 h-64 bg-trace-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center max-w-5xl mx-auto"
          >
            {/* Enhanced Hero Title */}
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-block mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-trace-green-400 to-trace-blue-400 rounded-2xl blur-lg opacity-30 animate-pulse-glow"></div>
                  <div className="relative bg-white rounded-2xl p-4 shadow-xl">
                    <ShieldCheckIcon className="w-12 h-12 text-trace-green-600 mx-auto" />
                  </div>
                </div>
              </motion.div>

              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-gray-900 mb-8 leading-tight">
                Verify Your{' '}
                <br className="hidden sm:block" />
                <span className="text-gradient-primary animate-shimmer bg-gradient-to-r from-trace-green-600 via-trace-blue-600 to-trace-green-600 bg-clip-text text-transparent bg-[length:200%_100%]">
                  Ayurvedic Products
                </span>
              </h2>
            </div>

            {/* Enhanced Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-12"
            >
              <p className="text-2xl md:text-3xl lg:text-4xl text-gray-700 mb-8 leading-relaxed font-medium max-w-5xl mx-auto">
                Scan QR codes to discover the complete journey of your herbs—from farm to shelf—
                with <span className="text-trace-green-600 font-bold text-3xl md:text-4xl lg:text-5xl">blockchain-verified authenticity</span> and
                <span className="text-trace-blue-600 font-bold text-3xl md:text-4xl lg:text-5xl"> sustainability credentials</span>.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-lg md:text-xl lg:text-2xl text-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 md:w-6 md:h-6 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Blockchain Verified</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 md:w-6 md:h-6 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Farm to Shelf Tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 md:w-6 md:h-6 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Quality Certified</span>
                </div>
              </div>
            </motion.div>

            {/* Enhanced CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20"
            >
              {/* Enhanced Primary Scan Button */}
              <motion.button
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowScanner(true)}
                className="group relative bg-gradient-to-r from-trace-green-600 via-trace-green-700 to-trace-blue-600 hover:from-trace-green-700 hover:via-trace-green-800 hover:to-trace-blue-700 text-white px-20 py-10 rounded-3xl font-black text-2xl md:text-3xl lg:text-4xl shadow-2xl transition-all duration-500 flex items-center space-x-6 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #2563eb 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease infinite'
                }}
              >
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-trace-green-400/20 via-trace-blue-400/20 to-trace-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Multiple Shine Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 delay-200"></div>

                {/* Enhanced Button Content */}
                <div className="relative flex items-center space-x-6">
                  <motion.div
                    className="p-5 bg-white/25 rounded-2xl backdrop-blur-sm"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <CameraIcon className="w-12 h-12 md:w-14 md:h-14" />
                  </motion.div>
                  <div className="flex flex-col items-start">
                    <span className="text-2xl md:text-3xl lg:text-4xl">SCAN QR CODE</span>
                    <span className="text-sm md:text-base opacity-90 font-medium">Instant Verification</span>
                  </div>
                </div>

                {/* Enhanced Glow Effects */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-trace-green-600 to-trace-blue-600 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500"></div>
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-trace-green-400 to-trace-blue-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700"></div>
              </motion.button>

              {/* Enhanced Secondary Enter Code Button */}
              <motion.button
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('manual-input')?.focus()}
                className="group relative bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white text-trace-green-700 px-20 py-10 rounded-3xl font-black text-2xl md:text-3xl lg:text-4xl border-4 border-trace-green-200 hover:border-trace-blue-400 shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center space-x-6 overflow-hidden"
              >
                {/* Animated Border Gradient */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-trace-green-400 via-trace-blue-400 to-trace-green-400 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500"></div>

                {/* Multiple Shine Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-trace-green-200/60 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-trace-blue-200/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 delay-150"></div>

                {/* Enhanced Button Content */}
                <div className="relative flex items-center space-x-6">
                  <motion.div
                    className="p-5 bg-gradient-to-r from-trace-green-100 to-trace-blue-100 rounded-2xl group-hover:from-trace-green-200 group-hover:to-trace-blue-200 transition-all duration-300 shadow-lg"
                    whileHover={{ rotate: -360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <MagnifyingGlassIcon className="w-12 h-12 md:w-14 md:h-14" />
                  </motion.div>
                  <div className="flex flex-col items-start">
                    <span className="text-2xl md:text-3xl lg:text-4xl">ENTER CODE</span>
                    <span className="text-sm md:text-base opacity-80 font-medium text-trace-blue-600">Manual Input</span>
                  </div>
                </div>

                {/* Enhanced Glow Effects */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-trace-green-300 to-trace-blue-300 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
              </motion.button>
            </motion.div>

            {/* Enhanced Manual Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="max-w-4xl mx-auto mb-20"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 text-center">
                  Or enter QR code manually
                </h3>

                <form onSubmit={handleManualSubmit} className="space-y-6">
                  <div className="relative group">
                    <input
                      id="manual-input"
                      type="text"
                      value={manualQRInput}
                      onChange={(e) => setManualQRInput(e.target.value)}
                      placeholder="Enter QR code (e.g., QR_DEMO_ASHWAGANDHA_001)"
                      className="w-full px-8 py-6 pr-20 border-4 border-gray-200 rounded-3xl focus:border-trace-green-500 focus:ring-4 focus:ring-trace-green-100 outline-none transition-all duration-300 bg-white/90 text-gray-800 placeholder-gray-500 group-hover:border-trace-green-300 text-xl md:text-2xl font-medium"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-trace-green-600 to-trace-green-700 hover:from-trace-green-700 hover:to-trace-green-800 text-white p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <MagnifyingGlassIcon className="w-8 h-8" />
                    </motion.button>
                  </div>

                  {/* Input Helper Text */}
                  <p className="text-lg md:text-xl text-gray-600 text-center font-medium">
                    Paste or type the QR code from your product packaging
                  </p>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Enhanced Demo QR Codes */}
        <section className="relative container mx-auto px-4 py-16 bg-gradient-to-br from-gray-50 to-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            {/* Section Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="inline-block mb-4"
              >
                <div className="bg-gradient-to-r from-trace-green-100 to-trace-blue-100 rounded-2xl p-3">
                  <QrCodeIcon className="w-8 h-8 text-trace-green-600 mx-auto" />
                </div>
              </motion.div>

              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Try Demo Products
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience our blockchain verification system with these sample Ayurvedic products
              </p>
            </div>

            {/* Demo Product Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {demoQRCodes.map((demo, index) => (
                <motion.div
                  key={demo.code}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.2, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer"
                  onClick={() => handleQRScan(demo.code)}
                >
                  {/* Card Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-trace-green-50 opacity-60"></div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-trace-green-400/10 to-trace-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative p-8">
                    {/* Product Icon & Info */}
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-trace-green-500 to-trace-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <QrCodeIcon className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-trace-green-700 transition-colors duration-300">
                          {demo.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">Origin: {demo.origin}</p>
                        <div className="flex items-center space-x-1 text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-medium">Blockchain Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Display */}
                    <div className="bg-gray-100 rounded-2xl p-4 mb-6 group-hover:bg-gray-50 transition-colors duration-300">
                      <code className="text-xs text-gray-700 font-mono break-all leading-relaxed">
                        {demo.code}
                      </code>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-trace-green-400 to-trace-blue-400 rounded-full"></div>
                        <span className="text-sm text-gray-600 font-medium">Ready to scan</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Track Batch Button for TH- codes */}
                        {demo.code.startsWith('TH-') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTrackBatch(demo.code)
                            }}
                            className="text-blue-600 hover:text-blue-700 transition-colors duration-300 text-sm font-semibold flex items-center space-x-1"
                          >
                            <ClockIcon className="w-4 h-4" />
                            <span>Track</span>
                          </button>
                        )}

                        <div className="flex items-center space-x-2 text-trace-green-600 group-hover:text-trace-green-700 transition-colors duration-300">
                          <span className="text-sm font-semibold">View Details</span>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Border Glow */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-trace-green-200 transition-colors duration-500"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Recent Scans
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentScans.map((scan, index) => (
                  <motion.div
                    key={scan.qrCode}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 cursor-pointer"
                    onClick={() => handleQRScan(scan.qrCode)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-trace-green-100 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-5 h-5 text-trace-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{scan.productName}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(scan.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      {scan.verified && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose TRACE HERB?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheckIcon,
                  title: 'Blockchain Verified',
                  description: 'Every product is recorded on an immutable blockchain ledger for guaranteed authenticity.'
                },
                {
                  icon: GlobeAltIcon,
                  title: 'Complete Traceability',
                  description: 'Track your herbs from the exact GPS location of harvest to your doorstep.'
                },
                {
                  icon: BeakerIcon,
                  title: 'Lab Certified',
                  description: 'View detailed quality certificates including purity, potency, and safety tests.'
                },
                {
                  icon: ShieldCheckIcon,
                  title: 'Sustainability Verified',
                  description: 'Ensure your products meet the highest environmental and ethical standards.'
                },
                {
                  icon: UserGroupIcon,
                  title: 'Farmer Profiles',
                  description: 'Meet the farmers and communities behind your products with detailed profiles.'
                },
                {
                  icon: SparklesIcon,
                  title: 'AI-Powered Insights',
                  description: 'Get personalized recommendations and insights about your Ayurvedic products.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-trace-green-100 to-trace-green-200 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-trace-green-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-trace-green-600 to-trace-green-700 rounded-lg flex items-center justify-center">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">TRACE HERB</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Ensuring authenticity and sustainability in Ayurvedic medicine through blockchain technology.
              </p>
              <p className="text-sm text-gray-500">
                © 2024 TRACE HERB. All rights reserved. | Powered by Hyperledger Fabric
              </p>
            </div>
          </div>
        </footer>

        {/* QR Scanner Modal */}
        <QRScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleQRScan}
          onError={(error) => console.error('QR Scanner error:', error)}
        />

        {/* Provenance Display Modal */}
        {currentQRCode && (
          <WorkingProvenanceDisplay
            qrCode={currentQRCode}
            onClose={() => setCurrentQRCode(null)}
            onTrackBatch={(batchId: string) => handleTrackBatch(batchId)}
            onProvenanceLoaded={(productName: string) => handleProvenanceLoaded(currentQRCode, productName)}
          />
        )}

        {/* Batch Tracker Modal */}
        {showBatchTracker && trackingBatchId && (
          <BatchTracker
            batchId={trackingBatchId}
            onClose={() => {
              setShowBatchTracker(false)
              setTrackingBatchId(null)
            }}
          />
        )}

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
      </div>
    </>
  )
}

export default HomePage
