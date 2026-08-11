import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useChatStore } from '@/application/stores/chatStore';

export default function MatchesScreen() {
  const navigation = useNavigation();
  const { matches, loading, loadMatches } = useChatStore();

  useEffect(() => {
    loadMatches();
  }, []);

  const renderNewMatchItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.newMatchItem}
      onPress={() =>
        (navigation as any).navigate('Chat', { id: String(item.conversationId) })
      }
    >
      <View style={styles.newMatchAvatarContainer}>
        <Image
          source={{ uri: item.pet?.photos?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW86wITKJon6TqoJ0dnp91Cc9hWBXQL9desz4-TDbQEiLPFmpriKZgtIfs6yjbnCxjssEyP1rbSPlyurnqPmm5z0JfCf_913ms6raLSoDTAE0I9N6jalLYDqc3WbX7IRd4lRiFADXXuHJELEhqFKMJCBkfFxea1IUKngOsfMoowiW2M-KFUwD05HnwcCB7Oq0SdOMLgnxjQiF3HAug0od10FHRgVvmz2WoifuGSlBunWywQ91cO-iy1u_zCxQ9QrkvJVYO4pWvmJaG' }}
          style={styles.newMatchAvatar}
        />
        <View style={styles.onlineDot} />
      </View>
      <Text style={styles.newMatchName} numberOfLines={1}>{item.pet?.name}</Text>
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.convItem}
      onPress={() =>
        (navigation as any).navigate('Chat', { id: String(item.conversationId) })
      }
    >
      <View style={styles.convAvatarContainer}>
        <Image
          source={{ uri: item.pet?.photos?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2D_PVyFYzt0SE3GeaI1rhxTAP4lE3qb6rL1Nql7dPkcnQ-s8cLag6HKP9vpyInKesW5XxxgS5j7p6gfPjt1MuzL5TD20C9-z5QcJ42DbzGCSuqXISGwt3GMWGk6Xv1yAv36bVC2rqs9PEbTMqVR55vQ5Au2ioiR7GvawPjo2wq0EEChtIhCMWB7vUh-fiQ6x-y0nxBMXGYv5NrOoMGHE_oyBm8cVFGE4aDVFn-jyzvGAL8ESUO24Vi4H4itTdQiecdiVLKJoHeaQ1' }}
          style={styles.convAvatar}
        />
      </View>

      <View style={styles.convInfo}>
        <View style={styles.convNameRow}>
          <Text style={styles.convName}>{item.pet?.name}</Text>
          <Text style={styles.convTime}>
            {new Date(item.matchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={styles.waitingMsgRow}>
          <MaterialCommunityIcons name="chat-processing-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.waitingMsgText}>Mesaj Bekliyor</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.canGoBack() && navigation.goBack()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#181611" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eşleşmelerim</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => (navigation as any).navigate('IncomingLikes')}
          >
            <Ionicons name="people-outline" size={22} color="#181611" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => (navigation as any).navigate('Filter')}
          >
            <Ionicons name="options-outline" size={24} color="#181611" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yeni Eşleşmeler</Text>
            <View style={styles.newCountBadge}>
              <Text style={styles.newCountText}>{matches.length} Yeni</Text>
            </View>
          </View>
          <FlatList
            data={matches}
            renderItem={renderNewMatchItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        <View style={styles.convSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sohbetler</Text>
          </View>

          <FlatList
            data={matches}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.convList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="heart-plus-outline" size={64} color="#eee" />
                <Text style={styles.emptyText}>Henüz sohbet yok</Text>
                <Text style={styles.emptySub}>Keşfet ekranından yeni eşleşmeler bulabilirsin!</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
  },
  section: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
  },
  newCountBadge: {
    backgroundColor: 'rgba(106, 63, 42, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  newCountText: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Bold',
    color: COLORS.primary,
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  newMatchItem: {
    alignItems: 'center',
    width: 72,
    gap: 8,
  },
  newMatchAvatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 2,
    position: 'relative',
  },
  newMatchAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  newMatchName: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
    textAlign: 'center',
  },
  convSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
  },
  convList: {
    paddingHorizontal: 0,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  convAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    position: 'relative',
    marginRight: 16,
  },
  convAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
  },
  convInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  convNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convName: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
  },
  convTime: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Medium',
    color: '#aaa',
  },
  waitingMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waitingMsgText: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
    color: COLORS.primary,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
    color: '#181611',
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Medium',
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
