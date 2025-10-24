import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getSurveyById, deleteSurvey } from '../utils/storage';
import { decrypt } from '../utils/encryption';
import { generateReport } from '../utils/apiStubs';

export default function SurveyDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    try {
      const data = await getSurveyById(id);
      if (data) {
        setSurvey(data);
      } else {
        Alert.alert('Error', 'Survey not found');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Survey',
      'Are you sure you want to delete this survey? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSurvey(id);
              Alert.alert('Success', 'Survey deleted successfully');
              router.replace('/my-surveys');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete survey');
            }
          },
        },
      ]
    );
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const report = await generateReport(survey);
      Alert.alert(
        'Report Generated',
        `Report ID: ${report.reportId}\n\nNote: This is a JSON stub. Implement PDF generation for production.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || !survey) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Survey Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Survey Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Area</Text>
              <Text style={styles.summaryValue}>{survey.area?.toFixed(2)} m²</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Property Tax</Text>
              <Text style={styles.summaryValue}>₹{survey.tax?.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Owner Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Information</Text>
          <DetailRow icon="person" label="Name" value={survey.name} />
          {survey.fatherName && (
            <DetailRow icon="people" label="Father's Name" value={survey.fatherName} />
          )}
          <DetailRow icon="call" label="Phone" value={survey.phone} />
          {survey.email && <DetailRow icon="mail" label="Email" value={survey.email} />}
          {survey.aadhar && (
            <DetailRow
              icon="card"
              label="Aadhar"
              value="********" // Encrypted - don't show full number
              secure
            />
          )}
        </View>

        {/* Property Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Information</Text>
          <DetailRow icon="location" label="Address" value={survey.address} multiline />
          {survey.gps && (
            <DetailRow
              icon="navigate"
              label="GPS Coordinates"
              value={`${survey.gps.latitude.toFixed(6)}, ${survey.gps.longitude.toFixed(6)}`}
            />
          )}
          <DetailRow
            icon="resize"
            label="Area Calculation Method"
            value={survey.areaMethod === 'manual' ? 'Manual Entry' : 'Photo + Reference Object'}
          />
        </View>

        {/* Photos & Documents */}
        {(survey.photos?.length > 0 || survey.documents?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos & Documents</Text>
            {survey.photos?.length > 0 && (
              <View style={styles.photoContainer}>
                <Text style={styles.photoLabel}>Property Photos: {survey.photos.length}</Text>
              </View>
            )}
            {survey.documents?.length > 0 && (
              <View style={styles.photoContainer}>
                <Text style={styles.photoLabel}>Documents: {survey.documents.length}</Text>
              </View>
            )}
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Survey Metadata</Text>
          <DetailRow icon="calendar" label="Created" value={formatDate(survey.createdAt)} />
          {survey.updatedAt && (
            <DetailRow icon="time" label="Updated" value={formatDate(survey.updatedAt)} />
          )}
          <DetailRow icon="key" label="Survey ID" value={survey.id} />
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleGenerateReport}>
            <Ionicons name="document-text" size={20} color="white" />
            <Text style={styles.actionButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const DetailRow = ({ icon, label, value, multiline, secure }) => (
  <View style={[styles.detailRow, multiline && styles.detailRowMultiline]}>
    <View style={styles.detailIcon}>
      <Ionicons name={icon} size={20} color="#4CAF50" />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, multiline && styles.detailValueMultiline]}>
        {value || 'N/A'}
      </Text>
    </View>
    {secure && <Ionicons name="lock-closed" size={16} color="#999" />}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
    marginLeft: 16,
  },
  deleteButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#4CAF50',
    margin: 16,
    borderRadius: 12,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailRowMultiline: {
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 40,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    marginLeft: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailValueMultiline: {
    lineHeight: 22,
  },
  photoContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  photoLabel: {
    fontSize: 14,
    color: '#666',
  },
  actionSection: {
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 32,
  },
});