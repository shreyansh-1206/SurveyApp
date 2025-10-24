import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import { saveSurvey } from '../utils/storage';
import { encrypt } from '../utils/encryption';
import { calculateManualArea, estimateAreaFromImage, anomalyCheck } from '../utils/areaEstimator';

// List of wards (can be expanded as needed)
const WARDS = [
  'Ward 1',
  'Ward 2',
  'Ward 3',
  'Ward 4',
  'Ward 5',
  'Ward 6',
  'Ward 7',
  'Ward 8',
  'Ward 9',
  'Ward 10',
];

export default function NewSurvey() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('Ward 1');
  
  // Area estimation
  const [areaMethod, setAreaMethod] = useState('manual'); // 'manual' or 'photo'
  const [length, setLength] = useState('');
  const [breadth, setBreadth] = useState('');
  const [referenceLength, setReferenceLength] = useState('');
  const [area, setArea] = useState(null);
  
  // GPS and Photos
  const [gps, setGps] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Capture GPS Location
  const captureGPS = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to capture GPS coordinates.');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
      
      setGps(coords);
      Alert.alert('Success', `GPS captured: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture GPS location: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to camera
  const openCamera = async (type) => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required.');
      return;
    }
    
    router.push({ pathname: '/camera', params: { type } });
  };

  // Calculate area based on method
  const calculateArea = async () => {
    try {
      setLoading(true);
      let calculatedArea;
      
      if (areaMethod === 'manual') {
        if (!length || !breadth) {
          Alert.alert('Error', 'Please enter both length and breadth');
          return;
        }
        calculatedArea = calculateManualArea(length, breadth);
      } else {
        // Photo-based estimation
        if (photos.length === 0) {
          Alert.alert('Error', 'Please capture a property photo first');
          return;
        }
        if (!referenceLength) {
          Alert.alert('Error', 'Please enter reference object length');
          return;
        }
        calculatedArea = await estimateAreaFromImage(photos[0], referenceLength);
      }
      
      // Anomaly check
      const check = anomalyCheck(calculatedArea);
      if (!check.isValid) {
        Alert.alert('Warning', check.message, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Use Anyway', onPress: () => setArea(calculatedArea) }
        ]);
      } else {
        setArea(calculatedArea);
        Alert.alert('Success', `Estimated area: ${calculatedArea.toFixed(2)} m²`);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Save survey
  const handleSave = async () => {
    try {
      // Validation
      if (!name || !phone || !address) {
        Alert.alert('Error', 'Please fill all required fields (Name, Phone, Address)');
        return;
      }
      
      if (!gps) {
        Alert.alert('Error', 'Please capture GPS coordinates');
        return;
      }
      
      if (!area) {
        Alert.alert('Error', 'Please calculate property area');
        return;
      }
      
      setLoading(true);
      
      // Calculate tax
      const ratePerM2 = parseFloat(process.env.EXPO_PUBLIC_RATE_PER_M2 || '10');
      const tax = area * ratePerM2;
      
      // Encrypt Aadhar
      const encryptedAadhar = aadhar ? encrypt(aadhar) : '';
      
      // Create survey object
      const survey = {
        name,
        fatherName,
        phone,
        email,
        aadhar: encryptedAadhar,
        address,
        gps,
        area,
        areaMethod,
        tax,
        photos,
        documents,
      };
      
      await saveSurvey(survey);
      
      Alert.alert('Success', 'Survey saved successfully!', [
        { text: 'OK', onPress: () => router.replace('/my-surveys') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save survey: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Survey</Text>
        </View>

        {/* Owner Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Information</Text>
          
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor="#999"
          />
          
          <Text style={styles.label}>Father's Name</Text>
          <TextInput
            style={styles.input}
            value={fatherName}
            onChangeText={setFatherName}
            placeholder="Enter father's name"
            placeholderTextColor="#999"
          />
          
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
          
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          
          <Text style={styles.label}>Aadhar Number</Text>
          <TextInput
            style={styles.input}
            value={aadhar}
            onChangeText={setAadhar}
            placeholder="XXXX-XXXX-XXXX"
            keyboardType="number-pad"
            maxLength={12}
            secureTextEntry
            placeholderTextColor="#999"
          />
          
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter property address"
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
        </View>

        {/* GPS Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS Coordinates *</Text>
          {gps ? (
            <View style={styles.gpsInfo}>
              <Ionicons name="location" size={20} color="#4CAF50" />
              <Text style={styles.gpsText}>
                Lat: {gps.latitude.toFixed(6)}, Long: {gps.longitude.toFixed(6)}
              </Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={captureGPS}
            disabled={loading}
          >
            <Ionicons name="navigate" size={20} color="white" />
            <Text style={styles.actionButtonText}>
              {gps ? 'Update GPS' : 'Capture GPS'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Area Estimation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Area Estimation *</Text>
          
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[styles.methodButton, areaMethod === 'manual' && styles.methodButtonActive]}
              onPress={() => setAreaMethod('manual')}
            >
              <Text style={[styles.methodButtonText, areaMethod === 'manual' && styles.methodButtonTextActive]}>
                Manual Entry
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodButton, areaMethod === 'photo' && styles.methodButtonActive]}
              onPress={() => setAreaMethod('photo')}
            >
              <Text style={[styles.methodButtonText, areaMethod === 'photo' && styles.methodButtonTextActive]}>
                Photo + Reference
              </Text>
            </TouchableOpacity>
          </View>
          
          {areaMethod === 'manual' ? (
            <View>
              <Text style={styles.label}>Length (meters)</Text>
              <TextInput
                style={styles.input}
                value={length}
                onChangeText={setLength}
                placeholder="Enter length"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>Breadth (meters)</Text>
              <TextInput
                style={styles.input}
                value={breadth}
                onChangeText={setBreadth}
                placeholder="Enter breadth"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
          ) : (
            <View>
              <Text style={styles.infoText}>
                Take a photo including a reference object (e.g., 1m stick)
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openCamera('property')}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.actionButtonText}>
                  {photos.length > 0 ? 'Retake Photo' : 'Take Photo'}
                </Text>
              </TouchableOpacity>
              {photos.length > 0 && (
                <Text style={styles.successText}>Photo captured!</Text>
              )}
              <Text style={styles.label}>Reference Object Length (meters)</Text>
              <TextInput
                style={styles.input}
                value={referenceLength}
                onChangeText={setReferenceLength}
                placeholder="e.g., 1.0 for 1 meter stick"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
          )}
          
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculateArea}
            disabled={loading}
          >
            <Text style={styles.calculateButtonText}>Calculate Area</Text>
          </TouchableOpacity>
          
          {area && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Estimated Area:</Text>
              <Text style={styles.resultValue}>{area.toFixed(2)} m²</Text>
              <Text style={styles.resultLabel}>Property Tax:</Text>
              <Text style={styles.resultValue}>
                ₹{(area * parseFloat(process.env.EXPO_PUBLIC_RATE_PER_M2 || '10')).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Property Photos & Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Documents</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openCamera('document')}
          >
            <Ionicons name="document" size={20} color="white" />
            <Text style={styles.actionButtonText}>Add Documents</Text>
          </TouchableOpacity>
          {documents.length > 0 && (
            <Text style={styles.successText}>{documents.length} document(s) added</Text>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Survey'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.bottomPadding} />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  gpsText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  methodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  methodButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  methodButtonActive: {
    backgroundColor: '#4CAF50',
  },
  methodButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  methodButtonTextActive: {
    color: 'white',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  calculateButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 32,
  },
});