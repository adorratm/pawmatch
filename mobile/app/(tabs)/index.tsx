import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { usePetStore } from '../../src/stores/petStore';
import { petsService } from '../../src/services/pets.service';
import { COLORS } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function DiscoverScreen() {
  const router = useRouter();
  const { pets, currentIndex, loading, loadPets, likePet, dislikePet } = usePetStore();
  const [mode, setMode] = useState<'pawmatch' | 'adoption'>('pawmatch');
  const [userPets, setUserPets] = useState<any[]>([]);
  const [activePetId, setActivePetId] = useState<number | null>(null);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    loadUserPets();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (activePetId) {
      reloadPets();
    }
  }, [mode, activePetId, location]);

  const loadUserPets = async () => {
    try {
      const data = await petsService.getMyPets();
      setUserPets(data);
      if (data.length > 0) {
        setActivePetId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading user pets:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const reloadPets = async () => {
    const filters: any = {
      mode,
      limit: 20,
    };

    if (location) {
      filters.latitude = location.latitude;
      filters.longitude = location.longitude;
    }

    try {
      await loadPets(filters);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const handleLike = async (petId: number) => {
    try {
      const result = await likePet(petId);
      if (result.isMatch) {
        Alert.alert('Eşleşme!', 'Yeni bir eşleşme buldunuz!', [
          {
            text: 'Sohbet Et',
            onPress: () => router.push(`/chat/${result.conversationId}`),
          },
          { text: 'Tamam' },
        ]);
      }
    } catch (error) {
      console.error('Error liking pet:', error);
      Alert.alert('Hata', 'Beğeni gönderilemedi.');
    }
  };

  const handleDislike = async (petId: number) => {
    try {
      await dislikePet(petId);
    } catch (error) {
      console.error('Error disliking pet:', error);
    }
  };

  const currentPet = pets[currentIndex];
  const activePet = userPets.find((p) => p.id === activePetId);

  if (loading && pets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentPet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=1' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'pawmatch' && styles.modeButtonActive]}
              onPress={() => setMode('pawmatch')}
            >
              <Text style={[styles.modeText, mode === 'pawmatch' && styles.modeTextActive]}>
                PawMatch
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'adoption' && styles.modeButtonActive]}
              onPress={() => setMode('adoption')}
            >
              <Text style={[styles.modeText, mode === 'adoption' && styles.modeTextActive]}>
                Sahiplenme
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => router.push('/filter')}
          >
            <Ionicons name="options" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="paw-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Daha fazla hayvan yok</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={reloadPets}>
            <Text style={styles.reloadButtonText}>Yenile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=1' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {activePet && (
            <TouchableOpacity
              style={styles.petSelector}
              onPress={() => setShowPetSelector(true)}
            >
              <Image
                source={{
                  uri: activePet.photos?.[0]?.url || 'https://picsum.photos/40/40',
                }}
                style={styles.petSelectorImage}
              />
              <Text style={styles.petSelectorText}>{activePet.name}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'pawmatch' && styles.modeButtonActive]}
              onPress={() => setMode('pawmatch')}
            >
              <Text style={[styles.modeText, mode === 'pawmatch' && styles.modeTextActive]}>
                PawMatch
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'adoption' && styles.modeButtonActive]}
              onPress={() => setMode('adoption')}
            >
              <Text style={[styles.modeText, mode === 'adoption' && styles.modeTextActive]}>
                Sahiplenme
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => router.push('/filter')}
        >
          <Ionicons name="options" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => router.push(`/pet/${currentPet.id}`)}
        >
          <Image
            source={{ uri: currentPet.photos?.[0]?.url || 'https://picsum.photos/400/600' }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardOverlay}>
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{currentPet.name}</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>Match 98%</Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
                <View style={styles.statusDot} />
                <Text style={styles.cardMetaText}>
                  {currentPet.breed || 'Cins belirtilmemiş'} • {currentPet.age} yaşında
                  {currentPet.distance !== null && ` • ${currentPet.distance}km uzaklıkta`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.suggestButton}
              onPress={() => router.push('/suggest-meeting-point')}
            >
              <Ionicons name="location" size={18} color="#fff" />
              <Text style={styles.suggestButtonText}>Suggest Safe Meeting Point</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDislike(currentPet.id)}
        >
          <Ionicons name="close" size={28} color="#ef4444" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleLike(currentPet.id)}
        >
          <Ionicons name="heart" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPetSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPetSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hayvan Seç</Text>
              <TouchableOpacity onPress={() => setShowPetSelector(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={userPets}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.petOption,
                    activePetId === item.id && styles.petOptionActive,
                  ]}
                  onPress={() => {
                    setActivePetId(item.id);
                    setShowPetSelector(false);
                  }}
                >
                  <Image
                    source={{
                      uri: item.photos?.[0]?.url || 'https://picsum.photos/60/60',
                    }}
                    style={styles.petOptionImage}
                  />
                  <View style={styles.petOptionInfo}>
                    <Text style={styles.petOptionName}>{item.name}</Text>
                    <Text style={styles.petOptionDetails}>
                      {item.breed || 'Cins belirtilmemiş'} • {item.age} yaşında
                    </Text>
                  </View>
                  {activePetId === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    paddingBottom: 8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  headerButtons: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    padding: 4,
    gap: 4,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  headerButtonTextActive: {
    fontWeight: '800',
    color: COLORS.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cardInfo: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  matchBadge: {
    backgroundColor: COLORS.primary + '1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  matchText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  cardMetaText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  suggestButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  suggestButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 24,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  petSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 8,
  },
  petSelectorImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  petSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 2,
    gap: 4,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 18,
  },
  modeButtonActive: {
    backgroundColor: '#fff',
  },
  modeText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  modeTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  reloadButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  reloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  petOptionActive: {
    backgroundColor: COLORS.primary + '10',
  },
  petOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  petOptionInfo: {
    flex: 1,
  },
  petOptionName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  petOptionDetails: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});


