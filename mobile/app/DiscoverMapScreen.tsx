import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { MapView, Marker, Callout } from '@/presentation/components/maps/RNMaps';
import * as Location from 'expo-location';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { GOOGLE_MAP_LIGHT_STYLE } from '@/presentation/styles/googleMapLightStyle';
import { matchesService } from '@/infrastructure/api/matches.service';
import { favoritesService } from '@/infrastructure/api/favorites.service';
import { usePetStore } from '@/application/stores/petStore';
import { PawmatchAdBanner } from '@/presentation/components/PawmatchAdBanner';

type MapPet = {
  id: number;
  name: string;
  breed?: string;
  age?: number;
  photos?: { url: string }[];
  distance?: number | null;
  owner?: {
    locations?: { latitude: number; longitude: number; isCurrent?: boolean }[];
  } | null;
};

function pickCoordinate(p: MapPet): { latitude: number; longitude: number } | null {
  const locs = p.owner?.locations;
  if (!locs?.length) return null;
  const cur = locs.find((l) => l.isCurrent) || locs[0];
  if (cur?.latitude == null || cur?.longitude == null) return null;
  return { latitude: cur.latitude, longitude: cur.longitude };
}

export default function DiscoverMapScreen() {
  const navigation = useNavigation();
  const activeDiscoverFilters = usePetStore((s) => s.activeDiscoverFilters);
  const likerPetId = usePetStore((s) => s.likerPetId);
  const loadMyPetsForLike = usePetStore((s) => s.loadMyPetsForLike);

  React.useEffect(() => {
    void loadMyPetsForLike();
  }, [loadMyPetsForLike]);
  const [region, setRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  });
  const [pets, setPets] = useState<MapPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MapPet | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = region.latitude;
      let lng = region.longitude;
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
      const base = {
        latitude: lat,
        longitude: lng,
        radius: 50,
        limit: 80,
        ...(activeDiscoverFilters || {}),
      };
      const data = await matchesService.discover(base);
      const list = (data?.pets ?? []) as MapPet[];
      const withCoords = list.filter((p) => pickCoordinate(p));
      setPets(withCoords);
      setRegion((r) => ({
        ...r,
        latitude: lat,
        longitude: lng,
      }));
      setSelected((prev) => {
        if (prev && withCoords.some((x) => x.id === prev.id)) return prev;
        return withCoords[0] ?? null;
      });
    } catch (e: any) {
      Alert.alert('Harita', e?.response?.data?.message || 'Yakındaki hayvanlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [activeDiscoverFilters]);

  useEffect(() => {
    void load();
  }, [load]);

  const markers = useMemo(
    () =>
      pets.map((p) => {
        const c = pickCoordinate(p);
        if (!c) return null;
        const uri = p.photos?.[0]?.url;
        return (
          <Marker key={p.id} coordinate={c} onPress={() => setSelected(p)}>
            {uri ? (
              <View style={styles.markerAvatarWrap}>
                <Image source={{ uri }} style={styles.markerAvatar} />
              </View>
            ) : (
              <View style={styles.markerContainer}>
                <Ionicons name="paw" size={22} color={COLORS.primary} />
              </View>
            )}
            <Callout
              tooltip
              onPress={() => (navigation as any).navigate('PetDetail', { id: String(p.id) })}
            >
              <View style={styles.calloutCard}>
                {uri ? (
                  <Image source={{ uri }} style={styles.calloutImage} />
                ) : (
                  <View style={[styles.calloutImage, styles.calloutImagePlaceholder]} />
                )}
                <Text style={styles.calloutName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.calloutSub} numberOfLines={1}>
                  {p.breed || 'Patili dost'} {p.age != null ? `• ${p.age} yaş` : ''}
                </Text>
                <Text style={styles.calloutLink}>Detay için dokun</Text>
              </View>
            </Callout>
          </Marker>
        );
      }),
    [pets, navigation],
  );

  const runLike = async (p: MapPet, superLike?: boolean) => {
    try {
      await matchesService.like(p.id, {
        ...(superLike ? { isSuperLike: true } : {}),
        ...(likerPetId != null ? { likerPetId } : {}),
      });
      Alert.alert(superLike ? 'Süper beğeni' : 'Beğeni', `${p.name} kaydedildi.`);
      void load();
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.message || 'İşlem başarısız.');
    }
  };

  const runDislike = async (p: MapPet) => {
    try {
      await matchesService.dislike(p.id, likerPetId != null ? { dislikerPetId: likerPetId } : {});
      setSelected(null);
      void load();
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.message || 'İşlem başarısız.');
    }
  };

  const runUnmatch = async (p: MapPet) => {
    Alert.alert('Eşleşmeyi kaldır', 'Bu hayvanla eşleşmen kaldırılacak.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Kaldır',
        style: 'destructive',
        onPress: async () => {
          try {
            await matchesService.unmatchByPet(p.id);
            Alert.alert('Tamam', 'Eşleşme kaldırıldı.');
            void load();
          } catch (e: any) {
            Alert.alert('Hata', e?.response?.data?.message || 'Kaldırılamadı.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Main', { screen: 'Discover' })}
          style={{ flex: 1, alignItems: 'center' }}
        >
          <Text style={styles.headerTitle}>Harita</Text>
          <Text style={styles.headerSub}>Listeye geç</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => (navigation as any).navigate('Filter')}
        >
          <Ionicons name="options" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          customMapStyle={GOOGLE_MAP_LIGHT_STYLE}
          showsUserLocation
          showsMyLocationButton
        >
          {markers}
        </MapView>
      )}

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <PawmatchAdBanner variant="compact" />
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetTitle}>Yakındaki hayvanlar</Text>
          <TouchableOpacity onPress={() => void load()}>
            <Ionicons name="refresh" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pets.map((p) => {
            const uri = p.photos?.[0]?.url;
            const active = selected?.id === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.miniCard, active && styles.miniCardActive]}
                onPress={() => setSelected(p)}
              >
                {uri ? (
                  <Image source={{ uri }} style={styles.miniAvatar} />
                ) : (
                  <View style={[styles.miniAvatar, styles.miniAvatarPh]} />
                )}
                <Text style={styles.miniName} numberOfLines={1}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selected ? (
          <View style={styles.detailCard}>
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('PetDetail', { id: String(selected.id) })}
              style={styles.detailRow}
            >
              {selected.photos?.[0]?.url ? (
                <Image source={{ uri: selected.photos[0].url }} style={styles.detailAvatar} />
              ) : (
                <View style={[styles.detailAvatar, styles.miniAvatarPh]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.petName}>{selected.name}</Text>
                <Text style={styles.petDetails}>
                  {selected.breed || 'Patili dost'}
                  {selected.distance != null ? ` • ${selected.distance} km` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.roundBtn} onPress={() => runDislike(selected)}>
                <Ionicons name="close" size={26} color="#888" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundBtn} onPress={() => runLike(selected, true)}>
                <Ionicons name="flash" size={22} color="#f59e0b" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundBtnPrimary} onPress={() => runLike(selected)}>
                <Ionicons name="heart" size={26} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.roundBtn}
                onPress={async () => {
                  try {
                    await favoritesService.add(selected.id);
                    Alert.alert('Favoriler', `${selected.name} kaydedildi.`);
                  } catch (e: any) {
                    Alert.alert('Hata', e?.response?.data?.message || 'Eklenemedi.');
                  }
                }}
              >
                <Ionicons name="star" size={22} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundBtn} onPress={() => runUnmatch(selected)}>
                <Ionicons name="unlink-outline" size={22} color="#b45309" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyHint}>Konumu olan bir profile dokunarak seç.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
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
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  markerAvatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  markerAvatar: { width: '100%', height: '100%' },
  calloutCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  calloutImagePlaceholder: { backgroundColor: '#e8e8e8' },
  calloutName: { fontWeight: '800', fontSize: 16, color: COLORS.text },
  calloutSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  calloutLink: { fontSize: 11, color: COLORS.primary, marginTop: 6, fontWeight: '700' },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
    maxHeight: '42%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e5e5',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  miniCard: {
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    width: 88,
  },
  miniCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(106,63,42,0.06)',
  },
  miniAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 6,
  },
  miniAvatarPh: { backgroundColor: '#e8e8e8' },
  miniName: { fontSize: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  detailCard: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailAvatar: { width: 56, height: 56, borderRadius: 28 },
  petName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 8,
  },
  roundBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  roundBtnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
