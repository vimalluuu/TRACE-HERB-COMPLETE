import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BeakerIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface TrustScoreProps {
  batchData: any
  className?: string
}

interface TrustFactor {
  id: string
  name: string
  score: number
  maxScore: number
  icon: React.ReactNode
  description: string
  status: 'excellent' | 'good' | 'fair' | 'poor'
  details: string[]
}

const TrustScoreWidget: React.FC<TrustScoreProps> = ({ batchData, className = '' }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)

  // Calculate trust factors based on batch data
  const calculateTrustFactors = (batch: any): TrustFactor[] => {
    const factors: TrustFactor[] = []

    // Blockchain Verification
    const blockchainScore = batch.blockchainHash ? 100 : 0
    factors.push({
      id: 'blockchain',
      name: 'Blockchain Verified',
      score: blockchainScore,
      maxScore: 100,
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      description: 'Immutable record on blockchain',
      status: blockchainScore >= 100 ? 'excellent' : 'poor',
      details: [
        batch.blockchainHash ? '✅ Recorded on Hyperledger Fabric' : '❌ Not on blockchain',
        batch.blockchainHash ? '✅ Tamper-proof verification' : '❌ No cryptographic proof',
        batch.blockchainHash ? `✅ Block Hash: ${batch.blockchainHash?.substring(0, 16)}...` : '❌ No hash available'
      ]
    })

    // Quality Testing
    const hasLabTesting = batch.events?.some((e: any) => e.type === 'Laboratory Testing')
    const qualityGrade = batch.certificate?.overallGrade
    let qualityScore = 0
    if (hasLabTesting) {
      qualityScore = qualityGrade === 'A+' ? 100 : qualityGrade === 'A' ? 90 : qualityGrade === 'B' ? 70 : 50
    }
    
    factors.push({
      id: 'quality',
      name: 'Quality Testing',
      score: qualityScore,
      maxScore: 100,
      icon: <BeakerIcon className="w-5 h-5" />,
      description: 'Laboratory verified quality',
      status: qualityScore >= 90 ? 'excellent' : qualityScore >= 70 ? 'good' : qualityScore >= 50 ? 'fair' : 'poor',
      details: [
        hasLabTesting ? '✅ Laboratory tested' : '❌ No lab testing',
        qualityGrade ? `✅ Grade: ${qualityGrade}` : '❌ No quality grade',
        batch.certificate?.compliance ? `✅ ${batch.certificate.compliance}` : '❌ Compliance unknown'
      ]
    })

    // Traceability Completeness
    const eventTypes = batch.events?.map((e: any) => e.type) || []
    const expectedEvents = ['Collection', 'Processing', 'Laboratory Testing', 'Regulatory Review']
    const completeness = (eventTypes.filter((type: string) => expectedEvents.includes(type)).length / expectedEvents.length) * 100
    
    factors.push({
      id: 'traceability',
      name: 'Supply Chain Transparency',
      score: completeness,
      maxScore: 100,
      icon: <MapPinIcon className="w-5 h-5" />,
      description: 'Complete journey tracking',
      status: completeness >= 90 ? 'excellent' : completeness >= 70 ? 'good' : completeness >= 50 ? 'fair' : 'poor',
      details: [
        eventTypes.includes('Collection') ? '✅ Farm collection recorded' : '❌ No collection data',
        eventTypes.includes('Processing') ? '✅ Processing documented' : '❌ No processing info',
        eventTypes.includes('Laboratory Testing') ? '✅ Lab testing completed' : '❌ No lab verification',
        eventTypes.includes('Regulatory Review') ? '✅ Regulatory approved' : '❌ No regulatory review'
      ]
    })

    // Freshness Score
    const collectionEvent = batch.events?.find((e: any) => e.type === 'Collection')
    const collectionDate = collectionEvent ? new Date(collectionEvent.timestamp) : null
    const daysSinceCollection = collectionDate ? Math.floor((Date.now() - collectionDate.getTime()) / (1000 * 60 * 60 * 24)) : 999
    const freshnessScore = Math.max(0, 100 - (daysSinceCollection * 2)) // Lose 2 points per day
    
    factors.push({
      id: 'freshness',
      name: 'Freshness',
      score: freshnessScore,
      maxScore: 100,
      icon: <ClockIcon className="w-5 h-5" />,
      description: 'Time since harvest',
      status: freshnessScore >= 90 ? 'excellent' : freshnessScore >= 70 ? 'good' : freshnessScore >= 50 ? 'fair' : 'poor',
      details: [
        collectionDate ? `✅ Collected: ${collectionDate.toLocaleDateString()}` : '❌ Collection date unknown',
        `📅 ${daysSinceCollection} days since harvest`,
        freshnessScore >= 90 ? '✅ Very fresh' : freshnessScore >= 70 ? '✅ Fresh' : freshnessScore >= 50 ? '⚠️ Moderately fresh' : '❌ Not fresh'
      ]
    })

    // Sustainability Score
    const hasGPSLocation = collectionEvent?.location?.coordinates
    const hasEnvironmentalData = collectionEvent?.environmentalConditions
    const sustainabilityScore = (hasGPSLocation ? 50 : 0) + (hasEnvironmentalData ? 50 : 0)
    
    factors.push({
      id: 'sustainability',
      name: 'Sustainability',
      score: sustainabilityScore,
      maxScore: 100,
      icon: <UserGroupIcon className="w-5 h-5" />,
      description: 'Environmental responsibility',
      status: sustainabilityScore >= 90 ? 'excellent' : sustainabilityScore >= 70 ? 'good' : sustainabilityScore >= 50 : 'fair' : 'poor',
      details: [
        hasGPSLocation ? '✅ GPS location verified' : '❌ Location not verified',
        hasEnvironmentalData ? '✅ Environmental data recorded' : '❌ No environmental tracking',
        batch.certificate?.organic ? '✅ Organic certified' : '⚠️ Organic status unknown'
      ]
    })

    return factors
  }

  const [trustFactors] = useState<TrustFactor[]>(calculateTrustFactors(batchData))
  
  // Calculate overall trust score
  const overallScore = Math.round(
    trustFactors.reduce((sum, factor) => sum + (factor.score / factor.maxScore), 0) / trustFactors.length * 100
  )

  // Animate score on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(overallScore)
    }, 500)
    return () => clearTimeout(timer)
  }, [overallScore])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 70) return 'bg-blue-100'
    if (score >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Poor'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      case 'good':
        return <CheckCircleIcon className="w-4 h-4 text-blue-600" />
      case 'fair':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
      case 'poor':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
      default:
        return <InformationCircleIcon className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${getScoreBgColor(overallScore)}`}>
              <ShieldCheckIcon className={`w-6 h-6 ${getScoreColor(overallScore)}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Trust Score</h3>
              <p className="text-sm text-gray-600">Blockchain-verified authenticity</p>
            </div>
          </div>
          
          <div className="text-right">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-3xl font-bold ${getScoreColor(animatedScore)}`}
            >
              {animatedScore}/100
            </motion.div>
            <div className={`text-sm font-semibold ${getScoreColor(animatedScore)}`}>
              {getScoreLabel(animatedScore)}
            </div>
          </div>
        </div>

        {/* Overall Score Bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${animatedScore}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full rounded-full ${
                animatedScore >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                animatedScore >= 70 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                animatedScore >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Trust Factors Summary */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {trustFactors.slice(0, 4).map((factor, index) => (
            <motion.div
              key={factor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
            >
              <div className={`p-2 rounded-lg ${getScoreBgColor(factor.score)}`}>
                {factor.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {factor.name}
                  </p>
                  {getStatusIcon(factor.status)}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        factor.score >= 90 ? 'bg-green-500' :
                        factor.score >= 70 ? 'bg-blue-500' :
                        factor.score >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {Math.round((factor.score / factor.maxScore) * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <InformationCircleIcon className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">
            {showDetails ? 'Hide Details' : 'Show Detailed Breakdown'}
          </span>
        </button>

        {/* Detailed Breakdown */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            {trustFactors.map((factor) => (
              <div key={factor.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getScoreBgColor(factor.score)}`}>
                      {factor.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{factor.name}</h4>
                      <p className="text-sm text-gray-600">{factor.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(factor.score)}`}>
                      {Math.round((factor.score / factor.maxScore) * 100)}%
                    </div>
                    <div className={`text-xs font-semibold ${getScoreColor(factor.score)}`}>
                      {factor.status.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {factor.details.map((detail, index) => (
                    <p key={index} className="text-sm text-gray-700">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Trust Badge */}
      <div className="px-6 pb-6">
        <div className={`p-4 rounded-xl border-2 border-dashed ${
          overallScore >= 90 ? 'border-green-300 bg-green-50' :
          overallScore >= 70 ? 'border-blue-300 bg-blue-50' :
          overallScore >= 50 ? 'border-yellow-300 bg-yellow-50' :
          'border-red-300 bg-red-50'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            <StarIcon className={`w-5 h-5 ${getScoreColor(overallScore)} fill-current`} />
            <span className={`font-bold ${getScoreColor(overallScore)}`}>
              TRACE HERB VERIFIED
            </span>
            <StarIcon className={`w-5 h-5 ${getScoreColor(overallScore)} fill-current`} />
          </div>
          <p className="text-center text-sm text-gray-600 mt-1">
            This product has been verified through our blockchain-based traceability system
          </p>
        </div>
      </div>
    </div>
  )
}

export default TrustScoreWidget
