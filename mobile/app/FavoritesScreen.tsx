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
import { favoritesService } from '@/infrastructure/api/favorites.service';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await favoritesService.list();
      setPets(list);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Hata', e?.response?.data?.message || 'Favoriler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const remove = async (petId: number) => {
    try {
      await favoritesService.remove(petId);
      setPets((p) => p.filter((x) => x.id !== petId));
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.message || 'Kaldırılamadı.');
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
          <Text style={styles.headerTitle}>Favoriler</Text>
          <Text style={styles.headerSub}>{pets.length} kayıtlı pati</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <FlatList
        data={pets}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={56} color="#e5e5e5" />
            <Text style={styles.emptyText}>Henüz favori yok</Text>
            <Text style={styles.emptyHint}>Keşfet ekranındaki yıldız ile kaydedebilirsin.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => (navigation as any).navigate('PetDetail', { id: String(item.id) })}
            >
              <Image
                source={{
                  uri:
                    item.photos?.[0]?.url ||
                    'https://picsum.photos/400/600?random=' + item.id,
                }}
                style={styles.cardImage}
              />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={() => remove(item.id)}>
              <Ionicons name="close-circle" size={26} color="rgba(255,255,255,0.95)" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitleBlock: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#181611' },
  headerSub: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
  listContent: { padding: 12, paddingBottom: 32 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  cardWrap: { width: '48%', position: 'relative' },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 3 / 4,
    backgroundColor: '#e8e8e8',
  },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cardName: { color: '#fff', fontWeight: '800', fontSize: 15 },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 24 },
  emptyText: { marginTop: 16, fontSize: 17, fontWeight: '700', color: COLORS.text },
  emptyHint: { marginTop: 8, fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
});
