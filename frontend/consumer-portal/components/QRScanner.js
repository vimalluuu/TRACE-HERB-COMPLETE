import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

const QRScanner = ({ onScan, onError }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        setHasCamera(hasCamera);

        if (!hasCamera) {
          onError?.(new Error('No camera found'));
          return;
        }

        if (videoRef.current) {
          qrScannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
              if (result?.data) {
                onScan?.(result.data);
                setIsScanning(false);
              }
            },
            {
              returnDetailedScanResult: true,
              highlightScanRegion: true,
              highlightCodeOutline: true,
              preferredCamera: 'environment', // Use back camera on mobile
            }
          );

          // Start scanning
          await qrScannerRef.current.start();
          setIsScanning(true);
        }
      } catch (error) {
        console.error('Failed to initialize QR scanner:', error);
        onError?.(error);
      }
    };

    initializeScanner();

    // Cleanup
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, [onScan, onError]);

  if (!hasCamera) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Not Available</h3>
          <p className="text-gray-600">
            Please ensure your device has a camera and you've granted camera permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full h-64 bg-black rounded-lg object-cover"
        playsInline
        muted
      />
      
      {/* Scanning overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          {/* Scanning frame */}
          <div className="w-48 h-48 border-2 border-white rounded-lg relative">
            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
            
            {/* Scanning line animation */}
            {isScanning && (
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-400 animate-pulse"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent animate-bounce"></div>
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
              {isScanning ? 'Scanning...' : 'Position QR code in frame'}
            </p>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
      </div>
    </div>
  );
};

export default QRScanner;
