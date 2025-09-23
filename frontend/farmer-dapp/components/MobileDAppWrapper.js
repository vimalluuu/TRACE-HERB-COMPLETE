import { useState, useEffect } from 'react'

const MobileDAppWrapper = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState({})

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://')
      setIsStandalone(standalone)
    }

    // Detect device information
    const detectDevice = () => {
      const userAgent = navigator.userAgent
      const info = {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
        isIOS: /iPad|iPhone|iPod/.test(userAgent),
        isAndroid: /Android/.test(userAgent),
        isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
        isChrome: /Chrome/.test(userAgent),
        hasTouch: 'ontouchstart' in window
      }
      setDeviceInfo(info)
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('📱 PWA install prompt available')
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt if not already installed and on mobile
      if (!isStandalone && deviceInfo.isMobile) {
        setShowInstallPrompt(true)
      }
    }

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      console.log('📡 App is online')
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('📡 App is offline')
    }

    // Initialize
    checkStandalone()
    detectDevice()
    setIsOnline(navigator.onLine)

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Service Worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update found')
            const newWorker = registration.installing
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🆕 New content available, please refresh')
                // You could show a toast notification here
              }
            })
          })
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isStandalone, deviceInfo.isMobile])

  // Install PWA
  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ PWA installation accepted')
      } else {
        console.log('❌ PWA installation declined')
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('❌ PWA installation error:', error)
    }
  }

  // Dismiss install prompt
  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Check if install prompt was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  return (
    <div className="mobile-dapp-wrapper">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm font-medium z-50">
          📡 You're offline - Data will sync when connection is restored
        </div>
      )}

      {/* PWA Install Prompt */}
      {showInstallPrompt && !isStandalone && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-600 text-white p-4 z-50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Install TRACE HERB Farmer</h3>
              <p className="text-xs opacity-90">Add to home screen for better experience</p>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={handleInstallClick}
                className="bg-white text-green-600 px-3 py-1 rounded text-sm font-medium"
              >
                Install
              </button>
              <button
                onClick={dismissInstallPrompt}
                className="text-white opacity-75 hover:opacity-100 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Install Instructions */}
      {deviceInfo.isIOS && deviceInfo.isSafari && !isStandalone && showInstallPrompt && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 shadow-lg">
          <div className="text-center">
            <h3 className="font-semibold text-sm mb-2">Install TRACE HERB Farmer</h3>
            <p className="text-xs mb-2">
              Tap the share button <span className="inline-block">📤</span> then "Add to Home Screen"
            </p>
            <button
              onClick={dismissInstallPrompt}
              className="text-white opacity-75 hover:opacity-100 text-sm underline"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`${!isOnline ? 'pt-10' : ''} ${showInstallPrompt && !isStandalone ? 'pb-20' : ''}`}>
        {children}
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-dapp-wrapper {
          min-height: 100vh;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Prevent zoom on input focus */
        @media screen and (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
        
        /* Safe area handling for notched devices */
        @supports (padding: max(0px)) {
          .mobile-dapp-wrapper {
            padding-left: max(12px, env(safe-area-inset-left));
            padding-right: max(12px, env(safe-area-inset-right));
          }
        }
        
        /* Hide scrollbars on mobile */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            display: none;
          }
          
          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>
    </div>
  )
}

export default MobileDAppWrapper
