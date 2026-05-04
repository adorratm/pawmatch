import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import api from '@/infrastructure/api/api';

export default function VeterinariansScreen() {
  const navigation = useNavigation();
  const [clinics, setClinics] = useState<any[]>([]);

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      const response = await api.get('/veterinarians/nearby?latitude=41.0082&longitude=28.9784');
      setClinics(response.data.clinics || []);
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  const renderClinic = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.clinicCard}
      onPress={() =>
        (navigation as any).navigate('VeterinarianDetail1', { clinicId: item.id })
      }
    >
      <Image
        source={{ uri: 'https://picsum.photos/400/300?random=' + item.id }}
        style={styles.clinicImage}
      />
      <View style={styles.clinicInfo}>
        <Text style={styles.clinicName}>{item.name}</Text>
        <View style={styles.clinicMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#fbbf24" />
            <Text style={styles.rating}>{item.rating?.toFixed(1) || '4.5'}</Text>
          </View>
          <Text style={styles.reviews}>{item.reviewCount || 0} Yorum</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>AÇIK</Text>
          </View>
        </View>
        <View style={styles.clinicLocation}>
          <Ionicons name="location" size={16} color={COLORS.textMuted} />
          <Text style={styles.locationText}>{item.city}, {item.district}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yakın Veterinerler</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('VeterinariansMap')}>
          <Ionicons name="map" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={clinics}
        renderItem={renderClinic}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Yakınınızda veteriner bulunamadı</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  list: {
    padding: 24,
  },
  clinicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  clinicImage: {
    width: '100%',
    height: 200,
  },
  clinicInfo: {
    padding: 16,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  clinicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviews: {
    fontSize: 14,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  clinicLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
  },
});


