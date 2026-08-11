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
import { useNavigation, useFocusEffect } from 'expo-router/react-navigation';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { petsService } from '@/infrastructure/api/pets.service';
import { useTranslation, type TFunction } from 'react-i18next';

type PetPurpose = 'playmate' | 'adoption' | null;

type MyPet = {
  id: number;
  name: string;
  breed?: string;
  age?: number;
  purpose?: PetPurpose;
  isAdopted?: boolean;
  photos?: { url: string; isMain?: boolean; isPrimary?: boolean }[];
};

function purposeLabel(t: TFunction, purpose?: PetPurpose) {
  if (purpose === 'playmate') return t('discover.modePlaymate');
  if (purpose === 'adoption') return t('pets.purposeAdoptionLabel');
  return t('pets.purposePassive');
}

export default function MyPetsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [pets, setPets] = useState<MyPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await petsService.getMyPets();
      setPets(Array.isArray(list) ? list : []);
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.response?.data?.message || t('pets.loadFailed'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const setPurpose = async (pet: MyPet, purpose: 'playmate' | 'adoption') => {
    if (pet.isAdopted) return;
    try {
      await petsService.updatePet(pet.id, { purpose });
      await load();
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.response?.data?.message || t('pets.purposeUpdateFailed'));
    }
  };

  const markAdopted = async (pet: MyPet) => {
    if (pet.isAdopted) return;
    Alert.alert(
      t('pets.markAdoptedTitle'),
      t('pets.markAdoptedMsg', { name: pet.name }),
      [
        { text: t('common.dismiss'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await petsService.updatePet(pet.id, { isAdopted: true });
              await load();
            } catch (e: any) {
              Alert.alert(t('common.error'), e?.response?.data?.message || t('pets.updateFailed'));
            }
          },
        },
      ],
    );
  };

  const openPetActions = (pet: MyPet) => {
    if (pet.isAdopted) {
      Alert.alert(t('pets.lockedTitle'), t('pets.lockedMsg'));
      return;
    }
    Alert.alert(pet.name, t('pets.actionsPrompt'), [
      {
        text: t('pets.actionListPlaymate'),
        onPress: () => void setPurpose(pet, 'playmate'),
      },
      {
        text: t('pets.actionListAdoption'),
        onPress: () => void setPurpose(pet, 'adoption'),
      },
      {
        text: t('pets.actionMarkAdopted'),
        style: 'destructive',
        onPress: () => void markAdopted(pet),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
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
          <Text style={styles.headerTitle}>{t('pets.myPetsTitle')}</Text>
          <Text style={styles.headerSub}>{t('pets.myPetsCount', { count: pets.length })}</Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (navigation as any).navigate('CreatePetProfile')}
        >
          <Ionicons name="add" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pets}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="paw-outline" size={56} color="#e5e5e5" />
            <Text style={styles.emptyText}>{t('pets.myPetsEmpty')}</Text>
            <Text style={styles.emptyHint}>
              {t('pets.myPetsEmptyHint')}
            </Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => (navigation as any).navigate('CreatePetProfile')}
            >
              <Text style={styles.addBtnText}>{t('discover.addPet')}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const locked = !!item.isAdopted;
          const uri = item.photos?.[0]?.url;
          return (
            <TouchableOpacity
              style={[styles.row, locked && styles.rowLocked]}
              activeOpacity={0.85}
              onPress={() => openPetActions(item)}
            >
              {uri ? (
                <Image source={{ uri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPh]}>
                  <Ionicons name="paw" size={24} color="#bbb" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {locked ? (
                    <Ionicons name="lock-closed" size={14} color="#999" />
                  ) : null}
                </View>
                <Text style={styles.sub} numberOfLines={1}>
                  {[item.breed, item.age != null ? t('common.ageYears', { age: item.age }) : null]
                    .filter(Boolean)
                    .join(' · ') || t('pets.noDetails')}
                </Text>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.badge,
                      item.purpose === 'adoption' && styles.badgeAdoption,
                      !item.purpose && !locked && styles.badgePassive,
                      locked && styles.badgeLocked,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {locked ? t('pets.adoptedBadge') : purposeLabel(t, item.purpose ?? null)}
                    </Text>
                  </View>
                </View>
              </View>
              {!locked ? (
                <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textMuted} />
              ) : null}
            </TouchableOpacity>
          );
        }}
      />

      {pets.length > 0 ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => (navigation as any).navigate('CreatePetProfile')}
          >
            <Ionicons name="add" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>{t('discover.addPet')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  headerSub: { fontSize: 11, fontWeight: '600', color: COLORS.primary, marginTop: 2 },
  list: { padding: 16, paddingBottom: 100 },
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
  rowLocked: { opacity: 0.72 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e8e8e8' },
  avatarPh: { alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '800', color: '#181611', flexShrink: 1 },
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  badgeRow: { flexDirection: 'row', marginTop: 8 },
  badge: {
    backgroundColor: 'rgba(106, 63, 42, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeAdoption: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  badgePassive: { backgroundColor: '#eee' },
  badgeLocked: { backgroundColor: '#e8e8e8' },
  badgeText: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyText: { marginTop: 12, fontSize: 17, fontWeight: '700', color: COLORS.text },
  emptyHint: { marginTop: 8, fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addBtn: {
    marginTop: 20,
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
