import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { usePetStore } from '@/application/stores/petStore';
import { useAuthStore } from '@/application/stores/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { pets, currentIndex, loading, loadPets, likePet, dislikePet } = usePetStore();

  useEffect(() => {
    loadPets();
  }, []);

  const currentPet = pets[currentIndex];

  if (loading && pets.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!currentPet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="pets" size={64} color="#eee" />
          <Text style={styles.emptyText}>Daha fazla hayvan yok</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => loadPets()}>
            <Text style={styles.refreshBtnText}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Image
            source={{ uri: user?.profile?.photoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG3B8xe_3c4vII4DM0h6bfLId7eOc8O3pVJtHKhJXQpNP05XDFgW4FI8XycNBFd0MeKsZUzfHjpDWF6RONaYYJCUvxC0k54YFJliAYlAfR0f7VZGmEaZsdUFS9uFTjuPygy9LAEBjBatQ0Twnsr4nZwGcm8SeOgMMgroiLDvR7UoItHV_-7nCqPD7tIkw8_Cing7Ed-B_ZnydmhSKwgDZEgaeDBS3iZTJVAzBZBJLQVJ1b-7NBSzD1Sw8AQUn6f3RzkJ3jC4nMPBt8' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <View style={styles.headerToggle}>
          <TouchableOpacity style={[styles.toggleItem, styles.toggleItemActive]}>
            <Text style={[styles.toggleText, styles.toggleTextActive]}>Keşfet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleItem}
            onPress={() => router.push('/(tabs)/map')}
          >
            <Ionicons name="map-outline" size={14} color="#888" style={{ marginRight: 4 }} />
            <Text style={styles.toggleText}>Harita</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
        >
          <Ionicons name="options-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.cardContainer}
          onPress={() => router.push(`/pet/${currentPet.id}`)}
        >
          <Image
            source={{ uri: currentPet.photos?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6JqyeFfKbzIV96d7Ss8Z8VIbXK_ip3_tgj65pp7VYE2Y51FBPgWJ7GO_67BusF0qB8PRHHPK2om8_D7FJt8_AgzuYQX5oiEwYaSKsy_eIoDazBt5KIy9iKhxGIRXFU9DiL4Ql-7Iy-qeAzoJm18tZsNFTP72l8duZlbVwVBNSyx_UcrKs54Ow6lIO6LVRb9_AFpT_AU2FXoYm5QhKhzYzfDdSRyXaP-Jxqj5Nt0DYG8lNbEXf-9ksglCDsYHvZpI7QH5092r7MQdB' }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardOverlay}>
            <View style={styles.cardInfoRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.petName}>{currentPet.name}, {currentPet.age}</Text>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>Pati Score 98%</Text>
                  </View>
                </View>
                <View style={styles.breedRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.breedText}>
                    {currentPet.breed} • {currentPet.distance || '2.4'}km uzakta
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.suggestButton}
              onPress={() => router.push(`/pet/${currentPet.id}`)}
            >
              <Ionicons name="information-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.suggestButtonText}>Detayları Görüntüle</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButtonSmall}
          onPress={() => dislikePet(currentPet.id)}
        >
          <Ionicons name="close" size={32} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonLarge}
          onPress={() => likePet(currentPet.id)}
        >
          <Ionicons name="heart" size={36} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonSmall}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#888',
  },
  toggleTextActive: {
    color: '#181611',
    fontFamily: 'PlusJakartaSans-ExtraBold',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
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
    fontFamily: 'PlusJakartaSans-ExtraBold',
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
    fontFamily: 'PlusJakartaSans-Bold',
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
    fontFamily: 'PlusJakartaSans-Medium',
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
    fontFamily: 'PlusJakartaSans-Bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
    gap: 20,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#181611',
    textAlign: 'center',
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
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
