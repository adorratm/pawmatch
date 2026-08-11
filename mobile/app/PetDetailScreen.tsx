import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useRoute, useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository } from '@/infrastructure/repositories/ApiPetRepository';
import { LinearGradient } from 'expo-linear-gradient';
import { Pet } from '@/domain/entities/Pet';
import { matchesService } from '@/infrastructure/api/matches.service';
import { favoritesService } from '@/infrastructure/api/favorites.service';
import { usePetStore } from '@/application/stores/petStore';
import { showAlert, showConfirm } from '@/presentation/utils/dialog';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 1.25;

export default function PetDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const likerPetId = usePetStore((s) => s.likerPetId);
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const navParams = route.params as { id?: string } | undefined;
  const id = navParams?.id ?? params.id;
  const [pet, setPet] = useState<Pet | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMatch, setHasMatch] = useState(false);

  const loadMyPetsForLike = usePetStore((s) => s.loadMyPetsForLike);

  useEffect(() => {
    void loadMyPetsForLike();
  }, [loadMyPetsForLike]);

  useEffect(() => {
    if (id) {
      loadPet();
    }
  }, [id]);

  const loadPet = async () => {
    try {
      const pid = parseInt(String(id), 10);
      const data = await petRepository.findById(pid);
      setPet(data);
      try {
        const m = await matchesService.getMatches();
        const list = m?.matches ?? [];
        setHasMatch(list.some((x: { pet?: { id?: number } }) => x.pet?.id === pid));
      } catch {
        setHasMatch(false);
      }
    } catch (error) {
      console.error('Error loading pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slide !== currentPhotoIndex) {
      setCurrentPhotoIndex(slide);
    }
  };

  if (loading || !pet) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Image Section */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {pet.photos?.length > 0 ? (
              pet.photos.map((photo: any, index: number) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: photo.url }}
                    style={styles.mainImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.5)']}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              ))
            ) : (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiVJpBMkTCTl_4nDWT5vBi3XpKm4yESGbn7_YWMKQlIjTARmzwW_O1cPBsjYikf53bq7U073zI6iKluDX1xP6WX2njVFfnSEbbLXk4C_JDzcCPKx56fhN_KJTsh7FrizmjKxNeWStWQhsQ7VdeYCjV-xEps3wCUzk40duXsKlfwHpIVPxQmC0PCaRNKwDf_0A-scLxiEkQq5hibniRILIKB5ZIekhr-5y5Ir9H64MHNtbGj0etBMt0t54OMs6yUbAUlqq9b7Nli2DK' }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.5)']}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            )}
          </ScrollView>

          {/* Image Header Overlay */}
          <View style={[styles.imageHeader, { top: insets.top + 10 }]}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Pagination Indicators */}
          <View style={styles.paginationRow}>
            <View style={styles.paginationDots}>
              {(pet.photos?.length || 1) > 1 && pet.photos.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentPhotoIndex ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
            <View style={styles.photoCount}>
              <Ionicons name="images-outline" size={12} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.photoCountText}>{currentPhotoIndex + 1}/{pet.photos?.length || 1}</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.mainInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{pet.name}, {pet.age}</Text>
              <View style={styles.genderIcon}>
                <MaterialCommunityIcons
                  name={pet.gender === 'male' ? 'gender-male' : 'gender-female'}
                  size={20}
                  color={COLORS.primary}
                />
              </View>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.locationText}>
                {t('pets.detailLocationFallback', {
                  distance: pet.distance || '5',
                  location: pet.locationName || t('pets.detailLocationDefault'),
                })}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: '#fff3e0' }]}>
                <MaterialCommunityIcons name="paw" size={24} color="#e67e22" />
              </View>
              <Text style={styles.statLabel}>{t('pets.detailBreed')}</Text>
              <Text style={styles.statValue} numberOfLines={1}>{pet.breed?.split(' ')?.[0] || t('pets.detailUnknown')}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: '#e8f5e9' }]}>
                <MaterialCommunityIcons name="scale-bathroom" size={24} color="#27ae60" />
              </View>
              <Text style={styles.statLabel}>{t('pets.detailWeight')}</Text>
              <Text style={styles.statValue}>{pet.weight || '32'} kg</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(106, 63, 42, 0.1)' }]}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statLabel}>{t('pets.detailEnergy')}</Text>
              <Text style={styles.statValue}>{pet.energyLevel || t('pets.detailEnergyHigh')}</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {pet.temperaments?.map((tag: any, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag.name} {tag.emoji || ''}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('pets.detailHealthStatus')}</Text>
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="shield-check" size={14} color="#27ae60" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedText}>{t('pets.detailVetChecked')}</Text>
            </View>
          </View>

          <View style={styles.healthCard}>
            <View style={styles.healthItem}>
              <View style={styles.healthIconWrap}>
                <MaterialCommunityIcons name="needle" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.healthLabel}>{t('pets.detailVaccinations')}</Text>
                <Text style={styles.healthSub}>{pet.isVaccinated ? t('pets.detailVaccinatedUpToDate') : t('pets.detailVaccinatedMissing')}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            </View>
            <View style={[styles.healthItem, styles.healthBorderTop]}>
              <View style={styles.healthIconWrap}>
                <MaterialCommunityIcons name="bandage" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.healthLabel}>{t('pets.detailSpayed')}</Text>
                <Text style={styles.healthSub}>{pet.isSpayed ? t('pets.detailSpayedCompleted') : t('pets.detailSpayedNotCompleted')}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            </View>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>{t('pets.detailAbout', { name: pet.name })}</Text>
            <Text style={styles.aboutText}>
              {pet.bio || t('pets.detailDefaultBio', { name: pet.name, breed: pet.breed })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.actionBtnSmall}
          onPress={async () => {
            try {
              await matchesService.dislike(
                parseInt(String(id), 10),
                likerPetId != null ? { dislikerPetId: likerPetId } : {},
              );
              navigation.goBack();
            } catch (e: any) {
              Alert.alert(t('common.error'), e?.response?.data?.message || t('discover.alertActionFailed'));
            }
          }}
        >
          <Ionicons name="close" size={32} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnSmall}
          onPress={async () => {
            try {
              await matchesService.like(parseInt(String(id), 10), {
                isSuperLike: true,
                ...(likerPetId != null ? { likerPetId } : {}),
              });
              Alert.alert(t('discover.alertSuperLike'), t('pets.detailSuperLikeSent'));
            } catch (e: any) {
              Alert.alert(t('discover.alertSuperLike'), e?.response?.data?.message || t('discover.alertSuperLikeFailed'));
            }
          }}
        >
          <Ionicons name="flash" size={26} color="#f59e0b" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnLarge}
          onPress={async () => {
            try {
              const r = await matchesService.like(parseInt(String(id), 10), {
                ...(likerPetId != null ? { likerPetId } : {}),
              });
              if (r?.isMatch && r?.conversationId) {
                showConfirm({
                  title: t('pets.detailMatchTitle'),
                  message: t('pets.detailMatchMessage'),
                  confirmLabel: t('pets.detailMatchChat'),
                  cancelLabel: t('common.close'),
                  icon: 'heart',
                  variant: 'success',
                  onCancel: () => navigation.goBack(),
                  onConfirm: () =>
                    (navigation as any).navigate('Chat', { id: String(r.conversationId) }),
                });
              } else {
                showAlert(t('discover.alertLike'), t('pets.detailLikeSaved'), { variant: 'success', icon: 'heart-outline' });
              }
            } catch (e: any) {
              showAlert(t('discover.alertLike'), e?.response?.data?.message || t('discover.alertActionFailed'), {
                variant: 'destructive',
              });
            }
          }}
        >
          <Ionicons name="heart" size={40} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnSmall}
          onPress={async () => {
            try {
              await favoritesService.add(parseInt(String(id), 10));
              Alert.alert(t('discover.alertFavorites'), t('pets.detailFavoriteAdded'));
            } catch (e: any) {
              Alert.alert(t('common.error'), e?.response?.data?.message || t('discover.alertFavoriteFailed'));
            }
          }}
        >
          <Ionicons name="star" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        {hasMatch ? (
          <TouchableOpacity
            style={styles.actionBtnSmall}
            onPress={() => {
              showConfirm({
                title: t('discover.unmatchTitle'),
                message: t('discover.unmatchMessage'),
                confirmLabel: t('common.remove'),
                icon: 'unlink-outline',
                variant: 'destructive',
                onConfirm: async () => {
                  try {
                    await matchesService.unmatchByPet(parseInt(String(id), 10));
                    setHasMatch(false);
                    queueMicrotask(() =>
                      showAlert(t('common.ok'), t('discover.unmatchDone'), {
                        variant: 'success',
                        onConfirm: () => navigation.goBack(),
                      }),
                    );
                  } catch (e: any) {
                    queueMicrotask(() =>
                      showAlert(t('common.error'), e?.response?.data?.message || t('discover.unmatchFailed'), {
                        variant: 'destructive',
                      }),
                    );
                  }
                },
              });
            }}
          >
            <Ionicons name="unlink-outline" size={22} color="#b45309" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageSection: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  imageHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  paginationRow: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  activeDot: {
    width: 24,
  },
  inactiveDot: {
    width: 6,
    opacity: 0.5,
  },
  photoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  photoCountText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Ubuntu-Bold',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  mainInfo: {
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 32,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
  },
  genderIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(106, 63, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Medium',
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Ubuntu-Medium',
    color: '#888',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Bold',
    color: '#444',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: 'Ubuntu-Bold',
    color: '#27ae60',
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  healthBorderTop: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  healthIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 63, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthLabel: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
    marginBottom: 2,
  },
  healthSub: {
    fontSize: 11,
    fontFamily: 'Ubuntu-Medium',
    color: '#888',
  },
  aboutSection: {
    gap: 8,
  },
  aboutText: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Medium',
    color: '#444',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  actionBtnSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionBtnLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
