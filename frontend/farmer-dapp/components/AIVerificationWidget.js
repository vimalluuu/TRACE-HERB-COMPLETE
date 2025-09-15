import React, { useState, useRef } from 'react';
import { 
  CameraIcon, 
  MicrophoneIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon,
  SparklesIcon,
  EyeIcon,
  SpeakerWaveIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AIVerificationWidget = ({ onVerificationComplete, batchData }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [activeTab, setActiveTab] = useState('image'); // 'image', 'voice', 'anomaly'
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Handle image upload and verification
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('expectedSpecies', batchData?.botanicalName || 'Withania somnifera');
      formData.append('metadata', JSON.stringify({
        location: batchData?.location,
        farmer: batchData?.farmerName,
        harvestDate: batchData?.collectionDate
      }));

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
      console.error('AI Verification Error:', error);
      setVerificationResult({
        success: false,
        error: error.message,
        confidence: 0
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process voice recording
  const processVoiceRecording = async () => {
    if (!audioBlob) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('language', 'hi'); // Default to Hindi

      const response = await fetch('http://localhost:3000/api/ai/voice-to-blockchain', {
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
        throw new Error(result.error || 'Voice processing failed');
      }

    } catch (error) {
      console.error('Voice Processing Error:', error);
      setVerificationResult({
        success: false,
        error: error.message,
        confidence: 0
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Check for anomalies
  const checkAnomalies = async () => {
    if (!batchData) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/detect-anomalies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          harvestData: batchData,
          historicalData: [] // Would come from database in real implementation
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setVerificationResult(result.data);
        if (onVerificationComplete) {
          onVerificationComplete(result.data);
        }
      } else {
        throw new Error(result.error || 'Anomaly detection failed');
      }

    } catch (error) {
      console.error('Anomaly Detection Error:', error);
      setVerificationResult({
        riskScore: 0,
        riskLevel: 'unknown',
        error: error.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getResultIcon = (result) => {
    if (activeTab === 'image') {
      return result?.success ? CheckCircleIcon : XCircleIcon;
    } else if (activeTab === 'voice') {
      return result?.success ? CheckCircleIcon : XCircleIcon;
    } else if (activeTab === 'anomaly') {
      if (result?.riskLevel === 'minimal' || result?.riskLevel === 'low') return CheckCircleIcon;
      if (result?.riskLevel === 'medium') return ExclamationTriangleIcon;
      return XCircleIcon;
    }
    return CheckCircleIcon;
  };

  const getResultColor = (result) => {
    if (activeTab === 'image') {
      return result?.success ? 'text-green-600' : 'text-red-600';
    } else if (activeTab === 'voice') {
      return result?.success ? 'text-green-600' : 'text-red-600';
    } else if (activeTab === 'anomaly') {
      if (result?.riskLevel === 'minimal' || result?.riskLevel === 'low') return 'text-green-600';
      if (result?.riskLevel === 'medium') return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <SparklesIcon className="h-6 w-6 mr-2 text-purple-600" />
            AI Verification
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered plant verification and anomaly detection
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'image', label: 'Plant ID', icon: EyeIcon },
          { id: 'voice', label: 'Voice Report', icon: SpeakerWaveIcon },
          { id: 'anomaly', label: 'Anomaly Check', icon: ExclamationTriangleIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setVerificationResult(null);
                setSelectedImage(null);
                setAudioBlob(null);
              }}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'image' && (
          <div className="space-y-4">
            <div className="text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              {!selectedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-purple-400 transition-colors"
                >
                  <CameraIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload plant image</p>
                  <p className="text-sm text-gray-500">AI will verify the species automatically</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(selectedImage)} 
                      alt="Selected plant"
                      className="max-w-full h-48 object-cover rounded-lg mx-auto"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                    >
                      <CameraIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isVerifying && (
              <div className="text-center py-8">
                <ArrowPathIcon className="h-8 w-8 mx-auto text-purple-600 animate-spin mb-4" />
                <p className="text-gray-600">AI is analyzing the plant image...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
              </div>
            )}

            {verificationResult && !isVerifying && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  {React.createElement(getResultIcon(verificationResult), {
                    className: `h-6 w-6 mr-3 mt-1 ${getResultColor(verificationResult)}`
                  })}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {verificationResult.success ? 'Species Verified!' : 'Verification Failed'}
                    </h4>
                    
                    {verificationResult.success ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Species:</strong> {verificationResult.species?.detected}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Confidence:</strong> {Math.round(verificationResult.confidence * 100)}%
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Family:</strong> {verificationResult.species?.family}
                        </p>
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Quality Factors:</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>Image: {verificationResult.factors?.imageQuality}%</div>
                            <div>Location: {verificationResult.factors?.locationConsistency}%</div>
                            <div>Season: {verificationResult.factors?.seasonalTiming}%</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-red-600">{verificationResult.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-4">
            <div className="text-center">
              {!isRecording && !audioBlob ? (
                <div className="space-y-4">
                  <MicrophoneIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Record harvest details in your voice</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Speak in Hindi, English, or your local language
                  </p>
                  <button
                    onClick={startRecording}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center mx-auto"
                  >
                    <MicrophoneIcon className="h-5 w-5 mr-2" />
                    Start Recording
                  </button>
                </div>
              ) : isRecording ? (
                <div className="space-y-4">
                  <div className="relative">
                    <MicrophoneIcon className="h-16 w-16 mx-auto text-red-500 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping"></div>
                  </div>
                  <p className="text-red-600 font-medium">Recording in progress...</p>
                  <p className="text-sm text-gray-500">Speak clearly about your harvest</p>
                  <button
                    onClick={stopRecording}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Stop Recording
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500" />
                  <p className="text-green-600 font-medium">Recording completed!</p>
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={processVoiceRecording}
                      disabled={isVerifying}
                      className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                      {isVerifying ? 'Processing...' : 'Process Recording'}
                    </button>
                    <button
                      onClick={() => {
                        setAudioBlob(null);
                        setVerificationResult(null);
                      }}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Record Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isVerifying && activeTab === 'voice' && (
              <div className="text-center py-8">
                <ArrowPathIcon className="h-8 w-8 mx-auto text-purple-600 animate-spin mb-4" />
                <p className="text-gray-600">Processing voice recording...</p>
                <p className="text-sm text-gray-500 mt-1">Converting speech to blockchain data</p>
              </div>
            )}

            {verificationResult && !isVerifying && activeTab === 'voice' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  {React.createElement(getResultIcon(verificationResult), {
                    className: `h-6 w-6 mr-3 mt-1 ${getResultColor(verificationResult)}`
                  })}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {verificationResult.success ? 'Voice Processed Successfully!' : 'Processing Failed'}
                    </h4>
                    
                    {verificationResult.success ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Transcription:</strong> {verificationResult.transcription}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Language:</strong> {verificationResult.language}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Confidence:</strong> {Math.round(verificationResult.confidence * 100)}%
                        </p>
                        {verificationResult.extractedData && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-xs text-gray-500 mb-2">Extracted Data:</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><strong>Herb:</strong> {verificationResult.extractedData.herb}</div>
                              <div><strong>Quantity:</strong> {verificationResult.extractedData.quantity} {verificationResult.extractedData.unit}</div>
                              <div><strong>Location:</strong> {verificationResult.extractedData.location}</div>
                              <div><strong>Quality:</strong> {verificationResult.extractedData.quality}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-red-600">{verificationResult.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'anomaly' && (
          <div className="space-y-4">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <p className="text-gray-600 mb-2">Check for unusual patterns in harvest data</p>
              <p className="text-sm text-gray-500 mb-4">
                AI will analyze volume, location, timing, and quality anomalies
              </p>
              <button
                onClick={checkAnomalies}
                disabled={isVerifying || !batchData}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center mx-auto"
              >
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                {isVerifying ? 'Analyzing...' : 'Check Anomalies'}
              </button>
            </div>

            {isVerifying && activeTab === 'anomaly' && (
              <div className="text-center py-8">
                <ArrowPathIcon className="h-8 w-8 mx-auto text-yellow-600 animate-spin mb-4" />
                <p className="text-gray-600">Analyzing harvest data for anomalies...</p>
                <p className="text-sm text-gray-500 mt-1">Checking patterns and historical data</p>
              </div>
            )}

            {verificationResult && !isVerifying && activeTab === 'anomaly' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  {React.createElement(getResultIcon(verificationResult), {
                    className: `h-6 w-6 mr-3 mt-1 ${getResultColor(verificationResult)}`
                  })}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Anomaly Analysis Complete
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Risk Score:</span>
                        <span className={`font-bold ${getResultColor(verificationResult)}`}>
                          {verificationResult.riskScore}/100 ({verificationResult.riskLevel?.toUpperCase()})
                        </span>
                      </div>

                      {verificationResult.anomalies && verificationResult.anomalies.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600 mb-2">Anomalies Detected:</p>
                          {verificationResult.anomalies.map((anomaly, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                              <p className="text-sm text-red-800 font-medium">{anomaly.description}</p>
                              <p className="text-xs text-red-600">Severity: {anomaly.severity?.toUpperCase()}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {verificationResult.warnings && verificationResult.warnings.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-yellow-600 mb-2">Warnings:</p>
                          {verificationResult.warnings.map((warning, index) => (
                            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                              <p className="text-sm text-yellow-800">{warning.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {verificationResult.recommendations && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                          {verificationResult.recommendations.map((rec, index) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                              <p className="text-sm text-blue-800">{rec}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIVerificationWidget;
