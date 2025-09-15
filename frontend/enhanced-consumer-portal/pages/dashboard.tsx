import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
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
  UserIcon,
  ChartBarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { Toaster } from 'react-hot-toast'
import BlockchainStatus from '../components/BlockchainStatus'
import PortalNavigation from '../components/PortalNavigation'
import SimpleInteractiveStoryMap from '../components/SimpleInteractiveStoryMap'
import SimpleTrustScoreWidget from '../components/SimpleTrustScoreWidget'
import SimpleHealthInsightsPanel from '../components/SimpleHealthInsightsPanel'

const DashboardPage: React.FC = () => {
  const router = useRouter()
  const [currentQRCode, setCurrentQRCode] = useState<string | null>('QR_DEMO_ASHWAGANDHA_001')
  const [batchData, setBatchData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock batch data for demo
  useEffect(() => {
    if (currentQRCode) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setBatchData({
          qrCode: currentQRCode,
          herbType: 'Ashwagandha',
          batchId: 'ASH_2024_001',
          farmerName: 'Rajesh Kumar',
          farmLocation: 'Karnataka, India',
          collectionDate: '2024-09-10T06:30:00Z',
          qualityGrade: 'A',
          sustainabilityScore: 92,
          farmerReputation: 88,
          qualityScore: 94,
          gpsLocation: {
            latitude: 15.3173,
            longitude: 75.7139
          },
          environmentalData: {
            temperature: 28,
            humidity: 65,
            soilPH: 6.8
          }
        })
        setIsLoading(false)
      }, 1000)
    }
  }, [currentQRCode])

  return (
    <>
      <Head>
        <title>Advanced Features Dashboard - TRACE HERB</title>
        <meta name="description" content="Advanced blockchain traceability features" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center text-gray-600 hover:text-gray-800 mr-6"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Back to Scanner
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Advanced Features Dashboard
                </h1>
              </div>
              <BlockchainStatus />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <span className="ml-3 text-lg text-gray-600">Loading batch data...</span>
            </div>
          ) : batchData ? (
            <div className="space-y-8">
              {/* Batch Info Header */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                      <QrCodeIcon className="h-8 w-8 mr-3 text-green-600" />
                      {batchData.herbType} - {batchData.batchId}
                    </h2>
                    <p className="text-gray-600 mt-2">
                      From {batchData.farmerName} • {batchData.farmLocation}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">Grade {batchData.qualityGrade}</div>
                    <div className="text-sm text-gray-500">Quality Score: {batchData.qualityScore}/100</div>
                  </div>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Interactive Story Map */}
                <div className="lg:col-span-2">
                  <SimpleInteractiveStoryMap 
                    qrCode={currentQRCode} 
                    batchData={batchData} 
                  />
                </div>

                {/* Trust Score Widget */}
                <div>
                  <SimpleTrustScoreWidget 
                    qrCode={currentQRCode} 
                    batchData={batchData} 
                  />
                </div>

                {/* Health Insights Panel */}
                <div>
                  <SimpleHealthInsightsPanel 
                    qrCode={currentQRCode} 
                    batchData={batchData} 
                  />
                </div>
              </div>

              {/* Additional Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    View detailed analytics and trends for this batch and farmer.
                  </p>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    View Analytics
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <TrophyIcon className="h-6 w-6 text-yellow-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Unlock achievements and earn rewards for sustainable practices.
                  </p>
                  <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
                    View Achievements
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <UserGroupIcon className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Community</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Connect with other consumers and share your experiences.
                  </p>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                    Join Community
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <QrCodeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Batch Selected</h2>
              <p className="text-gray-600 mb-6">
                Please scan a QR code first to view advanced features.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to QR Scanner
              </button>
            </div>
          )}
        </div>

        {/* Portal Navigation */}
        <PortalNavigation />
      </div>
    </>
  )
}

export default DashboardPage
