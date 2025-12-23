import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [newMatches, setNewMatches] = useState<any[]>([]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await api.get('/matches');
      const allMatches = response.data.matches || [];
      setNewMatches(allMatches.filter((m: any) => {
        const matchDate = new Date(m.matchedAt);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return matchDate > dayAgo;
      }));
      setMatches(allMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const renderNewMatch = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.newMatchItem}
      onPress={() => router.push(`/chat/${item.conversationId}`)}
    >
      <View style={styles.newMatchAvatar}>
        {item.pet.photos?.[0] ? (
          <Image source={{ uri: item.pet.photos[0].url }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="paw" size={24} color={COLORS.primary} />
        )}
        <View style={styles.matchBadge}>
          <Ionicons name="heart" size={12} color="#fff" />
        </View>
      </View>
      <Text style={styles.newMatchName}>{item.pet.name}</Text>
    </TouchableOpacity>
  );

  const renderMatch = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.matchItem}
      onPress={() => router.push(`/chat/${item.conversationId}`)}
    >
      <View style={styles.matchImageContainer}>
        {item.pet.photos?.[0] ? (
          <Image source={{ uri: item.pet.photos[0].url }} style={styles.matchImage} />
        ) : (
          <View style={styles.matchImagePlaceholder}>
            <Ionicons name="paw" size={32} color={COLORS.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.pet.name}</Text>
        <Text style={styles.matchDate}>
          {new Date(item.matchedAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>
      <TouchableOpacity style={styles.chatButton}>
        <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eşleşmelerim</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {newMatches.length > 0 && (
        <View style={styles.newMatchesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yeni Eşleşmeler</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{newMatches.length}</Text>
            </View>
          </View>
          <FlatList
            data={newMatches}
            renderItem={renderNewMatch}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newMatchesList}
          />
        </View>
      )}

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.matchesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Henüz eşleşmeniz yok</Text>
            <Text style={styles.emptySubtext}>Keşfet ekranından hayvan profillerini beğenmeye başla!</Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  newMatchesSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: COLORS.primary + '1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  newMatchesList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  newMatchItem: {
    alignItems: 'center',
    gap: 8,
  },
  newMatchAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  matchBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  newMatchName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  matchesList: {
    padding: 24,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  matchImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#f5f5f5',
  },
  matchImage: {
    width: '100%',
    height: '100%',
  },
  matchImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  matchDate: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 48,
  },
});


