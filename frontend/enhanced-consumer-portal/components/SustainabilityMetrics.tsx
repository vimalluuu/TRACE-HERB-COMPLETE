import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LeafIcon,
  GlobeAltIcon,
  HeartIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface SustainabilityMetrics {
  carbonFootprint: number
  waterUsage: number
  organicCertified: boolean
  fairTrade: boolean
  biodiversityScore: number
}

interface SustainabilityMetricsProps {
  metrics?: SustainabilityMetrics
  qrCode?: string
}

const SustainabilityMetrics: React.FC<SustainabilityMetricsProps> = ({ metrics, qrCode }) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [realMetrics, setRealMetrics] = useState<SustainabilityMetrics | null>(null)

  // Import batch sync utilities
  React.useEffect(() => {
    const loadBatchData = async () => {
      try {
        const { getBatchByQRCode, batchToSustainabilityMetrics, initializeDemoBatches } = await import('../utils/batchStatusSync.js')

        // Initialize demo batches
        initializeDemoBatches()

        if (qrCode) {
          const batch = getBatchByQRCode(qrCode)
          if (batch) {
            const batchMetrics = batchToSustainabilityMetrics(batch)
            setRealMetrics(batchMetrics)
          }
        }
      } catch (error) {
        console.error('Error loading batch data:', error)
      }
    }

    loadBatchData()
  }, [qrCode])

  // Mock data if not provided
  const defaultMetrics: SustainabilityMetrics = {
    carbonFootprint: 2.4,
    waterUsage: 150,
    organicCertified: false,
    fairTrade: false,
    biodiversityScore: 6.0
  }

  const metricsToShow = realMetrics || metrics || defaultMetrics

  const sustainabilityData = [
    {
      id: 'carbon',
      title: 'Carbon Footprint',
      value: `${metricsToShow.carbonFootprint} kg CO₂`,
      description: 'Total carbon emissions from cultivation to packaging',
      icon: GlobeAltIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      benchmark: '< 3.0 kg CO₂',
      status: metricsToShow.carbonFootprint < 3.0 ? 'good' : 'warning',
      details: [
        'Cultivation: 1.2 kg CO₂',
        'Processing: 0.8 kg CO₂',
        'Transportation: 0.4 kg CO₂'
      ]
    },
    {
      id: 'water',
      title: 'Water Usage',
      value: `${metricsToShow.waterUsage} L/kg`,
      description: 'Water consumed per kilogram of product',
      icon: HeartIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      benchmark: '< 200 L/kg',
      status: metricsToShow.waterUsage < 200 ? 'good' : 'warning',
      details: [
        'Irrigation: 120 L/kg',
        'Processing: 20 L/kg',
        'Cleaning: 10 L/kg'
      ]
    },
    {
      id: 'biodiversity',
      title: 'Biodiversity Score',
      value: `${metricsToShow.biodiversityScore}/10`,
      description: 'Impact on local ecosystem and wildlife',
      icon: LeafIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      benchmark: '> 7.0/10',
      status: metricsToShow.biodiversityScore > 7.0 ? 'good' : 'warning',
      details: [
        'Native species preservation: 9/10',
        'Soil health: 8/10',
        'Pollinator support: 8.5/10'
      ]
    }
  ]

  const certifications = [
    {
      id: 'organic',
      title: 'Organic Certified',
      certified: metricsToShow.organicCertified,
      description: 'Certified organic by accredited body',
      certifyingBody: 'India Organic Certification Agency',
      validUntil: '2025-12-31'
    },
    {
      id: 'fairtrade',
      title: 'Fair Trade',
      certified: metricsToShow.fairTrade,
      description: 'Fair wages and working conditions',
      certifyingBody: 'Fair Trade India',
      validUntil: '2025-06-30'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getOverallScore = () => {
    let score = 0
    if (metricsToShow.carbonFootprint < 3.0) score += 25
    if (metricsToShow.waterUsage < 200) score += 25
    if (metricsToShow.biodiversityScore > 7.0) score += 25
    if (metricsToShow.organicCertified && metricsToShow.fairTrade) score += 25
    return score
  }

  const overallScore = getOverallScore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LeafIcon className="w-6 h-6 text-trace-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sustainability Metrics</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-trace-green-600">{overallScore}/100</div>
          <div className="text-sm text-gray-600">Sustainability Score</div>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="bg-gradient-to-r from-trace-green-50 to-emerald-50 border border-trace-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-trace-green-900">Overall Sustainability Rating</h4>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            overallScore >= 80 ? 'bg-green-100 text-green-800' :
            overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-3 rounded-full ${
              overallScore >= 80 ? 'bg-green-500' :
              overallScore >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
          />
        </div>
        
        <p className="text-sm text-trace-green-700">
          This product meets {overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : 'basic'} sustainability standards 
          with verified environmental and social impact metrics.
        </p>
      </div>

      {/* Sustainability Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sustainabilityData.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status === 'good' ? 'Good' : 'Warning'}
                </span>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-1">{metric.title}</h4>
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <p className="text-sm text-gray-600 mb-2">{metric.description}</p>
              
              <div className="text-xs text-gray-500">
                Benchmark: {metric.benchmark}
              </div>
              
              {selectedMetric === metric.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-100"
                >
                  <h5 className="font-medium text-gray-900 mb-2">Breakdown:</h5>
                  <ul className="space-y-1">
                    {metric.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-xs text-gray-600 flex items-center space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certifications */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-trace-blue-600" />
            <h4 className="font-semibold text-gray-900">Certifications</h4>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  cert.certified 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{cert.title}</h5>
                  {cert.certified ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                
                {cert.certified && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <div><strong>Certified by:</strong> {cert.certifyingBody}</div>
                    <div><strong>Valid until:</strong> {cert.validUntil}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Environmental Impact Chart */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5 text-trace-green-600" />
            <h4 className="font-semibold text-gray-900">Environmental Impact Comparison</h4>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {[
              { label: 'Carbon Footprint', current: metricsToShow.carbonFootprint, industry: 4.2, unit: 'kg CO₂' },
              { label: 'Water Usage', current: metricsToShow.waterUsage, industry: 280, unit: 'L/kg' },
              { label: 'Biodiversity Score', current: metricsToShow.biodiversityScore, industry: 6.2, unit: '/10' }
            ].map((comparison, index) => (
              <div key={comparison.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">{comparison.label}</span>
                  <span className="text-gray-600">vs Industry Average</span>
                </div>
                
                <div className="space-y-1">
                  {/* Current Product */}
                  <div className="flex items-center space-x-3">
                    <div className="w-20 text-xs text-gray-600">This Product</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(comparison.current / Math.max(comparison.current, comparison.industry)) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className="bg-trace-green-500 h-2 rounded-full"
                      />
                    </div>
                    <div className="w-16 text-xs text-gray-900 font-medium">
                      {comparison.current} {comparison.unit}
                    </div>
                  </div>
                  
                  {/* Industry Average */}
                  <div className="flex items-center space-x-3">
                    <div className="w-20 text-xs text-gray-600">Industry Avg</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(comparison.industry / Math.max(comparison.current, comparison.industry)) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.2 + 0.1 }}
                        className="bg-gray-400 h-2 rounded-full"
                      />
                    </div>
                    <div className="w-16 text-xs text-gray-600">
                      {comparison.industry} {comparison.unit}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sustainability Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sustainability Commitment</p>
            <p>
              Our sustainability metrics are independently verified and updated regularly. 
              We work with farmers and communities to continuously improve environmental 
              and social impact while maintaining the highest quality standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SustainabilityMetrics
