import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  HelperText,
  RadioButton,
  Checkbox,
  Divider,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import * as Location from 'expo-location';
import uuid from 'react-native-uuid';

import { LocationService } from '../services/LocationService';
import { DatabaseService } from '../services/DatabaseService';
import { SyncService } from '../services/SyncService';
import { theme } from '../theme/theme';

const COMMON_HERBS = [
  { name: 'Ashwagandha', botanical: 'Withania somnifera', parts: ['roots', 'leaves'] },
  { name: 'Brahmi', botanical: 'Bacopa monnieri', parts: ['whole-plant', 'leaves'] },
  { name: 'Jatamansi', botanical: 'Nardostachys jatamansi', parts: ['roots', 'rhizomes'] },
  { name: 'Kutki', botanical: 'Picrorhiza kurroa', parts: ['roots', 'rhizomes'] },
  { name: 'Shankhpushpi', botanical: 'Convolvulus pluricaulis', parts: ['whole-plant'] },
];

const COLLECTION_METHODS = [
  { label: 'Hand picking', value: 'hand-picking' },
  { label: 'Hand tools', value: 'hand-tools' },
  { label: 'Small spades', value: 'small-spades' },
  { label: 'Pruning shears', value: 'pruning-shears' },
];

export default function CollectionFormScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [customHerb, setCustomHerb] = useState(false);
  const [photos, setPhotos] = useState([]);

  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      botanicalName: '',
      commonName: '',
      ayurvedicName: '',
      partUsed: [],
      quantity: '',
      unit: 'kg',
      collectionMethod: 'hand-picking',
      sustainable: false,
      organic: false,
      fairTrade: false,
      price: '',
      notes: '',
    }
  });

  const watchedPartUsed = watch('partUsed');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get current location. Please ensure GPS is enabled.',
        [{ text: 'OK' }]
      );
    }
  };

  const selectHerb = (herb) => {
    setSelectedHerb(herb);
    setCustomHerb(false);
    setValue('botanicalName', herb.botanical);
    setValue('commonName', herb.name);
    setValue('partUsed', []);
  };

  const togglePartUsed = (part) => {
    const currentParts = watchedPartUsed || [];
    const newParts = currentParts.includes(part)
      ? currentParts.filter(p => p !== part)
      : [...currentParts, part];
    setValue('partUsed', newParts);
  };

  const takePhoto = () => {
    navigation.navigate('Camera', {
      onPhotoTaken: (photoUri) => {
        setPhotos([...photos, photoUri]);
      }
    });
  };

  const onSubmit = async (data) => {
    if (!location) {
      Alert.alert('Error', 'Location is required for collection recording.');
      return;
    }

    if (!data.partUsed || data.partUsed.length === 0) {
      Alert.alert('Error', 'Please select at least one plant part.');
      return;
    }

    setLoading(true);

    try {
      // Create collection event object
      const collectionEvent = {
        id: `collection-${Date.now()}-${uuid.v4().substr(0, 8)}`,
        resourceType: 'CollectionEvent',
        meta: {
          versionId: '1',
          lastUpdated: new Date().toISOString(),
          profile: ['http://trace-herb.com/fhir/StructureDefinition/CollectionEvent']
        },
        status: 'completed',
        category: {
          coding: [{
            system: 'http://trace-herb.com/fhir/CodeSystem/collection-category',
            code: 'wild-collection',
            display: 'Wild Collection'
          }]
        },
        subject: {
          botanicalName: data.botanicalName,
          commonName: data.commonName,
          ayurvedicName: data.ayurvedicName,
          partUsed: data.partUsed
        },
        performedDateTime: new Date().toISOString(),
        performer: {
          identifier: await getCollectorId(),
          display: await getCollectorName(),
          type: 'collector'
        },
        location: {
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || 0,
            accuracy: location.coords.accuracy || 0
          },
          address: {
            // These would be filled from reverse geocoding in a real app
            village: '',
            district: '',
            state: '',
            country: 'India'
          }
        },
        quantity: {
          value: parseFloat(data.quantity),
          unit: data.unit
        },
        qualityAssessment: {
          visualInspection: {
            notes: data.notes
          }
        },
        sustainability: {
          harvestingPractices: {
            sustainable: data.sustainable,
            method: data.collectionMethod,
            regeneration: data.sustainable
          },
          fairTrade: {
            certified: data.fairTrade,
            price: data.fairTrade ? parseFloat(data.price) : 0
          }
        },
        environment: {
          cultivation: {
            method: data.organic ? 'organic' : 'wild'
          }
        },
        documentation: {
          photos: photos,
          notes: data.notes
        },
        // Offline metadata
        _offline: {
          created: new Date().toISOString(),
          synced: false,
          deviceId: await getDeviceId()
        }
      };

      // Save to local database
      await DatabaseService.saveCollectionEvent(collectionEvent);

      // Try to sync immediately if online
      SyncService.syncSingleRecord(collectionEvent);

      Alert.alert(
        'Success',
        'Collection event recorded successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              setPhotos([]);
              setSelectedHerb(null);
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error saving collection event:', error);
      Alert.alert(
        'Error',
        'Failed to save collection event. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getCollectorId = async () => {
    // In a real app, this would come from user authentication
    return await AsyncStorage.getItem('collectorId') || 'collector-001';
  };

  const getCollectorName = async () => {
    return await AsyncStorage.getItem('collectorName') || 'Field Collector';
  };

  const getDeviceId = async () => {
    let deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = uuid.v4();
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Location Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Location</Title>
            {location ? (
              <Paragraph style={styles.locationText}>
                📍 {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                {location.coords.accuracy && (
                  <Paragraph style={styles.accuracyText}>
                    Accuracy: ±{Math.round(location.coords.accuracy)}m
                  </Paragraph>
                )}
              </Paragraph>
            ) : (
              <Paragraph style={styles.errorText}>Getting location...</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Herb Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Select Herb</Title>
            <View style={styles.herbChips}>
              {COMMON_HERBS.map((herb, index) => (
                <Chip
                  key={index}
                  selected={selectedHerb?.botanical === herb.botanical}
                  onPress={() => selectHerb(herb)}
                  style={styles.chip}
                >
                  {herb.name}
                </Chip>
              ))}
              <Chip
                selected={customHerb}
                onPress={() => {
                  setCustomHerb(true);
                  setSelectedHerb(null);
                  setValue('botanicalName', '');
                  setValue('commonName', '');
                }}
                style={styles.chip}
              >
                Other
              </Chip>
            </View>

            {(customHerb || selectedHerb) && (
              <View style={styles.herbInputs}>
                <Controller
                  control={control}
                  name="botanicalName"
                  rules={{ required: 'Botanical name is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Botanical Name *"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={!!errors.botanicalName}
                      disabled={!customHerb}
                      style={styles.input}
                    />
                  )}
                />
                <HelperText type="error" visible={!!errors.botanicalName}>
                  {errors.botanicalName?.message}
                </HelperText>

                <Controller
                  control={control}
                  name="commonName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Common Name"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      disabled={!customHerb}
                      style={styles.input}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="ayurvedicName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Ayurvedic Name"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      style={styles.input}
                    />
                  )}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Plant Parts */}
        {(selectedHerb || customHerb) && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Plant Parts Collected *</Title>
              <View style={styles.partsContainer}>
                {(selectedHerb?.parts || ['roots', 'leaves', 'bark', 'flowers', 'seeds', 'whole-plant']).map((part) => (
                  <View key={part} style={styles.checkboxRow}>
                    <Checkbox
                      status={watchedPartUsed?.includes(part) ? 'checked' : 'unchecked'}
                      onPress={() => togglePartUsed(part)}
                    />
                    <Paragraph style={styles.checkboxLabel}>{part}</Paragraph>
                  </View>
                ))}
              </View>
              <HelperText type="error" visible={!watchedPartUsed || watchedPartUsed.length === 0}>
                Please select at least one plant part
              </HelperText>
            </Card.Content>
          </Card>
        )}

        {/* Quantity */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Quantity</Title>
            <View style={styles.quantityRow}>
              <Controller
                control={control}
                name="quantity"
                rules={{ 
                  required: 'Quantity is required',
                  pattern: {
                    value: /^\d+(\.\d+)?$/,
                    message: 'Please enter a valid number'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Amount *"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    error={!!errors.quantity}
                    style={[styles.input, styles.quantityInput]}
                  />
                )}
              />
              <Controller
                control={control}
                name="unit"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.unitSelector}>
                    <RadioButton.Group onValueChange={onChange} value={value}>
                      <View style={styles.radioRow}>
                        <RadioButton value="kg" />
                        <Paragraph>kg</Paragraph>
                      </View>
                      <View style={styles.radioRow}>
                        <RadioButton value="g" />
                        <Paragraph>g</Paragraph>
                      </View>
                    </RadioButton.Group>
                  </View>
                )}
              />
            </View>
            <HelperText type="error" visible={!!errors.quantity}>
              {errors.quantity?.message}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Collection Method */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Collection Method</Title>
            <Controller
              control={control}
              name="collectionMethod"
              render={({ field: { onChange, value } }) => (
                <RadioButton.Group onValueChange={onChange} value={value}>
                  {COLLECTION_METHODS.map((method) => (
                    <View key={method.value} style={styles.radioRow}>
                      <RadioButton value={method.value} />
                      <Paragraph>{method.label}</Paragraph>
                    </View>
                  ))}
                </RadioButton.Group>
              )}
            />
          </Card.Content>
        </Card>

        {/* Sustainability Options */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Sustainability & Certification</Title>
            
            <Controller
              control={control}
              name="sustainable"
              render={({ field: { onChange, value } }) => (
                <View style={styles.checkboxRow}>
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    onPress={() => onChange(!value)}
                  />
                  <Paragraph style={styles.checkboxLabel}>Sustainable harvesting practices</Paragraph>
                </View>
              )}
            />

            <Controller
              control={control}
              name="organic"
              render={({ field: { onChange, value } }) => (
                <View style={styles.checkboxRow}>
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    onPress={() => onChange(!value)}
                  />
                  <Paragraph style={styles.checkboxLabel}>Organic cultivation</Paragraph>
                </View>
              )}
            />

            <Controller
              control={control}
              name="fairTrade"
              render={({ field: { onChange, value } }) => (
                <View style={styles.checkboxRow}>
                  <Checkbox
                    status={value ? 'checked' : 'unchecked'}
                    onPress={() => onChange(!value)}
                  />
                  <Paragraph style={styles.checkboxLabel}>Fair trade certified</Paragraph>
                </View>
              )}
            />

            {watch('fairTrade') && (
              <Controller
                control={control}
                name="price"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Price per kg (₹)"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                )}
              />
            )}
          </Card.Content>
        </Card>

        {/* Photos */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Documentation</Title>
            <Button
              mode="outlined"
              onPress={takePhoto}
              icon="camera"
              style={styles.photoButton}
            >
              Take Photo ({photos.length})
            </Button>

            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Notes"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading || !location}
          style={styles.submitButton}
        >
          Record Collection Event
        </Button>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  locationText: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  accuracyText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
  },
  errorText: {
    color: theme.colors.error,
  },
  herbChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    margin: 4,
  },
  herbInputs: {
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  partsContainer: {
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkboxLabel: {
    marginLeft: 8,
    flex: 1,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  quantityInput: {
    flex: 1,
    marginRight: 16,
  },
  unitSelector: {
    marginTop: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  photoButton: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});
