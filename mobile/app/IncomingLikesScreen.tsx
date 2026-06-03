import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { matchesService } from '@/infrastructure/api/matches.service';
import { PawmatchAdBanner } from '@/presentation/components/PawmatchAdBanner';

type IncomingItem = {
  id: number;
  createdAt: string;
  visible: boolean;
  isSuperLike?: boolean;
  myPet: { id: number; name: string; photos?: { url: string }[] };
  likerPet: {
    id: number;
    hidden?: boolean;
    name?: string;
    breed?: string;
    photos?: { url: string }[];
    owner?: { firstName?: string; lastName?: string };
  };
};

export default function IncomingLikesScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState<IncomingItem[]>([]);
  const [meta, setMeta] = useState<{
    isGold: boolean;
    visibleSlots: number;
    total: number;
    weeksElapsedCalendarUtc?: number;
    anchorWeekMondayUtc?: string;
    currentWeekMondayUtc?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await matchesService.getIncomingLikes();
      setItems(data.items ?? []);
      setMeta({
        isGold: data.isGold,
        visibleSlots: data.visibleSlots ?? 0,
        total: data.total ?? 0,
        weeksElapsedCalendarUtc: data.weeksElapsedCalendarUtc,
        anchorWeekMondayUtc: data.anchorWeekMondayUtc,
        currentWeekMondayUtc: data.currentWeekMondayUtc,
      });
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.message || 'Liste yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: '#fff' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#181611" />
        </TouchableOpacity>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Seni beğenenler</Text>
          <Text style={styles.headerSub}>
            {meta?.total ?? 0} beğeni
            {!meta?.isGold && meta != null
              ? ` · ${meta.visibleSlots} profil açık (Pazartesi UTC haftasına göre +1 / hafta)`
              : ''}
          </Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <PawmatchAdBanner variant="card" />

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-dislike-outline" size={56} color="#e5e5e5" />
            <Text style={styles.emptyText}>Henüz beğeni yok</Text>
            <Text style={styles.emptyHint}>Hayvan profillerin beğenildiğinde burada listelenir.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const hidden = !item.visible;
          const uri = !hidden ? item.likerPet.photos?.[0]?.url : undefined;
          return (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.85}
              disabled={hidden}
              onPress={() => {
                if (hidden) return;
                (navigation as any).navigate('PetDetail', { id: String(item.likerPet.id) });
              }}
            >
              {uri ? (
                <Image source={{ uri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPh]}>
                  <Ionicons name="eye-off" size={28} color="#bbb" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {hidden ? 'Kilitli profil' : item.likerPet.name}
                </Text>
                <Text style={styles.sub} numberOfLines={2}>
                  {hidden
                    ? 'Pati Gold veya her Pazartesi (UTC) yeni bir profil açılır.'
                    : `${item.likerPet.breed || 'Patili dost'} · senin: ${item.myPet.name}`}
                </Text>
                {item.isSuperLike && !hidden ? (
                  <View style={styles.superRow}>
                    <Ionicons name="flash" size={12} color="#f59e0b" />
                    <Text style={styles.superText}>Süper beğeni</Text>
                  </View>
                ) : null}
              </View>
              {!hidden ? (
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              ) : (
                <Ionicons name="lock-closed" size={20} color="#ccc" />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitleBlock: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#181611' },
  headerSub: { fontSize: 11, fontWeight: '600', color: COLORS.primary, marginTop: 2, textAlign: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fafafa',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 12,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e8e8e8' },
  avatarPh: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '800', color: '#181611' },
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  superRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  superText: { fontSize: 11, fontWeight: '700', color: '#b45309' },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyText: { marginTop: 12, fontSize: 17, fontWeight: '700', color: COLORS.text },
  emptyHint: { marginTop: 8, fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
});
