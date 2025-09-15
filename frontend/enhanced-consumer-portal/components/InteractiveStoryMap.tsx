import React, { useState, useEffect } from 'react'
import {
  MapPinIcon,
  UserIcon,
  BeakerIcon,
  TruckIcon,
  SunIcon,
  CloudIcon,
  DropletIcon,
  ThermometerIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface StoryMapProps {
  qrCode: string
  batchData: any
}

interface StoryNode {
  id: string
  title: string
  description: string
  timestamp: string
  location: string
  actor: string
  icon: React.ComponentType<any>
  details: any
  environmental?: {
    temperature: number
    humidity: number
    rainfall: number
    soilPh: number
  }
  narrative?: string
}

const InteractiveStoryMap: React.FC<StoryMapProps> = ({ qrCode, batchData }) => {
  const [activeNode, setActiveNode] = useState<string | null>(null)

  // Generate story nodes from batch data
  const generateStoryNodes = (): StoryNode[] => {
    if (!batchData) return []

    return [
      {
        id: 'seed',
        title: 'Sacred Seeds Planted',
        description: 'Traditional seeds blessed by village elders',
        timestamp: batchData.plantingDate || '2024-03-15',
        location: `${batchData.village}, ${batchData.district}`,
        actor: batchData.farmerName || 'Rajesh Kumar',
        icon: SunIcon,
        details: {
          seedVariety: batchData.botanicalName || 'Withania somnifera',
          blessings: 'Blessed during Akshaya Tritiya',
          moonPhase: 'Waxing Moon - Optimal for growth'
        },
        environmental: {
          temperature: 28,
          humidity: 65,
          rainfall: 45,
          soilPh: 6.8
        },
        narrative: `In the early morning mist of ${batchData.village}, ${batchData.farmerName} carefully planted these sacred Ashwagandha seeds. Following ancient Ayurvedic traditions, the seeds were blessed during the auspicious time of Brahma Muhurta, when the earth's energy is most receptive to new life.`,
        images: ['/images/planting.jpg', '/images/blessed-seeds.jpg']
      },
      {
        id: 'growth',
        title: 'Nurturing Growth',
        description: 'Organic cultivation with traditional methods',
        timestamp: batchData.growthPeriod || '2024-04-20',
        location: `${batchData.village}, ${batchData.district}`,
        actor: batchData.farmerName || 'Rajesh Kumar',
        icon: DropletIcon,
        details: {
          waterSource: 'Natural spring water',
          fertilizer: 'Cow dung compost + Neem cake',
          pestControl: 'Neem oil spray + Companion planting'
        },
        environmental: {
          temperature: 32,
          humidity: 70,
          rainfall: 120,
          soilPh: 7.0
        },
        narrative: `For 120 days, ${batchData.farmerName} tended to these plants with the devotion of a parent. Using only organic methods passed down through generations, the Ashwagandha thrived in the mineral-rich soil of ${batchData.district}, drinking pure spring water and basking in the Himalayan sun.`,
        images: ['/images/growing-plants.jpg', '/images/organic-care.jpg']
      },
      {
        id: 'harvest',
        title: 'Sacred Harvest',
        description: 'Hand-picked at optimal potency',
        timestamp: batchData.collectionDate || '2024-08-15',
        location: `${batchData.village}, ${batchData.district}`,
        actor: batchData.farmerName || 'Rajesh Kumar',
        icon: UserIcon,
        details: {
          harvestTime: 'Pre-dawn (4:30 AM)',
          method: 'Hand-picked roots',
          potency: 'Peak alkaloid content',
          quantity: `${batchData.quantity || 5} kg`
        },
        environmental: {
          temperature: 25,
          humidity: 60,
          rainfall: 15,
          soilPh: 6.9
        },
        narrative: `At the break of dawn, when the morning dew still kissed the leaves, ${batchData.farmerName} carefully harvested these precious roots. Each plant was thanked according to ancient traditions, ensuring the spiritual essence remained intact along with the medicinal properties.`,
        images: ['/images/harvest.jpg', '/images/fresh-roots.jpg']
      },
      {
        id: 'processing',
        title: 'Traditional Processing',
        description: 'Ayurvedic processing methods preserved',
        timestamp: batchData.processingDate || '2024-08-16',
        location: 'Premium Herb Processing, Haridwar',
        actor: 'Master Processor Vikram Singh',
        icon: BeakerIcon,
        details: {
          method: 'Sun-drying + Traditional grinding',
          temperature: 'Below 40°C to preserve nutrients',
          duration: '7 days natural drying',
          purity: '99.8% pure extract'
        },
        narrative: `Master Processor Vikram Singh, with 30 years of experience in Ayurvedic processing, carefully transformed these fresh roots using time-honored methods. The slow, gentle process ensures maximum retention of bioactive compounds while maintaining the herb's spiritual integrity.`,
        images: ['/images/processing.jpg', '/images/traditional-methods.jpg']
      },
      {
        id: 'testing',
        title: 'Quality Verification',
        description: 'Scientific validation meets ancient wisdom',
        timestamp: batchData.testingDate || '2024-08-18',
        location: 'Premium Quality Labs, Delhi',
        actor: 'Dr. Priya Sharma, Chief Analyst',
        icon: ShieldCheckIcon,
        details: {
          withanolides: '3.2% (Excellent)',
          heavyMetals: 'Below detection limits',
          microbial: 'Completely safe',
          authenticity: '100% verified'
        },
        narrative: `Dr. Priya Sharma's team conducted comprehensive testing using both modern scientific methods and traditional Ayurvedic assessment techniques. The results confirmed exceptional quality - this batch contains optimal levels of withanolides, the key bioactive compounds that make Ashwagandha so powerful.`,
        images: ['/images/lab-testing.jpg', '/images/quality-report.jpg']
      },
      {
        id: 'delivery',
        title: 'Journey to You',
        description: 'Carefully transported to preserve quality',
        timestamp: new Date().toISOString().split('T')[0],
        location: 'Your Location',
        actor: 'Trusted Logistics Partner',
        icon: TruckIcon,
        details: {
          packaging: 'Eco-friendly, moisture-proof',
          transport: 'Temperature-controlled',
          tracking: qrCode,
          carbonFootprint: '2.3 kg CO2 (Offset by tree planting)'
        },
        narrative: `Your Ashwagandha has traveled from the sacred soils of ${batchData.district} to reach you, maintaining its potency and purity throughout the journey. Every step has been carefully monitored to ensure you receive the same quality that left the farm.`,
        images: ['/images/packaging.jpg', '/images/delivery.jpg']
      }
    ]
  }

  const storyNodes = generateStoryNodes()

  const playStoryMode = () => {
    setPlayingStory(true)
    setCurrentStoryIndex(0)
    setActiveNode(storyNodes[0]?.id)
  }

  useEffect(() => {
    if (playingStory && currentStoryIndex < storyNodes.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStoryIndex(prev => prev + 1)
        setActiveNode(storyNodes[currentStoryIndex + 1]?.id)
      }, 4000)
      return () => clearTimeout(timer)
    } else if (playingStory && currentStoryIndex >= storyNodes.length - 1) {
      setTimeout(() => setPlayingStory(false), 2000)
    }
  }, [playingStory, currentStoryIndex, storyNodes])

  const getEnvironmentalColor = (value: number, type: string) => {
    switch (type) {
      case 'temperature':
        return value > 30 ? 'text-red-500' : value > 20 ? 'text-green-500' : 'text-blue-500'
      case 'humidity':
        return value > 70 ? 'text-blue-500' : value > 50 ? 'text-green-500' : 'text-yellow-500'
      case 'rainfall':
        return value > 100 ? 'text-blue-600' : value > 50 ? 'text-green-500' : 'text-yellow-500'
      case 'soilPh':
        return value > 7.5 ? 'text-purple-500' : value > 6.5 ? 'text-green-500' : 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  if (!batchData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <MapPinIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Scan a QR code to see the interactive story map</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <MapPinIcon className="h-6 w-6 mr-2 text-green-600" />
            Interactive Story Map
          </h2>
          <p className="text-gray-600 mt-1">
            Follow your {batchData.commonName || 'herb'}'s sacred journey from seed to shelf
          </p>
        </div>
        <motion.button
          onClick={playStoryMode}
          disabled={playingStory}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <StarIcon className="h-4 w-4 mr-2" />
          {playingStory ? 'Playing Story...' : 'Play Story'}
        </motion.button>
      </div>

      {/* Story Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-blue-400"></div>

        {/* Story Nodes */}
        <div className="space-y-6">
          {storyNodes.map((node, index) => {
            const Icon = node.icon
            const isActive = activeNode === node.id
            const isPast = playingStory && index < currentStoryIndex
            const isCurrent = playingStory && index === currentStoryIndex

            return (
              <motion.div
                key={node.id}
                className={`relative flex items-start cursor-pointer transition-all duration-300 ${
                  isActive ? 'transform scale-105' : ''
                }`}
                onClick={() => !playingStory && setActiveNode(isActive ? null : node.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Timeline Node */}
                <motion.div
                  className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                    isCurrent
                      ? 'bg-yellow-400 border-yellow-500 shadow-lg shadow-yellow-400/50'
                      : isPast
                      ? 'bg-green-500 border-green-600'
                      : isActive
                      ? 'bg-blue-500 border-blue-600'
                      : 'bg-white border-gray-300'
                  } transition-all duration-300`}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isCurrent
                        ? 'text-yellow-800'
                        : isPast
                        ? 'text-white'
                        : isActive
                        ? 'text-white'
                        : 'text-gray-500'
                    }`}
                  />
                </motion.div>

                {/* Content */}
                <div className="ml-6 flex-1">
                  <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{node.title}</h3>
                      <span className="text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(node.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{node.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="mr-4">{node.location}</span>
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span>{node.actor}</span>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t pt-4 mt-4"
                        >
                          {/* Narrative */}
                          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                            <p className="text-gray-700 italic leading-relaxed">
                              "{node.narrative}"
                            </p>
                          </div>

                          {/* Environmental Data */}
                          {node.environmental && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                <CloudIcon className="h-4 w-4 mr-2" />
                                Environmental Conditions
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center p-2 bg-gray-50 rounded">
                                  <ThermometerIcon className={`h-5 w-5 mx-auto mb-1 ${getEnvironmentalColor(node.environmental.temperature, 'temperature')}`} />
                                  <div className="text-sm font-medium">{node.environmental.temperature}°C</div>
                                  <div className="text-xs text-gray-500">Temperature</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded">
                                  <DropletIcon className={`h-5 w-5 mx-auto mb-1 ${getEnvironmentalColor(node.environmental.humidity, 'humidity')}`} />
                                  <div className="text-sm font-medium">{node.environmental.humidity}%</div>
                                  <div className="text-xs text-gray-500">Humidity</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded">
                                  <CloudIcon className={`h-5 w-5 mx-auto mb-1 ${getEnvironmentalColor(node.environmental.rainfall, 'rainfall')}`} />
                                  <div className="text-sm font-medium">{node.environmental.rainfall}mm</div>
                                  <div className="text-xs text-gray-500">Rainfall</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded">
                                  <BeakerIcon className={`h-5 w-5 mx-auto mb-1 ${getEnvironmentalColor(node.environmental.soilPh, 'soilPh')}`} />
                                  <div className="text-sm font-medium">{node.environmental.soilPh}</div>
                                  <div className="text-xs text-gray-500">Soil pH</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Technical Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(node.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium text-gray-600 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="text-sm text-gray-800">{value}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Story Progress */}
      {playingStory && (
        <div className="mt-6 bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Story Progress</span>
            <span className="text-sm text-gray-500">
              {currentStoryIndex + 1} of {storyNodes.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStoryIndex + 1) / storyNodes.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveStoryMap
