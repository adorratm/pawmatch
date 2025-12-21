import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { mockPets, getPetsWithMatches } from '../../services/mockData';
import { Pet } from '../../types';
import { colors } from '../../utils/colors';

const { width, height } = Dimensions.get('window');

export default function MatchingScreen() {
  const navigation = useNavigation();
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');

  useEffect(() => {
    // Load fake data instead of API call
    const petsWithMatches = getPetsWithMatches();
    setPets(petsWithMatches);
  }, []);

  const handleLike = () => {
    if (currentIndex < pets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reset to beginning
      setCurrentIndex(0);
    }
  };

  const handleDislike = () => {
    if (currentIndex < pets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleChat = () => {
    // Navigate to chat
  };

  if (pets.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <Text style={styles.emptyText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentPet = pets[currentIndex];
  const mainPhoto = currentPet.photos?.find((p) => p.isMain) || currentPet.photos?.[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>

          <View style={styles.viewModeSelector}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'cards' && styles.viewModeButtonActive,
              ]}
              onPress={() => setViewMode('cards')}
            >
              <Text
                style={[
                  styles.viewModeText,
                  viewMode === 'cards' && styles.viewModeTextActive,
                ]}
              >
                Cards
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'map' && styles.viewModeButtonActive,
              ]}
              onPress={() => setViewMode('map')}
            >
              <Text style={styles.mapIcon}>🗺</Text>
              <Text
                style={[
                  styles.viewModeText,
                  viewMode === 'map' && styles.viewModeTextActive,
                ]}
              >
                Map
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content - Map View */}
        {viewMode === 'map' ? (
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: 41.0082,
                longitude: 28.9784,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
              showsUserLocation
              showsMyLocationButton={false}
            >
              {/* Show other pets on map */}
              {pets.slice(0, 5).map((pet, index) => {
                const petPhoto = pet.photos?.find((p) => p.isMain) || pet.photos?.[0];
                const lat = 41.0082 + (Math.random() - 0.5) * 0.1;
                const lng = 28.9784 + (Math.random() - 0.5) * 0.1;
                
                return (
                  <Marker
                    key={pet.id}
                    coordinate={{ latitude: lat, longitude: lng }}
                    title={pet.name}
                    description={pet.breed || pet.species}
                  >
                    <View style={styles.mapMarkerContainer}>
                      <Image
                        source={{ uri: petPhoto?.url || '' }}
                        style={styles.mapMarkerImage}
                      />
                      <View style={styles.mapMarkerBadge}>
                        <Text style={styles.mapMarkerBadgeIcon}>🐾</Text>
                      </View>
                    </View>
                  </Marker>
                );
              })}
              
              {/* Current pet marker */}
              {currentPet && (
                <Marker
                  coordinate={{
                    latitude: 41.0082,
                    longitude: 28.9784,
                  }}
                  title={currentPet.name}
                >
                  <View style={styles.currentPetMarker}>
                    <View style={styles.mapPetBubble}>
                      <Text style={styles.mapPetBubbleText}>
                        Woof! I'm here 🐾
                      </Text>
                    </View>
                    <View style={styles.mapPetAvatar}>
                      <Image
                        source={{ uri: mainPhoto?.url || '' }}
                        style={styles.mapPetAvatarImage}
                      />
                    </View>
                  </View>
                </Marker>
              )}
              
              {/* Safe Spot marker */}
              <Marker
                coordinate={{
                  latitude: 41.0082 + 0.02,
                  longitude: 28.9784 + 0.02,
                }}
              >
                <View style={styles.safeSpotMarker}>
                  <View style={styles.safeSpotIcon}>
                    <Text style={styles.safeSpotIconText}>🛡</Text>
                  </View>
                  <View style={styles.safeSpotLabel}>
                    <Text style={styles.safeSpotText}>Safe Spot</Text>
                  </View>
                </View>
              </Marker>
            </MapView>

            {/* Pet Card Overlay */}
            <View style={styles.petCardOverlay}>
              <View style={styles.petCard}>
                <Image
                  source={{ uri: mainPhoto?.url || '' }}
                  style={styles.petCardImage}
                />
                <View style={styles.petCardInfo}>
                  <View style={styles.petCardHeader}>
                    <Text style={styles.petCardName}>
                      {currentPet.name}, {currentPet.age}
                    </Text>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchBadgeText}>
                        Match {currentPet.matchScore}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.petCardDetails}>
                    <View style={styles.statusDot} />
                    <Text style={styles.petCardBreed}>
                      {currentPet.breed || currentPet.species} •{' '}
                      {currentPet.distance?.toFixed(1)}km away
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.suggestButton}>
                    <Text style={styles.suggestButtonIcon}>📍</Text>
                    <Text style={styles.suggestButtonText}>
                      Suggest Safe Meeting Point
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Cards View */
          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <Image
                source={{ uri: mainPhoto?.url || '' }}
                style={styles.cardImage}
              />
              <View style={styles.cardOverlay}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>
                      {currentPet.name}, {currentPet.age}
                    </Text>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchBadgeText}>
                        Match {currentPet.matchScore}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardDetails}>
                    <View style={styles.statusDot} />
                    <Text style={styles.cardBreed}>
                      {currentPet.breed || currentPet.species} •{' '}
                      {currentPet.distance?.toFixed(1)}km away
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dislikeButton]}
            onPress={handleDislike}
          >
            <Text style={[styles.actionIcon, { color: colors.error }]}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.chatButton]}
            onPress={handleChat}
          >
            <Text style={[styles.actionIcon, { color: colors.info }]}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={handleLike}
          >
            <Text style={[styles.actionIcon, { color: '#FFFFFF' }]}>♥</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 28,
    padding: 4,
    gap: 4,
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewModeButtonActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  viewModeTextActive: {
    fontWeight: '800',
    color: colors.text,
  },
  mapIcon: {
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterIcon: {
    fontSize: 24,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapMarkerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  mapMarkerImage: {
    width: '100%',
    height: '100%',
  },
  mapMarkerBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  mapMarkerBadgeIcon: {
    fontSize: 10,
  },
  currentPetMarker: {
    alignItems: 'center',
  },
  mapMarker1: {
    position: 'absolute',
    top: '38%',
    left: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapMarker2: {
    position: 'absolute',
    top: '20%',
    right: '20%',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  markerBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  markerBadgeIcon: {
    fontSize: 10,
  },
  mapMarker3: {
    position: 'absolute',
    top: '65%',
    left: '20%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPlaceholderIcon: {
    fontSize: 20,
    color: colors.gray[500],
  },
  safeSpot: {
    position: 'absolute',
    top: '34%',
    left: '68%',
    alignItems: 'center',
  },
  safeSpotIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  safeSpotIconText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  safeSpotLabel: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  safeSpotText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  mapPetInfo: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: [{ translateX: -32 }],
    alignItems: 'center',
  },
  mapPetBubble: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
  },
  mapPetBubbleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  mapPetAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  mapPetAvatarImage: {
    width: '100%',
    height: '100%',
  },
  petCardOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  petCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  petCardImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  petCardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  petCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  petCardName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  matchBadge: {
    backgroundColor: `${colors.primary}1A`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  petCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  petCardBreed: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  suggestButtonIcon: {
    fontSize: 18,
  },
  suggestButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    width: '100%',
    height: height * 0.65,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
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
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardInfo: {
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardBreed: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dislikeButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.error,
  },
  chatButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.info,
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionIcon: {
    fontSize: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 32,
  },
});
