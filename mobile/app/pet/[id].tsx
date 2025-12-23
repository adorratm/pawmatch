import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');

export default function PetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<any>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadPet();
    }
  }, [id]);

  const loadPet = async () => {
    try {
      const response = await api.get(`/pets/${id}`);
      setPet(response.data);
    } catch (error) {
      console.error('Error loading pet:', error);
    }
  };

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {pet.photos && pet.photos.length > 0 && (
            <Image
              source={{ uri: pet.photos[currentPhotoIndex]?.url }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          )}
          {pet.photos && pet.photos.length > 1 && (
            <View style={styles.photoIndicators}>
              {pet.photos.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentPhotoIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{pet.name}</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageText}>{pet.age} yaşında</Text>
            </View>
          </View>

          <Text style={styles.breed}>
            {pet.breed} • {pet.gender === 'male' ? 'Erkek' : 'Dişi'}
          </Text>

          {pet.temperaments && pet.temperaments.length > 0 && (
            <View style={styles.temperaments}>
              {pet.temperaments.map((temp: any, index: number) => (
                <View key={index} style={styles.temperamentTag}>
                  <Text style={styles.temperamentText}>#{temp.name}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Hakkında</Text>
            <Text style={styles.bio}>{pet.bio || 'Bilgi yok'}</Text>
          </View>

          <View style={styles.healthSection}>
            <Text style={styles.sectionTitle}>Sağlık Durumu</Text>
            <View style={styles.healthItem}>
              <Ionicons name="medical" size={20} color={COLORS.primary} />
              <Text style={styles.healthText}>
                {pet.isSpayed ? 'Kısırlaştırıldı' : 'Kısırlaştırılmadı'}
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
              <Text style={styles.healthText}>
                {pet.isVaccinated ? 'Aşıları tamam' : 'Aşıları eksik'}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.dislikeButton}
              onPress={async () => {
                try {
                  await api.post(`/matches/${pet.id}/dislike`);
                  router.back();
                } catch (error) {
                  console.error('Error disliking pet:', error);
                }
              }}
            >
              <Ionicons name="close" size={28} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={async () => {
                try {
                  const response = await api.post(`/matches/${pet.id}/like`);
                  if (response.data.isMatch) {
                    router.push({
                      pathname: '/new-match-notification',
                      params: { match: JSON.stringify(response.data) },
                    });
                  } else {
                    router.back();
                  }
                } catch (error) {
                  console.error('Error liking pet:', error);
                }
              }}
            >
              <Ionicons name="heart" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    width: width,
    height: width * 1.2,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  ageBadge: {
    backgroundColor: COLORS.primary + '1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ageText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  breed: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  temperaments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  temperamentTag: {
    backgroundColor: COLORS.primary + '1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  temperamentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  healthSection: {
    marginBottom: 24,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  healthText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 24,
    marginBottom: 40,
  },
  dislikeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  likeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});


