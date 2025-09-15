import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CameraIcon, 
  PhotoIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon,
  SparklesIcon,
  EyeIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AIPlantVerification = ({ onVerificationComplete, farmerId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [claimedSpecies, setClaimedSpecies] = useState('');
  const [location, setLocation] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const availableSpecies = [
    'Ashwagandha',
    'Turmeric', 
    'Neem',
    'Tulsi',
    'Brahmi',
    'Shankhpushpi',
    'Giloy',
    'Amla'
  ];

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please use file upload instead.');
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      setSelectedImage(file);
      setImagePreview(canvas.toDataURL());
      
      // Stop camera
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setShowCamera(false);
    }, 'image/jpeg', 0.8);
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  // Submit for AI verification
  const handleVerification = async () => {
    if (!selectedImage || !claimedSpecies) {
      alert('Please select an image and specify the plant species');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('claimedSpecies', claimedSpecies);
      formData.append('farmerId', farmerId);
      
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      const response = await fetch('http://localhost:3000/api/ai/verify-plant', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setVerificationResult(result.data);
        if (onVerificationComplete) {
          onVerificationComplete(result.data);
        }
      } else {
        throw new Error(result.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        error: error.message,
        message: 'AI verification service is currently unavailable'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getResultIcon = (result) => {
    if (!result.success) return <XCircleIcon className="w-8 h-8 text-red-500" />;
    if (result.verified) return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
    return <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />;
  };

  const getResultColor = (result) => {
    if (!result.success) return 'border-red-200 bg-red-50';
    if (result.verified) return 'border-green-200 bg-green-50';
    return 'border-yellow-200 bg-yellow-50';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-xl">
          <SparklesIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Plant Verification</h3>
          <p className="text-sm text-gray-600">Upload plant image for AI-powered species verification</p>
        </div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Capture Plant Image</h3>
                <p className="text-sm text-gray-600">Position the plant in the center of the frame</p>
              </div>
              
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CameraIcon className="w-5 h-5" />
                  <span>Capture</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Upload Section */}
      <div className="space-y-4">
        {/* Upload Options */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Upload Photo</span>
          </button>
          
          <button
            onClick={startCamera}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Take Photo</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Image Preview */}
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <img
              src={imagePreview}
              alt="Plant preview"
              className="w-full h-64 object-cover rounded-xl border border-gray-200"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Species Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plant Species
          </label>
          <select
            value={claimedSpecies}
            onChange={(e) => setClaimedSpecies(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select plant species...</option>
            {availableSpecies.map(species => (
              <option key={species} value={species}>{species}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">
              {location ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Location not set'}
            </span>
          </div>
          <button
            onClick={getCurrentLocation}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Get Location
          </button>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerification}
          disabled={!selectedImage || !claimedSpecies || isVerifying}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isVerifying ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>AI Analyzing...</span>
            </>
          ) : (
            <>
              <EyeIcon className="w-5 h-5" />
              <span>Verify with AI</span>
            </>
          )}
        </button>
      </div>

      {/* Verification Result */}
      <AnimatePresence>
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mt-6 p-4 rounded-xl border-2 ${getResultColor(verificationResult)}`}
          >
            <div className="flex items-start space-x-3">
              {getResultIcon(verificationResult)}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {verificationResult.success ? 'AI Verification Complete' : 'Verification Failed'}
                </h4>
                
                <p className="text-sm text-gray-700 mb-3">
                  {verificationResult.message}
                </p>

                {verificationResult.success && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-semibold">
                        {Math.round(verificationResult.confidence * 100)}%
                      </span>
                    </div>
                    
                    {verificationResult.scientificName && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Scientific Name:</span>
                        <span className="font-medium italic">
                          {verificationResult.scientificName}
                        </span>
                      </div>
                    )}

                    {verificationResult.recommendations && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Recommendations:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {verificationResult.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-3">
                      <ClockIcon className="w-4 h-4" />
                      <span>Verified at {new Date(verificationResult.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIPlantVerification;
