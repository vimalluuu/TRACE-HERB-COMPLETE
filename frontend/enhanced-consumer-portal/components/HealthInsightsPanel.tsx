import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartIcon,
  SparklesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BeakerIcon,
  UserIcon,
  CalendarIcon,
  SunIcon,
  MoonIcon,
  FireIcon,
  DropletIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface HealthInsightsProps {
  qrCode: string
  batchData: any
  userProfile?: {
    age?: number
    gender?: string
    healthConditions?: string[]
    preferences?: string[]
  }
}

interface HealthBenefit {
  id: string
  title: string
  description: string
  scientificBasis: string
  icon: React.ComponentType<any>
  potency: 'high' | 'medium' | 'low'
  timeToEffect: string
  dosage: string
}

interface AyurvedicProfile {
  dosha: 'vata' | 'pitta' | 'kapha' | 'balanced'
  properties: string[]
  taste: string[]
  potency: 'heating' | 'cooling' | 'neutral'
  effect: string
}

interface Usage {
  method: string
  timing: string
  duration: string
  precautions: string[]
  synergies: string[]
}

const HealthInsightsPanel: React.FC<HealthInsightsProps> = ({ qrCode, batchData, userProfile }) => {
  const [activeTab, setActiveTab] = useState<'benefits' | 'ayurveda' | 'usage' | 'personalized'>('benefits')
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null)

  // Get herb-specific health benefits
  const getHealthBenefits = (): HealthBenefit[] => {
    const herbName = batchData?.botanicalName?.toLowerCase() || batchData?.commonName?.toLowerCase() || ''
    
    if (herbName.includes('ashwagandha') || herbName.includes('withania')) {
      return [
        {
          id: 'stress',
          title: 'Stress & Anxiety Relief',
          description: 'Reduces cortisol levels and promotes calm mental state',
          scientificBasis: 'Clinical studies show 27% reduction in cortisol levels',
          icon: HeartIcon,
          potency: 'high',
          timeToEffect: '2-4 weeks',
          dosage: '300-600mg daily'
        },
        {
          id: 'energy',
          title: 'Energy & Vitality',
          description: 'Enhances physical performance and reduces fatigue',
          scientificBasis: 'Increases VO2 max by 13% in athletic performance studies',
          icon: FireIcon,
          potency: 'high',
          timeToEffect: '1-2 weeks',
          dosage: '500mg twice daily'
        },
        {
          id: 'sleep',
          title: 'Sleep Quality',
          description: 'Improves sleep onset and deep sleep phases',
          scientificBasis: 'Increases sleep efficiency by 72% in clinical trials',
          icon: MoonIcon,
          potency: 'medium',
          timeToEffect: '1 week',
          dosage: '300mg before bedtime'
        },
        {
          id: 'immunity',
          title: 'Immune Support',
          description: 'Strengthens immune system and increases white blood cell activity',
          scientificBasis: 'Boosts immune cell activity by 40% in research studies',
          icon: ShieldCheckIcon,
          potency: 'medium',
          timeToEffect: '3-4 weeks',
          dosage: '250-500mg daily'
        },
        {
          id: 'cognitive',
          title: 'Cognitive Function',
          description: 'Enhances memory, focus, and mental clarity',
          scientificBasis: 'Improves attention and information processing speed',
          icon: SparklesIcon,
          potency: 'medium',
          timeToEffect: '4-6 weeks',
          dosage: '300mg twice daily'
        }
      ]
    }
    
    // Default benefits for other herbs
    return [
      {
        id: 'general',
        title: 'General Wellness',
        description: 'Supports overall health and vitality',
        scientificBasis: 'Traditional use backed by modern research',
        icon: HeartIcon,
        potency: 'medium',
        timeToEffect: '2-4 weeks',
        dosage: 'As per traditional guidelines'
      }
    ]
  }

  // Get Ayurvedic profile
  const getAyurvedicProfile = (): AyurvedicProfile => {
    const herbName = batchData?.botanicalName?.toLowerCase() || batchData?.commonName?.toLowerCase() || ''
    
    if (herbName.includes('ashwagandha') || herbName.includes('withania')) {
      return {
        dosha: 'balanced',
        properties: ['Rasayana (Rejuvenative)', 'Balya (Strength giving)', 'Medhya (Brain tonic)'],
        taste: ['Tikta (Bitter)', 'Katu (Pungent)', 'Madhura (Sweet)'],
        potency: 'heating',
        effect: 'Balances all three doshas, particularly beneficial for Vata disorders'
      }
    }
    
    return {
      dosha: 'balanced',
      properties: ['Traditional herb with multiple benefits'],
      taste: ['Varies by preparation'],
      potency: 'neutral',
      effect: 'Supports natural balance'
    }
  }

  // Get usage recommendations
  const getUsageRecommendations = (): Usage => {
    const herbName = batchData?.botanicalName?.toLowerCase() || batchData?.commonName?.toLowerCase() || ''
    
    if (herbName.includes('ashwagandha') || herbName.includes('withania')) {
      return {
        method: 'Powder mixed with warm milk or water, or as capsules',
        timing: 'Morning and evening, preferably with meals',
        duration: 'Minimum 8-12 weeks for optimal benefits',
        precautions: [
          'Consult healthcare provider if pregnant or nursing',
          'May interact with thyroid medications',
          'Start with lower doses to assess tolerance',
          'Avoid if you have autoimmune conditions'
        ],
        synergies: [
          'Brahmi for enhanced cognitive benefits',
          'Shatavari for hormonal balance',
          'Turmeric for anti-inflammatory effects',
          'Triphala for digestive support'
        ]
      }
    }
    
    return {
      method: 'As per traditional preparation methods',
      timing: 'Follow traditional timing guidelines',
      duration: 'Consult with Ayurvedic practitioner',
      precautions: ['Consult healthcare provider before use'],
      synergies: ['Combines well with complementary herbs']
    }
  }

  const healthBenefits = getHealthBenefits()
  const ayurvedicProfile = getAyurvedicProfile()
  const usageRecommendations = getUsageRecommendations()

  // Generate personalized recommendations
  const getPersonalizedRecommendations = () => {
    if (!userProfile) return []
    
    const recommendations = []
    
    if (userProfile.age && userProfile.age > 40) {
      recommendations.push({
        type: 'age',
        title: 'Age-Specific Benefits',
        description: 'Particularly beneficial for maintaining vitality and cognitive function as you age',
        icon: UserIcon
      })
    }
    
    if (userProfile.healthConditions?.includes('stress')) {
      recommendations.push({
        type: 'condition',
        title: 'Stress Management',
        description: 'Your stress levels indicate this herb could provide significant relief',
        icon: HeartIcon
      })
    }
    
    if (userProfile.preferences?.includes('natural')) {
      recommendations.push({
        type: 'preference',
        title: 'Natural Wellness',
        description: 'Aligns with your preference for natural health solutions',
        icon: SparklesIcon
      })
    }
    
    return recommendations
  }

  const personalizedRecommendations = getPersonalizedRecommendations()

  const getPotencyColor = (potency: string) => {
    switch (potency) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDoshaColor = (dosha: string) => {
    switch (dosha) {
      case 'vata': return 'text-blue-600 bg-blue-100'
      case 'pitta': return 'text-red-600 bg-red-100'
      case 'kapha': return 'text-green-600 bg-green-100'
      case 'balanced': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!batchData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <HeartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Scan a QR code to see health insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <HeartIcon className="h-6 w-6 mr-2 text-red-500" />
          Health Insights
        </h2>
        <p className="text-gray-600 mt-1">
          Ayurvedic wisdom meets modern science for {batchData.commonName || 'your herb'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'benefits', label: 'Benefits', icon: SparklesIcon },
          { id: 'ayurveda', label: 'Ayurveda', icon: SunIcon },
          { id: 'usage', label: 'Usage', icon: BeakerIcon },
          { id: 'personalized', label: 'For You', icon: UserIcon }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'benefits' && (
          <motion.div
            key="benefits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Benefits</h3>
            
            {healthBenefits.map((benefit) => {
              const Icon = benefit.icon
              const isSelected = selectedBenefit === benefit.id
              
              return (
                <motion.div
                  key={benefit.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBenefit(isSelected ? null : benefit.id)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <Icon className="h-6 w-6 mr-3 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{benefit.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{benefit.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPotencyColor(benefit.potency)}`}>
                            {benefit.potency.toUpperCase()} POTENCY
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {benefit.timeToEffect}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">Scientific Evidence</h5>
                            <p className="text-sm text-gray-600">{benefit.scientificBasis}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">Recommended Dosage</h5>
                            <p className="text-sm text-gray-600">{benefit.dosage}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'ayurveda' && (
          <motion.div
            key="ayurveda"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ayurvedic Profile</h3>
            
            <div className="space-y-6">
              {/* Dosha Balance */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <SunIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Dosha Balance
                </h4>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDoshaColor(ayurvedicProfile.dosha)}`}>
                    {ayurvedicProfile.dosha.toUpperCase()}
                  </span>
                  <span className="ml-3 text-sm text-gray-600">{ayurvedicProfile.effect}</span>
                </div>
              </div>

              {/* Properties */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Ayurvedic Properties</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ayurvedicProfile.properties.map((property, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                      <StarIcon className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm text-gray-700">{property}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Taste & Potency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Rasa (Taste)</h4>
                  <div className="space-y-2">
                    {ayurvedicProfile.taste.map((taste, index) => (
                      <div key={index} className="flex items-center p-2 bg-blue-50 rounded">
                        <DropletIcon className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-sm text-gray-700">{taste}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Virya (Potency)</h4>
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <FireIcon className="h-4 w-4 mr-2 text-red-600" />
                    <span className="text-sm text-gray-700 capitalize">{ayurvedicProfile.potency}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'usage' && (
          <motion.div
            key="usage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Guidelines</h3>
            
            <div className="space-y-6">
              {/* Method & Timing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <BeakerIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Method
                  </h4>
                  <p className="text-sm text-gray-700">{usageRecommendations.method}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-green-600" />
                    Timing
                  </h4>
                  <p className="text-sm text-gray-700">{usageRecommendations.timing}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Duration
                </h4>
                <p className="text-sm text-gray-700">{usageRecommendations.duration}</p>
              </div>

              {/* Precautions */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-600" />
                  Precautions
                </h4>
                <div className="space-y-2">
                  {usageRecommendations.precautions.map((precaution, index) => (
                    <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{precaution}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synergies */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Synergistic Combinations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {usageRecommendations.synergies.map((synergy, index) => (
                    <div key={index} className="flex items-center p-3 bg-indigo-50 rounded-lg">
                      <SparklesIcon className="h-4 w-4 mr-2 text-indigo-600" />
                      <span className="text-sm text-gray-700">{synergy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'personalized' && (
          <motion.div
            key="personalized"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personalized for You</h3>
            
            {personalizedRecommendations.length > 0 ? (
              <div className="space-y-4">
                {personalizedRecommendations.map((rec, index) => {
                  const Icon = rec.icon
                  return (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <Icon className="h-6 w-6 mr-3 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Complete your profile to get personalized recommendations</p>
                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Complete Profile
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Important Disclaimer</p>
            <p>
              This information is for educational purposes only and is not intended to diagnose, treat, 
              cure, or prevent any disease. Always consult with a qualified healthcare provider before 
              starting any new supplement regimen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthInsightsPanel
