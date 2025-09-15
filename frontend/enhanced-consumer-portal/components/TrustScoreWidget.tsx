import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheckIcon,
  StarIcon,
  TrophyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CubeTransparentIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'

interface TrustScoreProps {
  qrCode: string
  batchData: any
  blockchainData?: any
}

interface TrustFactor {
  id: string
  name: string
  score: number
  maxScore: number
  description: string
  icon: React.ComponentType<any>
  details: string[]
  status: 'excellent' | 'good' | 'fair' | 'poor'
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  earned: boolean
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const TrustScoreWidget: React.FC<TrustScoreProps> = ({ qrCode, batchData, blockchainData }) => {
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null)
  const [showAchievements, setShowAchievements] = useState(false)
  const [animatingScore, setAnimatingScore] = useState(0)

  // Calculate trust factors based on batch data
  const calculateTrustFactors = (): TrustFactor[] => {
    if (!batchData) return []

    return [
      {
        id: 'blockchain',
        name: 'Blockchain Verification',
        score: 95,
        maxScore: 100,
        description: 'Immutable record on blockchain',
        icon: CubeTransparentIcon,
        details: [
          'Transaction hash verified',
          'Smart contract validated',
          'No tampering detected',
          'Consensus achieved across nodes'
        ],
        status: 'excellent'
      },
      {
        id: 'farmer',
        name: 'Farmer Reputation',
        score: batchData.farmerReputation || 88,
        maxScore: 100,
        description: 'Farmer track record and certifications',
        icon: UserGroupIcon,
        details: [
          `${batchData.farmerExperience || 15} years of experience`,
          'Organic certification verified',
          '4.8/5 average quality rating',
          'Zero compliance violations'
        ],
        status: 'excellent'
      },
      {
        id: 'quality',
        name: 'Quality Testing',
        score: batchData.qualityScore || 92,
        maxScore: 100,
        description: 'Laboratory analysis results',
        icon: BeakerIcon,
        details: [
          'Heavy metals: Below detection limit',
          'Pesticide residue: Not detected',
          'Microbial count: Within safe limits',
          'Active compounds: Above standard'
        ],
        status: 'excellent'
      },
      {
        id: 'traceability',
        name: 'Supply Chain Transparency',
        score: 90,
        maxScore: 100,
        description: 'Complete journey documentation',
        icon: MapPinIcon,
        details: [
          'GPS coordinates verified',
          'All stakeholders identified',
          'Processing steps documented',
          'Transport conditions monitored'
        ],
        status: 'excellent'
      },
      {
        id: 'freshness',
        name: 'Freshness & Timing',
        score: calculateFreshnessScore(),
        maxScore: 100,
        description: 'Harvest to delivery timeline',
        icon: ClockIcon,
        details: [
          `Harvested: ${batchData.collectionDate || 'Recent'}`,
          'Processed within 24 hours',
          'Cold chain maintained',
          'Optimal storage conditions'
        ],
        status: calculateFreshnessScore() > 85 ? 'excellent' : 'good'
      },
      {
        id: 'sustainability',
        name: 'Sustainability Score',
        score: batchData.sustainabilityScore || 87,
        maxScore: 100,
        description: 'Environmental and social impact',
        icon: StarIcon,
        details: [
          'Organic farming practices',
          'Water conservation methods',
          'Fair trade certified',
          'Carbon footprint offset'
        ],
        status: 'excellent'
      }
    ]
  }

  function calculateFreshnessScore(): number {
    if (!batchData?.collectionDate) return 85
    
    const harvestDate = new Date(batchData.collectionDate)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - harvestDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff <= 7) return 100
    if (daysDiff <= 14) return 95
    if (daysDiff <= 30) return 90
    if (daysDiff <= 60) return 85
    return 80
  }

  const trustFactors = calculateTrustFactors()
  const overallScore = Math.round(trustFactors.reduce((sum, factor) => sum + factor.score, 0) / trustFactors.length)

  // Generate achievements based on scores
  const generateAchievements = (): Achievement[] => {
    return [
      {
        id: 'blockchain_verified',
        title: 'Blockchain Verified',
        description: 'Product verified on immutable blockchain',
        icon: CubeTransparentIcon,
        earned: trustFactors.find(f => f.id === 'blockchain')?.score >= 90,
        rarity: 'common'
      },
      {
        id: 'premium_quality',
        title: 'Premium Quality',
        description: 'Exceeds all quality standards',
        icon: TrophyIcon,
        earned: trustFactors.find(f => f.id === 'quality')?.score >= 90,
        rarity: 'rare'
      },
      {
        id: 'master_farmer',
        title: 'Master Farmer',
        description: 'From a highly experienced farmer',
        icon: UserGroupIcon,
        earned: trustFactors.find(f => f.id === 'farmer')?.score >= 85,
        rarity: 'epic'
      },
      {
        id: 'ultra_fresh',
        title: 'Ultra Fresh',
        description: 'Harvested within the last week',
        icon: ClockIcon,
        earned: trustFactors.find(f => f.id === 'freshness')?.score >= 95,
        rarity: 'legendary'
      },
      {
        id: 'eco_champion',
        title: 'Eco Champion',
        description: 'Sustainable and eco-friendly',
        icon: StarIcon,
        earned: trustFactors.find(f => f.id === 'sustainability')?.score >= 85,
        rarity: 'rare'
      },
      {
        id: 'perfect_trace',
        title: 'Perfect Traceability',
        description: 'Complete supply chain transparency',
        icon: MapPinIcon,
        earned: trustFactors.find(f => f.id === 'traceability')?.score >= 90,
        rarity: 'epic'
      }
    ]
  }

  const achievements = generateAchievements()
  const earnedAchievements = achievements.filter(a => a.earned)

  // Animate score on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatingScore(overallScore)
    }, 500)
    return () => clearTimeout(timer)
  }, [overallScore])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 80) return 'text-blue-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-400 to-green-600'
    if (score >= 80) return 'from-blue-400 to-blue-600'
    if (score >= 70) return 'from-yellow-400 to-yellow-600'
    return 'from-red-400 to-red-600'
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500'
      case 'epic': return 'from-purple-400 to-pink-500'
      case 'rare': return 'from-blue-400 to-indigo-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  if (!batchData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Scan a QR code to see trust score</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2 text-green-600" />
            Trust Score
          </h2>
          <p className="text-gray-600 mt-1">
            Blockchain-verified authenticity and quality metrics
          </p>
        </div>
        <motion.button
          onClick={() => setShowAchievements(!showAchievements)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <TrophyIcon className="h-4 w-4 mr-2" />
          Achievements ({earnedAchievements.length})
        </motion.button>
      </div>

      {/* Overall Score Circle */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - animatingScore / 100) }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`stop-color-${getScoreGradient(overallScore).split('-')[1]}-400`} />
                <stop offset="100%" className={`stop-color-${getScoreGradient(overallScore).split('-')[3]}-600`} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className={`text-3xl font-bold ${getScoreColor(overallScore)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                {animatingScore}
              </motion.div>
              <div className="text-sm text-gray-500">Trust Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Factors */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Trust Factors
        </h3>
        
        {trustFactors.map((factor) => {
          const Icon = factor.icon
          const isSelected = selectedFactor === factor.id
          
          return (
            <motion.div
              key={factor.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedFactor(isSelected ? null : factor.id)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="h-5 w-5 mr-3 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-800">{factor.name}</h4>
                    <p className="text-sm text-gray-600">{factor.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`text-lg font-bold mr-2 ${getScoreColor(factor.score)}`}>
                    {factor.score}
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`bg-gradient-to-r ${getScoreGradient(factor.score)} h-2 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {factor.details.map((detail, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                          {detail}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Achievements Panel */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2" />
              Achievements Unlocked
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon
                
                return (
                  <motion.div
                    key={achievement.id}
                    className={`relative p-4 rounded-lg border-2 ${
                      achievement.earned
                        ? 'border-transparent bg-gradient-to-r ' + getRarityColor(achievement.rarity)
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                    whileHover={achievement.earned ? { scale: 1.05 } : {}}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className={`${achievement.earned ? 'text-white' : 'text-gray-400'}`}>
                      <Icon className="h-6 w-6 mb-2" />
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs mt-1 opacity-90">{achievement.description}</p>
                    </div>
                    
                    {achievement.earned && (
                      <div className="absolute top-2 right-2">
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    
                    <div className={`absolute bottom-1 right-1 text-xs font-bold ${
                      achievement.earned ? 'text-white opacity-75' : 'text-gray-400'
                    }`}>
                      {achievement.rarity.toUpperCase()}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Score Explanation */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How Trust Score Works</p>
            <p>
              Our Trust Score combines blockchain verification, farmer reputation, quality testing, 
              supply chain transparency, freshness metrics, and sustainability practices to give you 
              a comprehensive authenticity rating.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrustScoreWidget
