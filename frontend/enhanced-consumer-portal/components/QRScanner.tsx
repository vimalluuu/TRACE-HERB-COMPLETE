import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CameraIcon, 
  XMarkIcon, 
  PhotoIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import jsQR from 'jsqr'
import toast from 'react-hot-toast'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (qrCode: string) => void
  onError?: (error: string) => void
}

interface ScanResult {
  data: string
  timestamp: number
  confidence: number
}

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>()

  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('')
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanLine, setScanLine] = useState(0)

  // Get available camera devices
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setDevices(videoDevices)
      
      // Prefer back camera for mobile devices
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      )
      setCurrentDeviceId(backCamera?.deviceId || videoDevices[0]?.deviceId || '')
    } catch (error) {
      console.error('Error getting devices:', error)
      onError?.('Failed to access camera devices')
    }
  }, [onError])

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setIsProcessing(true)
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: currentDeviceId ? undefined : { ideal: 'environment' }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setHasPermission(true)
        setIsScanning(true)
        startScanning()
      }
    } catch (error) {
      console.error('Error starting camera:', error)
      setHasPermission(false)
      onError?.('Camera access denied or not available')
      toast.error('Camera access denied. Please enable camera permissions.')
    } finally {
      setIsProcessing(false)
    }
  }, [currentDeviceId, onError])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setIsScanning(false)
  }, [])

  // QR code scanning logic
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame)
      return
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for QR scanning
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    try {
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      })

      if (qrCode && qrCode.data) {
        // Validate QR code format (should start with QR_ for TRACE HERB)
        if (qrCode.data.startsWith('QR_') || qrCode.data.includes('TRACE_HERB')) {
          const scanResult: ScanResult = {
            data: qrCode.data,
            timestamp: Date.now(),
            confidence: 1.0 // jsQR doesn't provide confidence, so we use 1.0
          }

          // Check if this QR code was recently scanned to avoid duplicates
          const recentScan = scanHistory.find(scan => 
            scan.data === qrCode.data && 
            Date.now() - scan.timestamp < 3000 // 3 second cooldown
          )

          if (!recentScan) {
            setScanHistory(prev => [scanResult, ...prev.slice(0, 9)]) // Keep last 10 scans
            
            // Visual feedback
            toast.success('QR Code detected!', {
              icon: '📱',
              duration: 2000
            })

            // Vibrate if supported
            if ('vibrate' in navigator) {
              navigator.vibrate([100, 50, 100])
            }

            // Call onScan with delay for better UX
            setTimeout(() => {
              onScan(qrCode.data)
              stopCamera()
              onClose()
            }, 500)
            
            return
          }
        } else {
          // Invalid QR code format
          toast.error('Invalid QR code format. Please scan a TRACE HERB product QR code.', {
            duration: 3000
          })
        }
      }
    } catch (error) {
      console.error('QR scanning error:', error)
    }

    // Update scan line animation
    setScanLine(prev => (prev + 2) % 100)

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanFrame)
  }, [isScanning, scanHistory, onScan, onClose, stopCamera])

  // Start scanning animation
  const startScanning = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    scanFrame()
  }, [scanFrame])

  // Handle file upload for QR scanning
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          setIsProcessing(false)
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        try {
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height)
          
          if (qrCode && qrCode.data) {
            if (qrCode.data.startsWith('QR_') || qrCode.data.includes('TRACE_HERB')) {
              toast.success('QR Code found in image!')
              onScan(qrCode.data)
              onClose()
            } else {
              toast.error('Invalid QR code format in image')
            }
          } else {
            toast.error('No QR code found in image')
          }
        } catch (error) {
          console.error('Error scanning uploaded image:', error)
          toast.error('Error processing image')
        }
        
        setIsProcessing(false)
      }
      
      img.onerror = () => {
        toast.error('Error loading image')
        setIsProcessing(false)
      }
      
      img.src = e.target?.result as string
    }
    
    reader.readAsDataURL(file)
  }, [onScan, onClose])

  // Switch camera device
  const switchCamera = useCallback(() => {
    if (devices.length <= 1) return
    
    const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId)
    const nextIndex = (currentIndex + 1) % devices.length
    setCurrentDeviceId(devices[nextIndex].deviceId)
  }, [devices, currentDeviceId])

  // Initialize scanner when opened
  useEffect(() => {
    if (isOpen) {
      getDevices().then(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          startCamera()
        } else {
          setHasPermission(false)
          onError?.('Camera not supported on this device')
        }
      })
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, getDevices, startCamera, stopCamera, onError])

  // Update camera when device changes
  useEffect(() => {
    if (isOpen && currentDeviceId && hasPermission) {
      startCamera()
    }
  }, [currentDeviceId, isOpen, hasPermission, startCamera])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      >
        <div className="relative w-full h-full max-w-md mx-auto bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <h2 className="text-lg font-semibold">Scan QR Code</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Camera View */}
          <div className="relative w-full h-full">
            {hasPermission === null || isProcessing ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <ArrowPathIcon className="w-12 h-12 mx-auto mb-4 animate-spin" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            ) : hasPermission === false ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white p-6">
                  <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-400" />
                  <h3 className="text-xl font-semibold mb-2">Camera Access Required</h3>
                  <p className="text-gray-300 mb-6">
                    Please enable camera permissions to scan QR codes
                  </p>
                  <button
                    onClick={startCamera}
                    className="bg-trace-green-600 hover:bg-trace-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Enable Camera
                  </button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Scanning Frame */}
                    <div className="w-64 h-64 border-2 border-white/50 relative">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-trace-green-400"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-trace-green-400"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-trace-green-400"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-trace-green-400"></div>
                      
                      {/* Scanning line */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-trace-green-400 shadow-glow"
                        animate={{ y: [0, 256, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    
                    <p className="text-white text-center mt-4 text-sm">
                      Position QR code within the frame
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-center space-x-6">
              {/* Upload from Gallery */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                title="Upload from Gallery"
              >
                <PhotoIcon className="w-6 h-6" />
              </button>

              {/* Switch Camera */}
              {devices.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                  title="Switch Camera"
                >
                  <ArrowPathIcon className="w-6 h-6" />
                </button>
              )}

              {/* Manual Entry */}
              <button
                onClick={() => {
                  const qrCode = prompt('Enter QR code manually:')
                  if (qrCode) {
                    onScan(qrCode)
                    onClose()
                  }
                }}
                className="px-4 py-2 bg-trace-green-600 hover:bg-trace-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Manual Entry
              </button>
            </div>

            {/* Scan History */}
            {scanHistory.length > 0 && (
              <div className="mt-4">
                <p className="text-white text-xs mb-2">Recent Scans:</p>
                <div className="flex space-x-2 overflow-x-auto">
                  {scanHistory.slice(0, 3).map((scan, index) => (
                    <button
                      key={scan.timestamp}
                      onClick={() => {
                        onScan(scan.data)
                        onClose()
                      }}
                      className="flex-shrink-0 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-full transition-colors"
                    >
                      {scan.data.substring(0, 12)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QRScanner
