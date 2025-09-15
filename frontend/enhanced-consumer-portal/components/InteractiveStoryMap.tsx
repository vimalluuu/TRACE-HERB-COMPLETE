import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPinIcon, 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  PhotoIcon,
  StarIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

interface StoryMapProps {
  batchData: any
  onClose: () => void
}

interface StoryStep {
  id: string
  title: string
  description: string
  location: {
    lat: number
    lng: number
    name: string
  }
  timestamp: string
  media?: {
    type: 'image' | 'video'
    url: string
    caption: string
  }
  farmerStory?: string
  environmentalData?: {
    temperature: number
    humidity: number
    soilPH: number
    airQuality: string
  }
}

const InteractiveStoryMap: React.FC<StoryMapProps> = ({ batchData, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [userLikes, setUserLikes] = useState<string[]>([])
  const [showEnvironmentalData, setShowEnvironmentalData] = useState(false)

  // Generate story steps from batch data
  const generateStorySteps = (batch: any): StoryStep[] => {
    const steps: StoryStep[] = []
    
    // Collection Step
    if (batch.events?.find((e: any) => e.type === 'Collection')) {
      const collectionEvent = batch.events.find((e: any) => e.type === 'Collection')
      steps.push({
        id: 'collection',
        title: '🌱 Herb Collection',
        description: `Fresh ${batch.target?.herbName || 'herbs'} carefully harvested from organic farms`,
        location: {
          lat: collectionEvent.location?.coordinates?.lat || 12.9716,
          lng: collectionEvent.location?.coordinates?.lng || 77.5946,
          name: collectionEvent.location?.address || 'Organic Farm, Karnataka'
        },
        timestamp: collectionEvent.timestamp,
        farmerStory: `"I've been growing these herbs for over 20 years using traditional methods passed down from my grandfather. Each plant is hand-selected at the perfect time for maximum potency."`,
        media: {
          type: 'image',
          url: '/images/herb-collection.jpg',
          caption: 'Early morning harvest for optimal freshness'
        },
        environmentalData: {
          temperature: 24,
          humidity: 65,
          soilPH: 6.8,
          airQuality: 'Excellent'
        }
      })
    }

    // Processing Step
    if (batch.events?.find((e: any) => e.type === 'Processing')) {
      const processingEvent = batch.events.find((e: any) => e.type === 'Processing')
      steps.push({
        id: 'processing',
        title: '⚗️ Traditional Processing',
        description: 'Herbs processed using time-tested Ayurvedic methods',
        location: {
          lat: 12.9716,
          lng: 77.5946,
          name: 'Ayurvedic Processing Center'
        },
        timestamp: processingEvent.timestamp,
        farmerStory: `"We use traditional sun-drying and grinding methods to preserve the natural essence and therapeutic properties of each herb."`,
        media: {
          type: 'image',
          url: '/images/herb-processing.jpg',
          caption: 'Traditional processing maintains herb potency'
        }
      })
    }

    // Lab Testing Step
    if (batch.events?.find((e: any) => e.type === 'Laboratory Testing')) {
      const labEvent = batch.events.find((e: any) => e.type === 'Laboratory Testing')
      steps.push({
        id: 'testing',
        title: '🔬 Quality Verification',
        description: 'Rigorous testing ensures purity and potency',
        location: {
          lat: 12.9716,
          lng: 77.5946,
          name: 'Certified Testing Laboratory'
        },
        timestamp: labEvent.timestamp,
        farmerStory: `"Every batch undergoes comprehensive testing for heavy metals, pesticides, and active compounds to ensure you receive only the highest quality herbs."`,
        media: {
          type: 'image',
          url: '/images/lab-testing.jpg',
          caption: 'Advanced testing equipment ensures quality'
        }
      })
    }

    return steps
  }

  const [storySteps] = useState<StoryStep[]>(generateStorySteps(batchData))

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentStep < storySteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1)
      }, 5000) // 5 seconds per step
    } else if (currentStep >= storySteps.length - 1) {
      setIsPlaying(false)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentStep, storySteps.length])

  const handleLike = (stepId: string) => {
    setUserLikes(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const handleShare = (step: StoryStep) => {
    if (navigator.share) {
      navigator.share({
        title: `${step.title} - TRACE HERB`,
        text: step.description,
        url: window.location.href
      })
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (storySteps.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
          <h3 className="text-xl font-bold mb-4">No Story Available</h3>
          <p className="text-gray-600 mb-6">This batch doesn't have enough data to create an interactive story.</p>
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const currentStoryStep = storySteps[currentStep]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🌿 Herb Journey Story</h2>
              <p className="text-green-100">Interactive provenance experience</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors"
              >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
              </button>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / storySteps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Step Header */}
              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentStoryStep.title}
                </h3>
                <p className="text-lg text-gray-600">
                  {currentStoryStep.description}
                </p>
              </div>

              {/* Media */}
              {currentStoryStep.media && (
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PhotoIcon className="w-24 h-24 text-gray-400" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white text-sm">{currentStoryStep.media.caption}</p>
                  </div>
                </div>
              )}

              {/* Location & Time */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    {currentStoryStep.location.name}
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  {new Date(currentStoryStep.timestamp).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Farmer Story */}
              {currentStoryStep.farmerStory && (
                <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                      👨‍🌾
                    </div>
                    <div>
                      <p className="text-green-800 italic">
                        {currentStoryStep.farmerStory}
                      </p>
                      <p className="text-sm text-green-600 mt-2 font-semibold">
                        - Local Farmer
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Environmental Data */}
              {currentStoryStep.environmentalData && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <button
                    onClick={() => setShowEnvironmentalData(!showEnvironmentalData)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="font-semibold text-gray-900">Environmental Conditions</span>
                    <span className="text-gray-500">{showEnvironmentalData ? '−' : '+'}</span>
                  </button>
                  
                  {showEnvironmentalData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 grid grid-cols-2 gap-4"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {currentStoryStep.environmentalData.temperature}°C
                        </div>
                        <div className="text-sm text-gray-600">Temperature</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentStoryStep.environmentalData.humidity}%
                        </div>
                        <div className="text-sm text-gray-600">Humidity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {currentStoryStep.environmentalData.soilPH}
                        </div>
                        <div className="text-sm text-gray-600">Soil pH</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {currentStoryStep.environmentalData.airQuality}
                        </div>
                        <div className="text-sm text-gray-600">Air Quality</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Interaction Buttons */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => handleLike(currentStoryStep.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    userLikes.includes(currentStoryStep.id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <HeartIcon className={`w-5 h-5 ${userLikes.includes(currentStoryStep.id) ? 'fill-current' : ''}`} />
                  <span>Like</span>
                </button>
                
                <button
                  onClick={() => handleShare(currentStoryStep)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 p-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {storySteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentStep(Math.min(storySteps.length - 1, currentStep + 1))}
            disabled={currentStep === storySteps.length - 1}
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
          >
            Next
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default InteractiveStoryMap
