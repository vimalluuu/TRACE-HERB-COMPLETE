import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import NetInfo from '@react-native-netinfo/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import SyncScreen from './src/screens/SyncScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CollectionFormScreen from './src/screens/CollectionFormScreen';
import CameraScreen from './src/screens/CameraScreen';

// Import services
import { initializeDatabase } from './src/services/DatabaseService';
import { SyncService } from './src/services/SyncService';
import { LocationService } from './src/services/LocationService';

// Import components
import { NetworkStatus } from './src/components/NetworkStatus';
import { LoadingScreen } from './src/components/LoadingScreen';

// Import theme
import { theme } from './src/theme/theme';

// Import icons
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Collection Stack Navigator
function CollectionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="CollectionList" 
        component={CollectionScreen} 
        options={{ title: 'Collections' }}
      />
      <Stack.Screen 
        name="CollectionForm" 
        component={CollectionFormScreen} 
        options={{ title: 'New Collection' }}
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ title: 'Take Photo' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Collection') {
            iconName = 'eco';
          } else if (route.name === 'Sync') {
            iconName = 'sync';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'TRACE HERB' }}
      />
      <Tab.Screen 
        name="Collection" 
        component={CollectionStack} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Sync" 
        component={SyncScreen} 
        options={{ title: 'Sync Data' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initializeDatabase();
      console.log('Database initialized');

      // Request permissions
      await requestPermissions();

      // Check network status
      const netInfo = await NetInfo.fetch();
      setIsConnected(netInfo.isConnected);

      // Set up network listener
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsConnected(state.isConnected);
        if (state.isConnected) {
          // Auto-sync when connection is restored
          SyncService.syncPendingData();
        }
      });

      // Initialize location service
      if (locationPermission) {
        await LocationService.initialize();
      }

      // Schedule periodic sync
      SyncService.schedulePeriodicSync();

      setIsLoading(false);

      return () => {
        unsubscribe();
      };

    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart and try again.',
        [{ text: 'OK' }]
      );
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locationStatus === 'granted');

      if (locationStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to record collection coordinates.',
          [{ text: 'OK' }]
        );
      }

      // Request notification permission
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        console.log('Notification permission not granted');
      }

    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={theme.colors.primary} />
        <NetworkStatus isConnected={isConnected} />
        <MainTabs />
      </NavigationContainer>
    </PaperProvider>
  );
}
