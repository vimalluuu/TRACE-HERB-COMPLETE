import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MicrophoneIcon, 
  StopIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  LanguageIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const VoiceToBlockchain = ({ onVoiceEntryComplete, farmerId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const supportedLanguages = [
    { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' }
  ];

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Play recorded audio
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Pause audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Process voice input
  const processVoiceInput = async () => {
    if (!audioBlob) {
      alert('Please record audio first');
      return;
    }

    setIsProcessing(true);
    setProcessingResult(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-input.wav');
      formData.append('farmerId', farmerId);
      formData.append('language', selectedLanguage);

      const response = await fetch('http://localhost:3000/api/ai/voice-to-blockchain', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setProcessingResult(result.data);
        if (onVoiceEntryComplete && result.data.validation.valid) {
          onVoiceEntryComplete(result.data);
        }
      } else {
        throw new Error(result.error || 'Voice processing failed');
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      setProcessingResult({
        success: false,
        error: error.message,
        message: 'Voice processing service is currently unavailable'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear recording
  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setProcessingResult(null);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getResultIcon = (result) => {
    if (!result.success) return <XCircleIcon className="w-6 h-6 text-red-500" />;
    if (result.validation?.valid) return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
  };

  const getResultColor = (result) => {
    if (!result.success) return 'border-red-200 bg-red-50';
    if (result.validation?.valid) return 'border-green-200 bg-green-50';
    return 'border-yellow-200 bg-yellow-50';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-xl">
          <MicrophoneIcon className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Voice to Blockchain</h3>
          <p className="text-sm text-gray-600">Record harvest details using voice input</p>
        </div>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <LanguageIcon className="w-4 h-4 inline mr-1" />
          Select Language
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          {supportedLanguages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Recording Section */}
      <div className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center justify-center">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="flex items-center justify-center w-20 h-20 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-full transition-colors shadow-lg"
            >
              <MicrophoneIcon className="w-8 h-8" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center justify-center w-20 h-20 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg animate-pulse"
            >
              <StopIcon className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="font-medium">Recording... {formatTime(recordingTime)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Say: "Species, quantity, location details"
            </p>
          </motion.div>
        )}

        {/* Audio Playback */}
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Recorded Audio ({formatTime(recordingTime)})
              </span>
              <button
                onClick={clearRecording}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="flex items-center justify-center w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
              >
                {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              </button>
              
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              
              <SpeakerWaveIcon className="w-5 h-5 text-gray-500" />
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          </motion.div>
        )}

        {/* Process Button */}
        {audioBlob && (
          <button
            onClick={processVoiceInput}
            disabled={isProcessing}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing Voice...</span>
              </>
            ) : (
              <>
                <SpeakerWaveIcon className="w-5 h-5" />
                <span>Process with AI</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Processing Result */}
      <AnimatePresence>
        {processingResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mt-6 p-4 rounded-xl border-2 ${getResultColor(processingResult)}`}
          >
            <div className="flex items-start space-x-3">
              {getResultIcon(processingResult)}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Voice Processing Result
                </h4>
                
                {processingResult.success && (
                  <div className="space-y-3">
                    {/* Transcription */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Transcription:</p>
                      <p className="text-gray-900 italic">"{processingResult.transcription}"</p>
                    </div>

                    {/* Parsed Data */}
                    {processingResult.parsedData && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Extracted Information:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {processingResult.parsedData.species && (
                            <div>
                              <span className="text-gray-600">Species:</span>
                              <span className="ml-2 font-medium">{processingResult.parsedData.species}</span>
                            </div>
                          )}
                          {processingResult.parsedData.quantity && (
                            <div>
                              <span className="text-gray-600">Quantity:</span>
                              <span className="ml-2 font-medium">{processingResult.parsedData.quantity} kg</span>
                            </div>
                          )}
                          {processingResult.parsedData.latitude && (
                            <div>
                              <span className="text-gray-600">Location:</span>
                              <span className="ml-2 font-medium">
                                {processingResult.parsedData.latitude}, {processingResult.parsedData.longitude}
                              </span>
                            </div>
                          )}
                          {processingResult.parsedData.quality && (
                            <div>
                              <span className="text-gray-600">Quality:</span>
                              <span className="ml-2 font-medium">{processingResult.parsedData.quality}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Validation Status */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Validation Status:</span>
                      <span className={`font-semibold ${
                        processingResult.validation?.valid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {processingResult.validation?.valid ? 'Valid' : 'Invalid'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-semibold">
                        {Math.round(processingResult.confidence * 100)}%
                      </span>
                    </div>

                    {/* Warnings/Errors */}
                    {processingResult.validation?.warnings?.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-yellow-800 mb-1">Warnings:</p>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {processingResult.validation.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-yellow-500 mt-1">⚠️</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {processingResult.validation?.errors?.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-red-800 mb-1">Errors:</p>
                        <ul className="text-sm text-red-700 space-y-1">
                          {processingResult.validation.errors.map((error, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-red-500 mt-1">❌</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-3">
                      <ClockIcon className="w-4 h-4" />
                      <span>Processed at {new Date(processingResult.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {!processingResult.success && (
                  <p className="text-sm text-red-700">
                    {processingResult.message || processingResult.error}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Voice Input Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Speak clearly and slowly</li>
          <li>• Include: plant species, quantity, and location</li>
          <li>• Example: "Ashwagandha, 15 kilograms, latitude 12.9716, longitude 77.5946"</li>
          <li>• Ensure good audio quality for better recognition</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceToBlockchain;
