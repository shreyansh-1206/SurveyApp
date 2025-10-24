import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getSurveys } from '../utils/storage';

export default function MySurveys() {
  const router = useRouter();
  const [surveys, setSurveys] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await getSurveys();
      setSurveys(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load surveys');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSurveys();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderSurveyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.surveyCard}
      onPress={() => router.push({ pathname: '/survey-detail', params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="document-text" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Area</Text>
            <Text style={styles.statValue}>{item.area?.toFixed(2) || 0} m²</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Tax</Text>
            <Text style={styles.statValue}>₹{item.tax?.toFixed(2) || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Surveys Yet</Text>
      <Text style={styles.emptyText}>Create your first property survey</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/new-survey')}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.createButtonText}>New Survey</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Surveys</Text>
        <TouchableOpacity onPress={() => router.push('/new-survey')} style={styles.addButton}>
          <Ionicons name="add" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={surveys}
        renderItem={renderSurveyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={surveys.length === 0 ? styles.flatListEmpty : styles.flatList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
        ListEmptyComponent={EmptyList}
      />
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
  addButton: {
    padding: 8,
  },
  flatList: {
    padding: 16,
  },
  flatListEmpty: {
    flex: 1,
  },
  surveyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});