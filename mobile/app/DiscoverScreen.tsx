import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from 'expo-router/react-navigation';
import { favoritesService } from '@/infrastructure/api/favorites.service';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { usePetStore } from '@/application/stores/petStore';
import { useAuthStore } from '@/application/stores/authStore';
import { userRepository } from '@/infrastructure/repositories/ApiUserRepository';
import {
  buildDiscoverApiParams,
  resolveDiscoverCoordinates,
  type DiscoverFiltersSaved,
} from '@/infrastructure/api/discoverFilters';
import { PawmatchAdBanner } from '@/presentation/components/PawmatchAdBanner';
import { useTranslation } from 'react-i18next';

import { shadowStyle } from '@/presentation/styles/shadow';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = 16;
const CARD_INNER_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const {
    pets,
    currentIndex,
    loading,
    loadPets,
    likePet,
    dislikePet,
    setActiveDiscoverFilters,
    loadMyPetsForLike,
    myPetsForLike,
    likerPetId,
    setLikerPetId,
    discoverMode,
    setDiscoverMode,
  } = usePetStore();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [bootstrapped, setBootstrapped] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void loadMyPetsForLike();
    }, [loadMyPetsForLike]),
  );

  useEffect(() => {
    setPhotoIndex(0);
  }, [currentIndex]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await loadMyPetsForLike();
        const u = await userRepository.getCurrentUser();
        const prefs = (u?.profile?.preferences as Record<string, unknown> | undefined) ?? {};
        const raw = prefs.discoverFilters as DiscoverFiltersSaved | undefined;
        const mode =
          prefs.discoverMode === 'adoption' || prefs.discoverMode === 'playmate'
            ? prefs.discoverMode
            : 'playmate';
        const coords = await resolveDiscoverCoordinates(raw ?? undefined);
        if (!alive) return;
        const params =
          raw && typeof raw === 'object'
            ? { ...buildDiscoverApiParams(raw, coords), mode }
            : { mode };
        setActiveDiscoverFilters(params);
        await loadPets(params);
      } catch {
        if (alive) await loadPets({ mode: 'playmate' });
      } finally {
        if (alive) setBootstrapped(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const currentPet = pets[currentIndex];
  const needsPlaymatePet = discoverMode === 'playmate' && myPetsForLike.length === 0;

  const galleryPhotos = useMemo(() => {
    if (!currentPet?.photos?.length) {
      return [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6JqyeFfKbzIV96d7Ss8Z8VIbXK_ip3_tgj65pp7VYE2Y51FBPgWJ7GO_67BusF0qB8PRHHPK2om8_D7FJt8_AgzuYQX5oiEwYaSKsy_eIoDazBt5KIy9iKhxGIRXFU9DiL4Ql-7Iy-qeAzoJm18tZsNFTP72l8duZlbVwVBNSyx_UcrKs54Ow6lIO6LVRb9_AFpT_AU2FXoYm5QhKhzYzfDdSRyXaP-Jxqj5Nt0DYG8lNbEXf-9ksglCDsYHvZpI7QH5092r7MQdB',
        },
      ];
    }
    return currentPet.photos.map((p: { url: string }) => ({ url: p.url }));
  }, [currentPet]);

  const modeToggle = (
    <View style={styles.modeRow}>
      <TouchableOpacity
        style={[styles.modeChip, discoverMode === 'playmate' && styles.modeChipActive]}
        onPress={() => void setDiscoverMode('playmate')}
      >
        <Text
          style={[styles.modeChipText, discoverMode === 'playmate' && styles.modeChipTextActive]}
        >
          {t('discover.modePlaymate')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modeChip, discoverMode === 'adoption' && styles.modeChipActive]}
        onPress={() => void setDiscoverMode('adoption')}
      >
        <Text
          style={[styles.modeChipText, discoverMode === 'adoption' && styles.modeChipTextActive]}
        >
          {t('discover.modeAdopt')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const header = (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => (navigation as any).navigate('Profile')}
      >
        <Image
          source={{
            uri:
              user?.profile?.photoUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCG3B8xe_3c4vII4DM0h6bfLId7eOc8O3pVJtHKhJXQpNP05XDFgW4FI8XycNBFd0MeKsZUzfHjpDWF6RONaYYJCUvxC0k54YFJliAYlAfR0f7VZGmEaZsdUFS9uFTjuPygy9LAEBjBatQ0Twnsr4nZwGcm8SeOgMMgroiLDvR7UoItHV_-7nCqPD7tIkw8_Cing7Ed-B_ZnydmhSKwgDZEgaeDBS3iZTJVAzBZBJLQVJ1b-7NBSzD1Sw8AQUn6f3RzkJ3jC4nMPBt8',
          }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <View style={styles.headerToggle}>
        <TouchableOpacity style={[styles.toggleItem, styles.toggleItemActive]}>
          <Text style={[styles.toggleText, styles.toggleTextActive]}>{t('nav.discover')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleItem}
          onPress={() => (navigation as any).navigate('DiscoverMap')}
        >
          <Ionicons name="map-outline" size={14} color="#888" style={{ marginRight: 4 }} />
          <Text style={styles.toggleText}>{t('nav.map')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (navigation as any).navigate('Filter')}
        >
          <Ionicons name="options-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (navigation as any).navigate('NotificationsInbox')}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (navigation as any).navigate('IncomingLikes')}
        >
          <Ionicons name="paw-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (navigation as any).navigate('Favorites')}
        >
          <Ionicons name="heart-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if ((!bootstrapped || loading) && pets.length === 0 && !needsPlaymatePet) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (needsPlaymatePet) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {header}
        {modeToggle}
        <View style={styles.emptyContainer}>
          <MaterialIcons name="pets" size={64} color="#eee" />
          <Text style={styles.emptyText}>{t('discover.emptyNoPlaymatePet')}</Text>
          <Text style={styles.emptyHint}>
            {t('discover.emptyNoPlaymatePetHint')}
          </Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => (navigation as any).navigate('MyPets')}
          >
            <Text style={styles.refreshBtnText}>{t('discover.myPets')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.refreshBtn, { marginTop: 12, backgroundColor: '#f5f5f5' }]}
            onPress={() => (navigation as any).navigate('CreatePetProfile')}
          >
            <Text style={[styles.refreshBtnText, { color: COLORS.primary }]}>{t('discover.addPet')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentPet) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {header}
        {modeToggle}
        <View style={styles.emptyContainer}>
          <MaterialIcons name="pets" size={64} color="#eee" />
          <Text style={styles.emptyText}>
            {discoverMode === 'adoption'
              ? t('discover.emptyNoAdoption')
              : t('discover.emptyNoMorePlaymates')}
          </Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => loadPets()}>
            <Text style={styles.refreshBtnText}>{t('common.retry')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.refreshBtn, { marginTop: 12, backgroundColor: '#f5f5f5' }]}
            onPress={() => (navigation as any).navigate('Filter')}
          >
            <Text style={[styles.refreshBtnText, { color: COLORS.primary }]}>{t('discover.openFilters')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {header}
      {modeToggle}

      {discoverMode === 'playmate' && myPetsForLike.length > 0 ? (
        <View style={styles.likerRow}>
          <Text style={styles.likerLabel}>{t('discover.likerLabel')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.likerChips}
          >
            {myPetsForLike.map((p) => {
              const active = likerPetId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.likerChip, active && styles.likerChipActive]}
                  onPress={() => void setLikerPetId(p.id)}
                >
                  <Text
                    style={[styles.likerChipText, active && styles.likerChipTextActive]}
                    numberOfLines={1}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.content}>
        <View style={styles.cardContainer}>
          <View style={styles.cardImageArea}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const idx = Math.round(x / CARD_INNER_WIDTH);
                if (idx !== photoIndex) setPhotoIndex(idx);
              }}
              scrollEventThrottle={16}
            >
              {galleryPhotos.map((ph, idx) => (
                <View key={`${currentPet.id}-${idx}`} style={{ width: CARD_INNER_WIDTH, flex: 1 }}>
                  <Image source={{ uri: ph.url }} style={styles.cardImage} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.detailFab}
              onPress={() =>
                (navigation as any).navigate('PetDetail', { id: String(currentPet.id) })
              }
            >
              <Ionicons name="expand-outline" size={20} color="#fff" />
            </TouchableOpacity>
            {galleryPhotos.length > 1 ? (
              <View style={styles.photoDots}>
                {galleryPhotos.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.photoDot, i === photoIndex && styles.photoDotActive]}
                  />
                ))}
              </View>
            ) : null}
          </View>
          <View style={styles.cardOverlay}>
            <View style={styles.cardInfoRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.petName}>
                    {currentPet.name}, {currentPet.age}
                  </Text>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>
                      {discoverMode === 'adoption' ? t('discover.modeAdopt') : t('discover.patiScore')}
                    </Text>
                  </View>
                </View>
                <View style={styles.breedRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.breedText}>
                    {t('discover.distanceAway', { breed: currentPet.breed, distance: currentPet.distance || '2.4' })}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.suggestButton}
              onPress={() =>
                (navigation as any).navigate('PetDetail', { id: String(currentPet.id) })
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.suggestButtonText}>{t('discover.viewDetails')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <PawmatchAdBanner />

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButtonSmall}
          onPress={async () => {
            try {
              await dislikePet(currentPet.id);
            } catch (e: any) {
              Alert.alert(t('common.error'), e?.response?.data?.message || t('discover.alertActionFailed'));
            }
          }}
        >
          <Ionicons name="close" size={32} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonSmall}
          onPress={async () => {
            try {
              await likePet(currentPet.id, { isSuperLike: true });
            } catch (e: any) {
              Alert.alert(t('discover.alertSuperLike'), e?.response?.data?.message || t('discover.alertSuperLikeFailed'));
            }
          }}
        >
          <Ionicons name="flash" size={26} color="#f59e0b" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonLarge}
          onPress={async () => {
            try {
              await likePet(currentPet.id);
            } catch (e: any) {
              Alert.alert(t('discover.alertLike'), e?.response?.data?.message || t('discover.alertActionFailed'));
            }
          }}
        >
          <Ionicons name="heart" size={36} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonSmall}
          onPress={async () => {
            try {
              await favoritesService.add(currentPet.id);
              Alert.alert(t('discover.alertFavorites'), t('discover.alertFavoriteAdded', { name: currentPet.name }));
            } catch (e: any) {
              Alert.alert(t('common.error'), e?.response?.data?.message || t('discover.alertFavoriteFailed'));
            }
          }}
        >
          <Ionicons name="star" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    padding: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  headerToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 999,
    padding: 4,
  },
  toggleItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleItemActive: {
    backgroundColor: '#fff',
    ...shadowStyle({ color: '#000', offsetX: 0, offsetY: 2, blur: 4, opacity: 0.1, elevation: 2 }),
  },
  toggleText: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Bold',
    color: '#888',
  },
  toggleTextActive: {
    color: '#181611',
    fontFamily: 'Ubuntu-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  modeChipActive: {
    backgroundColor: 'rgba(106, 63, 42, 0.12)',
    borderColor: COLORS.primary,
  },
  modeChipText: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Bold',
    color: '#888',
  },
  modeChipTextActive: {
    color: COLORS.primary,
  },
  likerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  likerLabel: {
    fontSize: 11,
    fontFamily: 'Ubuntu-Bold',
    color: COLORS.textMuted,
  },
  likerChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  likerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    maxWidth: 120,
  },
  likerChipActive: {
    backgroundColor: 'rgba(106, 63, 42, 0.12)',
    borderColor: COLORS.primary,
  },
  likerChipText: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Bold',
    color: '#666',
  },
  likerChipTextActive: {
    color: COLORS.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: '#fff',
    ...shadowStyle({ color: '#000', offsetX: 0, offsetY: 10, blur: 20, opacity: 0.1, elevation: 5 }),
    overflow: 'hidden',
  },
  cardImageArea: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  detailFab: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDots: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  photoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  photoDotActive: {
    backgroundColor: '#fff',
    width: 18,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  cardInfoRow: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  petName: {
    fontSize: 24,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
  },
  matchBadge: {
    backgroundColor: 'rgba(106, 63, 42, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  matchText: {
    fontSize: 10,
    fontFamily: 'Ubuntu-Bold',
    color: COLORS.primary,
  },
  breedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc71',
    marginRight: 6,
  },
  breedText: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Medium',
    color: '#666',
  },
  suggestButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  suggestButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
    gap: 14,
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  actionButtonSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyle({ color: COLORS.primary, offsetX: 0, offsetY: 8, blur: 12, opacity: 0.3, elevation: 8 }),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Medium',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: -4,
  },
  refreshBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  refreshBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
  },
});
