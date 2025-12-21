import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { colors } from '../../utils/colors';

interface Veterinarian {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  photos?: string[];
}

export default function VeterinarianListScreen() {
  const navigation = useNavigation();
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVeterinarians();
  }, []);

  const loadVeterinarians = async () => {
    try {
      // This endpoint will be implemented in Faz 2
      // const response = await api.get('/veterinarians/nearby');
      // setVeterinarians(response.data);
      setVeterinarians([]);
    } catch (error) {
      console.error('Error loading veterinarians:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVeterinarian = ({ item }: { item: Veterinarian }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('VeterinarianDetail' as never, { id: item.id } as never)
      }
    >
      {item.photos?.[0] && (
        <Image source={{ uri: item.photos[0] }} style={styles.image} />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.reviews}>({item.reviewCount})</Text>
          {item.distance && (
            <Text style={styles.distance}>• {item.distance.toFixed(1)}km</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yakın Veterinerler</Text>
      </View>
      <FlatList
        data={veterinarians}
        renderItem={renderVeterinarian}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Yakınınızda veteriner bulunamadı
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  reviews: {
    fontSize: 14,
    color: colors.textMuted,
  },
  distance: {
    fontSize: 14,
    color: colors.textMuted,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});


