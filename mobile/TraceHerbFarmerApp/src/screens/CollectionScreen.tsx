import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Vibration,
  BackHandler,
} from 'react-native';
import {
  request,
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

import { CollectionForm } from '../components/CollectionForm';
import { GPSCapture } from '../components/GPSCapture';
import { QRGenerator } from '../components/QRGenerator';
import { OfflineSync } from '../components/OfflineSync';
import { BlockchainService } from '../services/BlockchainService';
import { DatabaseService } from '../services/DatabaseService';
import { IoTService } from '../services/IoTService';
import { FHIRService } from '../services/FHIRService';

interface CollectionData {
  id: string;
  qrCode: string;
  farmer: {
    id: string;
    name: string;
    phone: string;
    village: string;
    district: string;
    state: string;
    certification: string;
  };
  herb: {
    botanicalName: string;
    commonName: string;
    ayurvedicName: string;
    partUsed: string;
    quantity: number;
    unit: string;
    collectionMethod: string;
    season: string;
    weatherConditions: string;
    soilType: string;
    notes: string;
  };
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number;
    timestamp: string;
    address: string;
  };
  environmental: {
    temperature: number;
    humidity: number;
    soilPH: number;
    lightIntensity: number;
    airQuality: number;
  };
  metadata: {
    deviceId: string;
    appVersion: string;
    timestamp: string;
    networkStatus: string;
    batteryLevel: number;
  };
}

interface CollectionScreenProps {
  navigation: any;
  route: any;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  navigation,
  route,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [collectionData, setCollectionData] = useState<Partial<CollectionData>>({});
  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [environmentalData, setEnvironmentalData] = useState<any>(null);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);

  const blockchainService = useRef(new BlockchainService());
  const databaseService = useRef(new DatabaseService());
  const iotService = useRef(new IoTService());
  const fhirService = useRef(new FHIRService());

  // Initialize component
  useEffect(() => {
    initializeScreen();
    setupNetworkListener();
    setupBackHandler();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeScreen = async () => {
    try {
      // Check permissions
      await checkLocationPermission();
      
      // Initialize services
      await databaseService.current.initialize();
      await iotService.current.initialize();
      
      // Get device info
      const deviceId = await DeviceInfo.getUniqueId();
      const appVersion = DeviceInfo.getVersion();
      const batteryLevel = await DeviceInfo.getBatteryLevel();
      
      setCollectionData(prev => ({
        ...prev,
        metadata: {
          deviceId,
          appVersion,
          timestamp: new Date().toISOString(),
          networkStatus: isOnline ? 'online' : 'offline',
          batteryLevel: batteryLevel * 100,
        },
      }));
      
      // Start environmental data collection
      startEnvironmentalMonitoring();
      
    } catch (error) {
      console.error('Error initializing screen:', error);
      Alert.alert('Initialization Error', 'Failed to initialize collection screen');
    }
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      
      // Update metadata
      setCollectionData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata!,
          networkStatus: state.isConnected ? 'online' : 'offline',
        },
      }));
    });
    
    return unsubscribe;
  };

  const setupBackHandler = () => {
    const backAction = () => {
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
        return true;
      }
      
      Alert.alert(
        'Exit Collection',
        'Are you sure you want to exit? Unsaved data will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  };

  const cleanup = () => {
    iotService.current.stopEnvironmentalMonitoring();
  };

  const checkLocationPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await check(permission);
      
      if (result === RESULTS.GRANTED) {
        setHasLocationPermission(true);
        return true;
      }
      
      const requestResult = await request(permission);
      const granted = requestResult === RESULTS.GRANTED;
      setHasLocationPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'GPS location is required for herb collection tracking. Please enable location permissions.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: openSettings },
          ]
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  };

  const startEnvironmentalMonitoring = async () => {
    try {
      // Start IoT sensor monitoring
      const sensorData = await iotService.current.startEnvironmentalMonitoring();
      
      if (sensorData) {
        setEnvironmentalData(sensorData);
        setCollectionData(prev => ({
          ...prev,
          environmental: sensorData,
        }));
      }
    } catch (error) {
      console.error('Error starting environmental monitoring:', error);
    }
  };

  const getCurrentLocation = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!hasLocationPermission) {
        reject(new Error('Location permission not granted'));
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude, accuracy, altitude } = position.coords;
          setGpsAccuracy(accuracy);
          
          const locationData = {
            latitude,
            longitude,
            accuracy,
            altitude: altitude || 0,
            timestamp: new Date().toISOString(),
            address: '', // Will be filled by reverse geocoding
          };
          
          resolve(locationData);
        },
        error => {
          console.error('GPS Error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 1,
        }
      );
    });
  };

  const handleStepComplete = async (stepData: any) => {
    try {
      setCollectionData(prev => ({ ...prev, ...stepData }));
      
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
      } else {
        await handleFinalSubmission();
      }
    } catch (error) {
      console.error('Error handling step completion:', error);
      Alert.alert('Error', 'Failed to process step data');
    }
  };

  const generateCollectionId = (): string => {
    const timestamp = Date.now();
    const randomId = uuidv4().substring(0, 8).toUpperCase();
    return `COL_${timestamp}_${randomId}`;
  };

  const generateQRCode = (collectionId: string): string => {
    return `QR_${collectionId}`;
  };

  const createFHIRCollectionEvent = (data: CollectionData) => {
    return fhirService.current.createCollectionEvent({
      id: data.id,
      qrCode: data.qrCode,
      farmer: data.farmer,
      herb: data.herb,
      location: data.location,
      environmental: data.environmental,
      metadata: data.metadata,
    });
  };

  const handleFinalSubmission = async () => {
    try {
      setIsSubmitting(true);
      
      // Generate unique IDs
      const collectionId = generateCollectionId();
      const qrCode = generateQRCode(collectionId);
      
      // Get current location
      const locationData = await getCurrentLocation();
      
      // Complete collection data
      const completeData: CollectionData = {
        ...collectionData as CollectionData,
        id: collectionId,
        qrCode,
        location: locationData,
      };
      
      // Create FHIR-compliant data
      const fhirData = createFHIRCollectionEvent(completeData);
      
      // Save to local database first
      await databaseService.current.saveCollectionEvent(completeData);
      
      if (isOnline) {
        try {
          // Submit to blockchain
          const blockchainResult = await blockchainService.current.submitCollectionEvent(fhirData);
          
          if (blockchainResult.success) {
            // Update local record with blockchain transaction info
            await databaseService.current.updateCollectionEvent(collectionId, {
              blockchainTxId: blockchainResult.transactionId,
              blockNumber: blockchainResult.blockNumber,
              status: 'confirmed',
            });
            
            Vibration.vibrate([100, 50, 100]);
            setQrCodeGenerated(true);
            
            Alert.alert(
              'Success!',
              'Collection event recorded on blockchain successfully.',
              [{ text: 'OK', onPress: () => navigation.navigate('Success', { collectionData: completeData }) }]
            );
          } else {
            throw new Error(blockchainResult.error);
          }
        } catch (blockchainError) {
          console.error('Blockchain submission error:', blockchainError);
          
          // Mark for offline sync
          await databaseService.current.updateCollectionEvent(collectionId, {
            status: 'pending_sync',
            syncRetries: 0,
          });
          
          Alert.alert(
            'Offline Mode',
            'Data saved locally. Will sync to blockchain when connection is restored.',
            [{ text: 'OK', onPress: () => navigation.navigate('Success', { collectionData: completeData }) }]
          );
        }
      } else {
        // Offline mode
        await databaseService.current.updateCollectionEvent(collectionId, {
          status: 'pending_sync',
          syncRetries: 0,
        });
        
        Alert.alert(
          'Offline Mode',
          'Data saved locally. Will sync to blockchain when connection is restored.',
          [{ text: 'OK', onPress: () => navigation.navigate('Success', { collectionData: completeData }) }]
        );
      }
      
    } catch (error) {
      console.error('Error in final submission:', error);
      Alert.alert(
        'Submission Error',
        'Failed to save collection data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CollectionForm
            onComplete={handleStepComplete}
            initialData={collectionData.farmer}
            type="farmer"
          />
        );
      case 2:
        return (
          <CollectionForm
            onComplete={handleStepComplete}
            initialData={collectionData.herb}
            type="herb"
          />
        );
      case 3:
        return (
          <GPSCapture
            onComplete={handleStepComplete}
            hasPermission={hasLocationPermission}
            onLocationUpdate={getCurrentLocation}
            accuracy={gpsAccuracy}
            environmentalData={environmentalData}
          />
        );
      case 4:
        return (
          <QRGenerator
            collectionData={collectionData}
            onSubmit={handleFinalSubmission}
            isSubmitting={isSubmitting}
            isOnline={isOnline}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Herb Collection</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step {currentStep} of 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${(currentStep / 4) * 100}%` }]} />
          </View>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#F59E0B' }]} />
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Offline Sync Component */}
      <OfflineSync
        isVisible={!isOnline}
        pendingCount={0} // Will be updated by database service
        onSync={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  stepIndicator: {
    marginBottom: 10,
  },
  stepText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default CollectionScreen;
