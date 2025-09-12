import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPinIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline'

// Mock Mapbox implementation for demo (replace with actual Mapbox in production)
interface MapboxMap {
  on: (event: string, callback: () => void) => void
  addSource: (id: string, source: any) => void
  addLayer: (layer: any) => void
  flyTo: (options: any) => void
  resize: () => void
}

interface Coordinates {
  latitude: number
  longitude: number
}

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

interface ProcessingStep {
  id: string
  performedDateTime: string
  performer: Array<{
    actor: {
      display: string
    }
  }>
  location: {
    reference: string
  }
}

interface InteractiveMapProps {
  coordinates: Coordinates | null
  collectionEvents: CollectionEvent[]
  processingSteps: ProcessingStep[]
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  coordinates,
  collectionEvents,
  processingSteps
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<MapboxMap | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [mapStyle, setMapStyle] = useState<'satellite' | 'terrain' | 'street'>('satellite')

  // Initialize map (mock implementation)
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Mock map initialization
    setTimeout(() => {
      setMapLoaded(true)
    }, 1000)

    // In production, initialize actual Mapbox:
    /*
    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN!
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: coordinates ? [coordinates.longitude, coordinates.latitude] : [77.2090, 28.6139],
      zoom: coordinates ? 15 : 5
    })

    map.current.on('load', () => {
      setMapLoaded(true)
      addLocationMarkers()
    })
    */
  }, [])

  // Add location markers to map
  const addLocationMarkers = () => {
    if (!map.current || !mapLoaded) return

    // Add collection location marker
    if (coordinates) {
      // Mock implementation - in production, add actual Mapbox markers
      console.log('Adding collection marker at:', coordinates)
    }

    // Add processing location markers
    processingSteps.forEach((step, index) => {
      // Mock implementation - in production, add actual Mapbox markers
      console.log('Adding processing marker for:', step.id)
    })
  }

  // Change map style
  const changeMapStyle = (style: 'satellite' | 'terrain' | 'street') => {
    setMapStyle(style)
    // In production, update actual map style
    /*
    if (map.current) {
      const styleUrls = {
        satellite: 'mapbox://styles/mapbox/satellite-v9',
        terrain: 'mapbox://styles/mapbox/outdoors-v12',
        street: 'mapbox://styles/mapbox/streets-v12'
      }
      map.current.setStyle(styleUrls[style])
    }
    */
  }

  // Get environmental data from collection event
  const getEnvironmentalData = (event: CollectionEvent) => {
    const envExtension = event.extension.find(
      ext => ext.url === 'http://trace-herb.com/fhir/StructureDefinition/environmental-conditions'
    )

    if (!envExtension?.extension) return null

    const temperature = envExtension.extension.find(ext => ext.url === 'temperature')?.valueDecimal
    const humidity = envExtension.extension.find(ext => ext.url === 'humidity')?.valueDecimal
    const soilPh = envExtension.extension.find(ext => ext.url === 'soil-ph')?.valueDecimal

    return { temperature, humidity, soilPh }
  }

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GlobeAltIcon className="w-6 h-6 text-trace-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Collection Journey</h3>
        </div>
        
        {/* Map Style Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View:</span>
          {(['satellite', 'terrain', 'street'] as const).map((style) => (
            <button
              key={style}
              onClick={() => changeMapStyle(style)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                mapStyle === style
                  ? 'bg-trace-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapContainer}
          className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden relative"
        >
          {!mapLoaded ? (
            // Loading state
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trace-green-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">Loading interactive map...</p>
              </div>
            </div>
          ) : (
            // Mock map display (replace with actual Mapbox in production)
            <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-blue-100">
              {/* Mock satellite imagery background */}
              <div 
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 10 0 L 0 0 0 10" fill="none" stroke="%23059669" stroke-width="0.5" opacity="0.3"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23grid)"/%3E%3C/svg%3E')`,
                  backgroundSize: '20px 20px'
                }}
              />
              
              {/* Collection Location Marker */}
              {coordinates && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    {/* Pulsing circle */}
                    <div className="absolute inset-0 bg-trace-green-400 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-trace-green-600 text-white p-3 rounded-full shadow-lg">
                      <MapPinIcon className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Processing Location Markers */}
              {processingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className={`absolute ${
                    index === 0 ? 'top-1/4 right-1/4' : 
                    index === 1 ? 'bottom-1/4 left-1/4' : 
                    'top-3/4 right-1/3'
                  } transform -translate-x-1/2 -translate-y-1/2`}
                >
                  <div className="bg-trace-blue-600 text-white p-2 rounded-full shadow-lg">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </motion.div>
              ))}

              {/* Journey Path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#059669"
                    />
                  </marker>
                </defs>
                <path
                  d="M 50% 50% Q 75% 25% 75% 25% Q 25% 75% 25% 75%"
                  stroke="#059669"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowhead)"
                  className="animate-pulse"
                />
              </svg>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <button className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <ArrowsPointingOutIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md">
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-trace-green-600 rounded-full"></div>
              <span>Collection Site</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-trace-blue-600 rounded-full"></div>
              <span>Processing Facility</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-trace-green-600"></div>
              <span>Supply Chain Path</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Collection Site Details */}
        {collectionEvents.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <MapPinIcon className="w-5 h-5 text-trace-green-600" />
              <h4 className="font-semibold text-gray-900">Collection Site</h4>
            </div>
            
            {coordinates && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Coordinates:</span>
                  <span className="font-mono">
                    {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                  </span>
                </div>
                
                {collectionEvents[0] && (
                  <>
                    <div className="flex justify-between">
                      <span>Collected by:</span>
                      <span>{collectionEvents[0].performer[0]?.actor.display}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(collectionEvents[0].performedDateTime).toLocaleDateString()}</span>
                    </div>
                  </>
                )}

                {/* Environmental Conditions */}
                {(() => {
                  const envData = getEnvironmentalData(collectionEvents[0])
                  if (!envData) return null
                  
                  return (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-2">Environmental Conditions</h5>
                      <div className="space-y-1">
                        {envData.temperature && (
                          <div className="flex justify-between">
                            <span>Temperature:</span>
                            <span>{envData.temperature}°C</span>
                          </div>
                        )}
                        {envData.humidity && (
                          <div className="flex justify-between">
                            <span>Humidity:</span>
                            <span>{envData.humidity}%</span>
                          </div>
                        )}
                        {envData.soilPh && (
                          <div className="flex justify-between">
                            <span>Soil pH:</span>
                            <span>{envData.soilPh}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {/* Processing Journey */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <InformationCircleIcon className="w-5 h-5 text-trace-blue-600" />
            <h4 className="font-semibold text-gray-900">Processing Journey</h4>
          </div>
          
          <div className="space-y-3">
            {processingSteps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-trace-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-medium text-gray-900">
                    {step.performer[0]?.actor.display}
                  </div>
                  <div className="text-gray-600">
                    {new Date(step.performedDateTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Satellite View Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">High-Resolution Satellite Imagery</p>
            <p>
              This map shows the exact GPS coordinates where your herbs were collected, 
              providing complete transparency about the origin and journey of your product.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveMap
