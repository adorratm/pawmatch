import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { matchesService } from '../../src/services/matches.service';
import { usePetStore } from '../../src/stores/petStore';
import { petsService } from '../../src/services/pets.service';
import { COLORS } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  const router = useRouter();
  const { likePet, dislikePet } = usePetStore();
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [activePetId, setActivePetId] = useState<number | null>(null);
  const [mode, setMode] = useState<'pawmatch' | 'adoption'>('pawmatch');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPets();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (activePetId && location) {
      loadPets();
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
        const newLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setLocation(newLocation);
        setRegion({
          ...newLocation,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadPets = async () => {
    if (!location || !activePetId) return;

    setLoading(true);
    try {
      const filters: any = {
        mode,
        latitude: location.latitude,
        longitude: location.longitude,
        limit: 50,
      };

      const response = await matchesService.discover(filters);
      setPets(response.pets || []);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (pet: any) => {
    setSelectedPet(pet);
  };

  const handleLike = async (petId: number) => {
    try {
      await likePet(petId);
      setSelectedPet(null);
      loadPets();
    } catch (error) {
      console.error('Error liking pet:', error);
    }
  };

  const handleDislike = async (petId: number) => {
    try {
      await dislikePet(petId);
      setSelectedPet(null);
      loadPets();
    } catch (error) {
      console.error('Error disliking pet:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {pets.map((pet) => {
          if (!pet.owner?.location) return null;
          return (
            <Marker
              key={pet.id}
              coordinate={{
                latitude: parseFloat(pet.owner.location.latitude.toString()),
                longitude: parseFloat(pet.owner.location.longitude.toString()),
              }}
              onPress={() => handleMarkerPress(pet)}
            >
              <View style={styles.markerContainer}>
                <Image
                  source={{
                    uri: pet.photos?.[0]?.url || 'https://picsum.photos/60/60',
                  }}
                  style={styles.markerImage}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {selectedPet && (
        <View style={styles.bottomSheet}>
          <View style={styles.handle} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedPet(null)}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.petCard}>
            <Image
              source={{
                uri: selectedPet.photos?.[0]?.url || 'https://picsum.photos/200/200',
              }}
              style={styles.petImage}
            />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{selectedPet.name}</Text>
              <Text style={styles.petDetails}>
                {selectedPet.breed || 'Cins belirtilmemiş'} • {selectedPet.age} yaşında
                {selectedPet.distance !== null && ` • ${selectedPet.distance}km`}
              </Text>
            </View>
          </View>
          <View style={styles.petActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.dislikeButton]}
              onPress={() => handleDislike(selectedPet.id)}
            >
              <Ionicons name="close" size={24} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => router.push(`/pet/${selectedPet.id}`)}
            >
              <Text style={styles.viewButtonText}>Detay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.likeButton]}
              onPress={() => handleLike(selectedPet.id)}
            >
              <Ionicons name="heart" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!selectedPet && pets.length > 0 && (
        <View style={styles.petsList}>
          <Text style={styles.listTitle}>Yakındaki Hayvanlar</Text>
          <FlatList
            horizontal
            data={pets.slice(0, 10)}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.petListItem}
                onPress={() => handleMarkerPress(item)}
              >
                <Image
                  source={{
                    uri: item.photos?.[0]?.url || 'https://picsum.photos/80/80',
                  }}
                  style={styles.petListItemImage}
                />
                <Text style={styles.petListItemName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.distance !== null && (
                  <Text style={styles.petListItemDistance}>{item.distance}km</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
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
    backgroundColor: COLORS.background,
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e5e5',
    alignSelf: 'center',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  petActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
  dislikeButton: {
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  likeButton: {
    backgroundColor: COLORS.primary,
  },
  viewButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  petsList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  petListItem: {
    width: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  petListItemImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 8,
  },
  petListItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  petListItemDistance: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});

