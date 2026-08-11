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
import { useNavigation } from 'expo-router/react-navigation';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { matchesService } from '@/infrastructure/api/matches.service';
import { PawmatchAdBanner } from '@/presentation/components/PawmatchAdBanner';
import { useTranslation } from 'react-i18next';

type IncomingItem = {
  id: number;
  createdAt: string;
  visible: boolean;
  isSuperLike?: boolean;
  isAdoption?: boolean;
  myPet: { id: number; name: string; photos?: { url: string }[]; purpose?: string | null };
  likerPet: {
    id: number;
    hidden?: boolean;
    name?: string;
    breed?: string;
    photos?: { url: string }[];
    owner?: { firstName?: string; lastName?: string };
  } | null;
  likerUser?: {
    id: number;
    hidden?: boolean;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
  } | null;
};

export default function IncomingLikesScreen() {
  const { t } = useTranslation();
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
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

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
      Alert.alert(t('common.error'), e?.response?.data?.message || t('discover.incomingLoadFailed'));
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

  const acceptLike = async (item: IncomingItem) => {
    if (!item.visible) return;
    setAcceptingId(item.id);
    try {
      const res = await matchesService.acceptIncomingLike(item.id);
      if (res?.conversationId) {
        Alert.alert(t('discover.incomingMatchTitle'), t('discover.incomingMatchOpeningChat'), [
          {
            text: t('discover.incomingGoToChat'),
            onPress: () =>
              (navigation as any).navigate('Chat', { id: String(res.conversationId) }),
          },
        ]);
      } else {
        Alert.alert(t('common.ok'), t('discover.incomingAccepted'));
      }
      await load();
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.response?.data?.message || t('discover.incomingAcceptFailed'));
    } finally {
      setAcceptingId(null);
    }
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
          <Text style={styles.headerTitle}>{t('discover.incomingTitle')}</Text>
          <Text style={styles.headerSub}>
            {t('discover.incomingCount', { total: meta?.total ?? 0 })}
            {!meta?.isGold && meta != null
              ? t('discover.incomingSlotsHint', { visibleSlots: meta.visibleSlots })
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
            <Text style={styles.emptyText}>{t('discover.incomingEmpty')}</Text>
            <Text style={styles.emptyHint}>{t('discover.incomingEmptyHint')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const hidden = !item.visible;
          const isAdoption = !!item.isAdoption;
          const myPetUri = item.myPet.photos?.[0]?.url;
          const likerName = isAdoption
            ? [item.likerUser?.firstName, item.likerUser?.lastName].filter(Boolean).join(' ') ||
              t('discover.incomingInterestedUser')
            : item.likerPet?.name || t('discover.incomingPetFallback');
          const subtitle = hidden
            ? t('discover.incomingLockedHint')
            : isAdoption
              ? t('discover.incomingAdoptionInterest', { user: likerName })
              : t('discover.incomingPlaymateInterest', { likerPet: likerName });

          return (
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.rowMain}
                activeOpacity={0.85}
                disabled={hidden}
                onPress={() => {
                  if (hidden) return;
                  if (!isAdoption && item.likerPet?.id) {
                    (navigation as any).navigate('PetDetail', { id: String(item.likerPet.id) });
                    return;
                  }
                  (navigation as any).navigate('PetDetail', { id: String(item.myPet.id) });
                }}
              >
                {myPetUri && !hidden ? (
                  <Image source={{ uri: myPetUri }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPh]}>
                    <Ionicons
                      name={hidden ? 'eye-off' : 'paw'}
                      size={28}
                      color="#bbb"
                    />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {hidden
                      ? t('discover.incomingLocked')
                      : t('discover.incomingForPet', { name: item.myPet.name })}
                  </Text>
                  <Text style={styles.sub} numberOfLines={2}>
                    {subtitle}
                  </Text>
                  <View style={styles.tagRow}>
                    {!hidden ? (
                      <View
                        style={[
                          styles.purposeTag,
                          isAdoption ? styles.adoptionTag : styles.playmateTag,
                        ]}
                      >
                        <Text
                          style={[
                            styles.purposeTagText,
                            isAdoption ? styles.adoptionTagText : styles.playmateTagText,
                          ]}
                        >
                          {isAdoption
                            ? t('discover.incomingAdoptionTag')
                            : t('discover.incomingPlaymateTag')}
                        </Text>
                      </View>
                    ) : null}
                    {item.isSuperLike && !hidden ? (
                      <View style={styles.superRow}>
                        <Ionicons name="flash" size={12} color="#f59e0b" />
                        <Text style={styles.superText}>{t('discover.incomingSuperLike')}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
              {!hidden ? (
                <TouchableOpacity
                  style={styles.acceptBtn}
                  disabled={acceptingId === item.id}
                  onPress={() => void acceptLike(item)}
                >
                  {acceptingId === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.acceptBtnText}>{t('common.accept')}</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <Ionicons name="lock-closed" size={20} color="#ccc" />
              )}
            </View>
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
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
    textAlign: 'center',
  },
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
    gap: 10,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e8e8e8' },
  avatarPh: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '800', color: '#181611' },
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  tagRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  purposeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  playmateTag: { backgroundColor: 'rgba(106, 63, 42, 0.12)' },
  adoptionTag: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  purposeTagText: { fontSize: 10, fontWeight: '700' },
  playmateTagText: { color: COLORS.primary },
  adoptionTagText: { color: '#047857' },
  superRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  superText: { fontSize: 11, fontWeight: '700', color: '#b45309' },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 64,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyText: { marginTop: 12, fontSize: 17, fontWeight: '700', color: COLORS.text },
  emptyHint: { marginTop: 8, fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
});
