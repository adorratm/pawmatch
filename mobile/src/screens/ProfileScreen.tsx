import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { COLORS } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { logout, user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=1' }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Settings1' as never)}>
              <Text style={styles.editProfileText}>Profili Düzenle</Text>
            </TouchableOpacity>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('NotificationPreferences1' as never)}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Bildirimler</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Settings2' as never)}
            >
              <Ionicons name="lock-closed-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Gizlilik</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('HelpSupport' as never)}
            >
              <Ionicons name="help-circle-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Yardım & Destek</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('About' as never)}
            >
              <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Hakkında</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  editProfileText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  settingsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
});

