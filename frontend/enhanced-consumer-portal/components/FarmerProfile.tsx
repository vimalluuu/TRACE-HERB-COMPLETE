import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  GlobeAltIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface CollectionEvent {
  id: string
  performedDateTime: string
  performer: Array<{
    actor: {
      display: string
    }
  }>
  extension: Array<{
    url: string
    extension?: Array<{
      url: string
      valueDecimal?: number
    }>
  }>
}

interface FarmerProfileProps {
  collectionEvents: CollectionEvent[]
}

const FarmerProfile: React.FC<FarmerProfileProps> = ({ collectionEvents }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'story' | 'community'>('profile')

  // Extract farmer information from collection events
  const getFarmerInfo = () => {
    if (collectionEvents.length === 0) {
      // Mock farmer data for demo
      return {
        name: 'Ramesh Kumar',
        location: 'Shirdi, Maharashtra',
        experience: '15 years',
        specialization: 'Medicinal Herbs',
        certifications: ['Organic Certified', 'Fair Trade'],
        rating: 4.8,
        totalCollections: 156,
        languages: ['Hindi', 'Marathi', 'English']
      }
    }

    const farmer = collectionEvents[0].performer[0]?.actor.display || 'Unknown Farmer'
    return {
      name: farmer,
      location: 'Maharashtra, India',
      experience: '10+ years',
      specialization: 'Ayurvedic Herbs',
      certifications: ['Organic Certified'],
      rating: 4.5,
      totalCollections: 89,
      languages: ['Hindi', 'English']
    }
  }

  const farmerInfo = getFarmerInfo()

  const farmerStory = {
    introduction: `Hello! I'm ${farmerInfo.name}, a third-generation farmer specializing in cultivating authentic Ayurvedic herbs. My family has been growing medicinal plants in the fertile soils of Maharashtra for over 50 years.`,
    philosophy: "I believe in sustainable farming practices that not only produce the highest quality herbs but also preserve our environment for future generations. Every plant I grow is treated with care and respect, following traditional methods passed down through generations.",
    achievements: [
      "Certified organic farmer since 2015",
      "Winner of Best Medicinal Plant Grower Award 2022",
      "Trained over 50 local farmers in organic practices",
      "Contributed to conservation of 12 rare herb species"
    ],
    dailyLife: "My day starts at 5 AM with a walk through the fields, checking on each plant's health. I use traditional knowledge combined with modern organic techniques to ensure the best quality herbs. In the evenings, I often meet with other farmers to share knowledge and experiences."
  }

  const communityImpact = {
    farmersSupported: 25,
    jobsCreated: 12,
    conservationProjects: 3,
    communityPrograms: [
      {
        name: "Organic Farming Training",
        description: "Teaching sustainable farming practices to local farmers",
        participants: 50,
        impact: "Increased organic adoption by 40% in the region"
      },
      {
        name: "Seed Conservation Initiative",
        description: "Preserving rare and indigenous herb varieties",
        participants: 15,
        impact: "Saved 12 endangered medicinal plant species"
      },
      {
        name: "Women's Cooperative",
        description: "Empowering women through herb processing and packaging",
        participants: 20,
        impact: "Generated additional income for 20 families"
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserIcon className="w-6 h-6 text-trace-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Farmer Profile</h3>
        </div>
      </div>

      {/* Farmer Card */}
      <div className="bg-gradient-to-r from-trace-green-50 to-emerald-50 border border-trace-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-trace-green-600 to-trace-green-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {farmerInfo.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-xl font-bold text-gray-900">{farmerInfo.name}</h4>
              <CheckBadgeIcon className="w-5 h-5 text-blue-500" title="Verified Farmer" />
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{farmerInfo.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{farmerInfo.experience} experience</span>
              </div>
            </div>
            
            {/* Rating and Stats */}
            <div className="flex items-center space-x-6 mb-3">
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(farmerInfo.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">{farmerInfo.rating}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{farmerInfo.totalCollections}</span> collections
              </div>
            </div>
            
            {/* Specialization */}
            <div className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Specialization:</span> {farmerInfo.specialization}
            </div>
            
            {/* Certifications */}
            <div className="flex flex-wrap gap-2">
              {farmerInfo.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'profile', label: 'Profile', icon: UserIcon },
            { id: 'story', label: 'Story', icon: ChatBubbleLeftRightIcon },
            { id: 'community', label: 'Community Impact', icon: HeartIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-trace-green-600 text-trace-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Detailed Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Farming Details</h5>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farm Size:</span>
                    <span className="font-medium text-gray-900">5.2 acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Soil Type:</span>
                    <span className="font-medium text-gray-900">Black Cotton Soil</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Irrigation:</span>
                    <span className="font-medium text-gray-900">Drip Irrigation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farming Method:</span>
                    <span className="font-medium text-gray-900">Organic</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Crops Grown</h5>
                <div className="space-y-2">
                  {[
                    'Ashwagandha (Withania somnifera)',
                    'Turmeric (Curcuma longa)',
                    'Brahmi (Bacopa monnieri)',
                    'Tulsi (Ocimum sanctum)',
                    'Neem (Azadirachta indica)'
                  ].map((crop, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-trace-green-500 rounded-full"></div>
                      <span className="text-gray-700">{crop}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Languages and Contact */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Communication</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Languages Spoken:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {farmerInfo.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Preferred Contact:</span>
                  <div className="text-sm text-gray-900 mt-1">WhatsApp, Phone Call</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'story' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Introduction */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="font-semibold text-gray-900 mb-3">My Journey</h5>
              <p className="text-gray-700 leading-relaxed mb-4">{farmerStory.introduction}</p>
              <p className="text-gray-700 leading-relaxed">{farmerStory.philosophy}</p>
            </div>

            {/* Daily Life */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="font-semibold text-gray-900 mb-3">A Day in My Life</h5>
              <p className="text-gray-700 leading-relaxed">{farmerStory.dailyLife}</p>
            </div>

            {/* Achievements */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="font-semibold text-gray-900 mb-3">Achievements & Recognition</h5>
              <div className="space-y-3">
                {farmerStory.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckBadgeIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Gallery Placeholder */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="font-semibold text-gray-900 mb-3">Farm Gallery</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Photos of the farm, crops, and farming activities (coming soon)
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'community' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Impact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-trace-green-600 mb-1">
                  {communityImpact.farmersSupported}
                </div>
                <div className="text-sm text-gray-600">Farmers Supported</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-trace-blue-600 mb-1">
                  {communityImpact.jobsCreated}
                </div>
                <div className="text-sm text-gray-600">Jobs Created</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {communityImpact.conservationProjects}
                </div>
                <div className="text-sm text-gray-600">Conservation Projects</div>
              </div>
            </div>

            {/* Community Programs */}
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-900">Community Programs</h5>
              {communityImpact.communityPrograms.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h6 className="font-medium text-gray-900">{program.name}</h6>
                    <span className="px-2 py-1 bg-trace-green-100 text-trace-green-800 text-xs font-medium rounded">
                      {program.participants} participants
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                  <div className="text-sm text-gray-700">
                    <strong>Impact:</strong> {program.impact}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <GlobeAltIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Connect with {farmerInfo.name}</p>
            <p>
              Want to learn more about sustainable farming or support our community initiatives? 
              Feel free to reach out through our platform's messaging system.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerProfile
