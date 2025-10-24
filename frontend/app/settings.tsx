import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const router = useRouter();
  const [ratePerM2, setRatePerM2] = useState('10');
  const [apiUploadUrl, setApiUploadUrl] = useState('');
  const [apiOcrUrl, setApiOcrUrl] = useState('');
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('@app_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setRatePerM2(parsed.ratePerM2 || '10');
        setApiUploadUrl(parsed.apiUploadUrl || '');
        setApiOcrUrl(parsed.apiOcrUrl || '');
        setEncryptionEnabled(parsed.encryptionEnabled !== false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      const rate = parseFloat(ratePerM2);
      if (isNaN(rate) || rate <= 0) {
        Alert.alert('Error', 'Please enter a valid tax rate (must be greater than 0)');
        return;
      }

      const settings = {
        ratePerM2,
        apiUploadUrl,
        apiOcrUrl,
        encryptionEnabled,
      };

      await AsyncStorage.setItem('@app_settings', JSON.stringify(settings));
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will restore all settings to default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setRatePerM2('10');
            setApiUploadUrl('');
            setApiOcrUrl('');
            setEncryptionEnabled(true);
            await AsyncStorage.removeItem('@app_settings');
            Alert.alert('Success', 'Settings reset to defaults');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Tax Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Configuration</Text>
          <Text style={styles.description}>
            Set the property tax rate per square meter
          </Text>
          
          <Text style={styles.label}>Rate per m² (₹)</Text>
          <TextInput
            style={styles.input}
            value={ratePerM2}
            onChangeText={setRatePerM2}
            placeholder="10"
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
        </View>

        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          <Text style={styles.description}>
            Configure cloud storage and OCR service endpoints (optional)
          </Text>
          
          <Text style={styles.label}>Cloud Upload URL</Text>
          <TextInput
            style={styles.input}
            value={apiUploadUrl}
            onChangeText={setApiUploadUrl}
            placeholder="https://your-cloud-storage-api.com/upload"
            keyboardType="url"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          
          <Text style={styles.label}>OCR Service URL</Text>
          <TextInput
            style={styles.input}
            value={apiOcrUrl}
            onChangeText={setApiOcrUrl}
            placeholder="https://your-ocr-service.com/extract"
            keyboardType="url"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Leave empty to use local storage (stub mode). Configure for production use.
            </Text>
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Data Encryption</Text>
              <Text style={styles.settingDescription}>
                Encrypt sensitive data (Aadhar) before storage
              </Text>
            </View>
            <Switch
              value={encryptionEnabled}
              onValueChange={setEncryptionEnabled}
              trackColor={{ false: '#767577', true: '#81c784' }}
              thumbColor={encryptionEnabled ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutRow}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <View style={styles.aboutContent}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0 (Prototype)</Text>
            </View>
          </View>
          
          <View style={styles.aboutRow}>
            <Ionicons name="cube-outline" size={20} color="#666" />
            <View style={styles.aboutContent}>
              <Text style={styles.aboutLabel}>Build</Text>
              <Text style={styles.aboutValue}>Minimal Credit-Friendly Prototype</Text>
            </View>
          </View>
          
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color="#FF9800" />
            <Text style={styles.warningText}>
              This is a prototype with stubbed AI features. Replace estimateAreaFromImage, uploadFile, and callOCR with production services.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={saveSettings}
            disabled={loading}
          >
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetSettings}
          >
            <Ionicons name="refresh" size={20} color="#f44336" />
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#333',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
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
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 8,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  aboutContent: {
    marginLeft: 12,
    flex: 1,
  },
  aboutLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  aboutValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionSection: {
    padding: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  resetButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 32,
  },
});