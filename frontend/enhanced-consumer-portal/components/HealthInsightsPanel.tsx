import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HeartIcon,
  SparklesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BookOpenIcon,
  UserIcon,
  BeakerIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'

interface HealthInsightsProps {
  batchData: any
  herbName: string
  className?: string
}

interface HealthBenefit {
  category: string
  benefits: string[]
  icon: React.ReactNode
  color: string
}

interface UsageRecommendation {
  method: string
  dosage: string
  timing: string
  duration: string
  precautions: string[]
}

interface AyurvedicProfile {
  dosha: 'Vata' | 'Pitta' | 'Kapha' | 'Balanced'
  suitability: 'Highly Suitable' | 'Suitable' | 'Use with Caution' | 'Not Recommended'
  explanation: string
}

const HealthInsightsPanel: React.FC<HealthInsightsProps> = ({ batchData, herbName, className = '' }) => {
  const [selectedTab, setSelectedTab] = useState<'benefits' | 'usage' | 'ayurveda' | 'quality'>('benefits')
  const [userDosha, setUserDosha] = useState<'Vata' | 'Pitta' | 'Kapha' | 'Balanced'>('Balanced')
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  // Herb-specific health information database
  const getHerbInfo = (herbName: string) => {
    const herbDatabase: { [key: string]: any } = {
      'Ashwagandha': {
        benefits: [
          {
            category: 'Stress & Anxiety',
            benefits: ['Reduces cortisol levels', 'Promotes relaxation', 'Improves sleep quality'],
            icon: <HeartIcon className="w-5 h-5" />,
            color: 'text-pink-600'
          },
          {
            category: 'Energy & Vitality',
            benefits: ['Boosts energy levels', 'Enhances physical performance', 'Supports muscle strength'],
            icon: <SparklesIcon className="w-5 h-5" />,
            color: 'text-yellow-600'
          },
          {
            category: 'Cognitive Health',
            benefits: ['Improves memory', 'Enhances focus', 'Supports brain function'],
            icon: <BookOpenIcon className="w-5 h-5" />,
            color: 'text-blue-600'
          }
        ],
        usage: {
          method: 'Powder or capsule',
          dosage: '300-600mg daily',
          timing: 'With meals or before bedtime',
          duration: '8-12 weeks for optimal results',
          precautions: [
            'Consult healthcare provider if pregnant or nursing',
            'May interact with thyroid medications',
            'Start with lower doses to assess tolerance'
          ]
        },
        ayurvedicProfiles: {
          'Vata': {
            suitability: 'Highly Suitable' as const,
            explanation: 'Ashwagandha is excellent for Vata constitution as it provides grounding, nourishment, and helps calm the nervous system.'
          },
          'Pitta': {
            suitability: 'Suitable' as const,
            explanation: 'Good for Pitta when used in moderation. Its cooling properties help balance excess heat and stress.'
          },
          'Kapha': {
            suitability: 'Use with Caution' as const,
            explanation: 'Use sparingly for Kapha constitution. Combine with warming spices to balance its heavy nature.'
          },
          'Balanced': {
            suitability: 'Suitable' as const,
            explanation: 'Excellent adaptogen for maintaining balance and supporting overall well-being.'
          }
        }
      },
      'Turmeric': {
        benefits: [
          {
            category: 'Anti-inflammatory',
            benefits: ['Reduces inflammation', 'Supports joint health', 'Helps with arthritis'],
            icon: <HeartIcon className="w-5 h-5" />,
            color: 'text-orange-600'
          },
          {
            category: 'Digestive Health',
            benefits: ['Improves digestion', 'Supports liver function', 'Aids nutrient absorption'],
            icon: <SparklesIcon className="w-5 h-5" />,
            color: 'text-green-600'
          },
          {
            category: 'Immune Support',
            benefits: ['Boosts immunity', 'Antioxidant properties', 'Supports wound healing'],
            icon: <BookOpenIcon className="w-5 h-5" />,
            color: 'text-purple-600'
          }
        ],
        usage: {
          method: 'Powder, capsule, or fresh root',
          dosage: '500-1000mg daily',
          timing: 'With meals for better absorption',
          duration: 'Can be used long-term',
          precautions: [
            'May increase bleeding risk with blood thinners',
            'Can worsen GERD in some individuals',
            'High doses may cause stomach upset'
          ]
        },
        ayurvedicProfiles: {
          'Vata': {
            suitability: 'Suitable' as const,
            explanation: 'Turmeric\'s warming nature helps balance Vata. Use with ghee or warm milk for best results.'
          },
          'Pitta': {
            suitability: 'Use with Caution' as const,
            explanation: 'Use in moderation as turmeric can increase heat. Combine with cooling herbs like coriander.'
          },
          'Kapha': {
            suitability: 'Highly Suitable' as const,
            explanation: 'Perfect for Kapha constitution. Its heating and drying properties help balance excess moisture and sluggishness.'
          },
          'Balanced': {
            suitability: 'Suitable' as const,
            explanation: 'Excellent daily herb for maintaining health and preventing disease.'
          }
        }
      }
    }

    // Default herb info for unknown herbs
    const defaultInfo = {
      benefits: [
        {
          category: 'General Wellness',
          benefits: ['Supports overall health', 'Natural antioxidants', 'Traditional medicinal use'],
          icon: <HeartIcon className="w-5 h-5" />,
          color: 'text-green-600'
        }
      ],
      usage: {
        method: 'As directed by healthcare provider',
        dosage: 'Follow traditional guidelines',
        timing: 'With meals',
        duration: 'As needed',
        precautions: ['Consult healthcare provider before use', 'Start with small amounts']
      },
      ayurvedicProfiles: {
        'Vata': { suitability: 'Suitable' as const, explanation: 'Generally beneficial for Vata constitution.' },
        'Pitta': { suitability: 'Suitable' as const, explanation: 'Generally beneficial for Pitta constitution.' },
        'Kapha': { suitability: 'Suitable' as const, explanation: 'Generally beneficial for Kapha constitution.' },
        'Balanced': { suitability: 'Suitable' as const, explanation: 'Generally beneficial for balanced constitution.' }
      }
    }

    return herbDatabase[herbName] || defaultInfo
  }

  const herbInfo = getHerbInfo(herbName)
  const currentAyurvedicProfile = herbInfo.ayurvedicProfiles[userDosha]

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'Highly Suitable': return 'text-green-600 bg-green-100'
      case 'Suitable': return 'text-blue-600 bg-blue-100'
      case 'Use with Caution': return 'text-yellow-600 bg-yellow-100'
      case 'Not Recommended': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDoshaIcon = (dosha: string) => {
    switch (dosha) {
      case 'Vata': return <SunIcon className="w-4 h-4" />
      case 'Pitta': return <SparklesIcon className="w-4 h-4" />
      case 'Kapha': return <MoonIcon className="w-4 h-4" />
      default: return <UserIcon className="w-4 h-4" />
    }
  }

  const tabs = [
    { id: 'benefits', label: 'Health Benefits', icon: <HeartIcon className="w-4 h-4" /> },
    { id: 'usage', label: 'Usage Guide', icon: <ClockIcon className="w-4 h-4" /> },
    { id: 'ayurveda', label: 'Ayurvedic Profile', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'quality', label: 'Quality Insights', icon: <BeakerIcon className="w-4 h-4" /> }
  ]

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${className}`}>
      {/* Disclaimer */}
      {showDisclaimer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-yellow-50 border-b border-yellow-200 p-4"
        >
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                <strong>Educational Information Only:</strong> This information is for educational purposes only and is not intended as medical advice. 
                Always consult with a qualified healthcare provider before using any herbal products.
              </p>
            </div>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-xl">
            <SparklesIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Health Insights</h3>
            <p className="text-sm text-gray-600">Personalized information for {herbName}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {selectedTab === 'benefits' && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {herbInfo.benefits.map((benefit: HealthBenefit, index: number) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gray-100 ${benefit.color}`}>
                      {benefit.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900">{benefit.category}</h4>
                  </div>
                  <ul className="space-y-2">
                    {benefit.benefits.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          )}

          {selectedTab === 'usage' && (
            <motion.div
              key="usage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Method</h4>
                  <p className="text-blue-800">{herbInfo.usage.method}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Dosage</h4>
                  <p className="text-green-800">{herbInfo.usage.dosage}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Timing</h4>
                  <p className="text-purple-800">{herbInfo.usage.timing}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Duration</h4>
                  <p className="text-orange-800">{herbInfo.usage.duration}</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span>Important Precautions</span>
                </h4>
                <ul className="space-y-2">
                  {herbInfo.usage.precautions.map((precaution: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">⚠️</span>
                      <span className="text-red-800">{precaution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {selectedTab === 'ayurveda' && (
            <motion.div
              key="ayurveda"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Dosha Selection */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Select Your Ayurvedic Constitution (Dosha)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['Vata', 'Pitta', 'Kapha', 'Balanced'] as const).map((dosha) => (
                    <button
                      key={dosha}
                      onClick={() => setUserDosha(dosha)}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-colors ${
                        userDosha === dosha
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {getDoshaIcon(dosha)}
                      <span className="font-medium">{dosha}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personalized Recommendation */}
              <div className={`rounded-xl p-6 border-2 ${getSuitabilityColor(currentAyurvedicProfile.suitability)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold">Recommendation for {userDosha} Constitution</h4>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold">
                    {currentAyurvedicProfile.suitability}
                  </span>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  {currentAyurvedicProfile.explanation}
                </p>
              </div>

              {/* Dosha Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <InformationCircleIcon className="w-5 h-5" />
                  <span>Don't know your dosha?</span>
                </h4>
                <p className="text-gray-700 text-sm">
                  Ayurvedic constitution (Prakriti) is determined by the balance of three doshas: Vata (air/space), 
                  Pitta (fire/water), and Kapha (earth/water). Consider consulting with an Ayurvedic practitioner 
                  for a proper assessment.
                </p>
              </div>
            </motion.div>
          )}

          {selectedTab === 'quality' && (
            <motion.div
              key="quality"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Quality Metrics from Batch Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batchData.certificate?.overallGrade && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Quality Grade</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {batchData.certificate.overallGrade}
                    </div>
                    <p className="text-sm text-green-700">Laboratory verified</p>
                  </div>
                )}

                {batchData.certificate?.purity && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Purity Level</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {batchData.certificate.purity}%
                    </div>
                    <p className="text-sm text-blue-700">Active compounds</p>
                  </div>
                )}

                {batchData.certificate?.organic && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Certification</h4>
                    <div className="text-lg font-bold text-purple-600">
                      Organic Certified
                    </div>
                    <p className="text-sm text-purple-700">Pesticide-free</p>
                  </div>
                )}

                <div className="bg-orange-50 rounded-xl p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Harvest Region</h4>
                  <div className="text-lg font-bold text-orange-600">
                    {batchData.events?.find((e: any) => e.type === 'Collection')?.location?.address?.split(',')[0] || 'Karnataka'}
                  </div>
                  <p className="text-sm text-orange-700">Known for quality herbs</p>
                </div>
              </div>

              {/* Quality Insights */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Quality Insights</h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">Harvested at optimal maturity for maximum potency</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">Processed using traditional methods to preserve active compounds</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">Third-party laboratory tested for purity and safety</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">Blockchain-verified supply chain ensures authenticity</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default HealthInsightsPanel
