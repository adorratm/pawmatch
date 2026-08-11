import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/application/stores/authStore';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { confirmDeleteAccount, confirmLogout } from '@/presentation/utils/accountActions';

import { shadowStyle } from '@/presentation/styles/shadow';
export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileCard}
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('EditProfile')}
          >
            <Image
              source={{
                uri:
                  user?.profile?.photoUrl ||
                  'https://i.pravatar.cc/150?img=1',
              }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.editProfileText}>{t('profile.edit')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.sectionMyPets')}</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('MyPets')}
            >
              <Ionicons name="paw-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>{t('profile.sectionMyPets')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('CreatePetProfile')}
            >
              <Ionicons name="add-circle-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>{t('profile.addPet')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.sectionSettings')}</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('NotificationsInbox')}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>{t('inbox.openInbox')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('NotificationPreferences1')}
            >
              <Ionicons name="options-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>{t('inbox.prefsShortcut')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('Settings2')}
            >
              <Ionicons name="lock-closed-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>{t('profile.privacy')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('HelpSupport')}
            >
              <Ionicons name="help-circle-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>{t('profile.help')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('About')}
            >
              <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>{t('profile.about')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('InAppPurchases')}
            >
              <Ionicons name="diamond-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>{t('profile.patiGold')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('Veterinarians')}
            >
              <Ionicons name="medical-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>{t('profile.nearbyVets')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('AppointmentHistory')}
            >
              <Ionicons name="calendar-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>{t('profile.appointmentHistory')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.text} />
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteAccount}>
            <Text style={styles.deleteText}>{t('profile.deleteAccount')}</Text>
          </TouchableOpacity>
          <View style={styles.versionWrap}>
            <View style={styles.versionIcon}>
              <Ionicons name="paw" size={12} color={COLORS.primary} />
            </View>
            <Text style={styles.versionText}>{t('profile.version')}</Text>
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
  headerSpacer: {
    width: 24,
    height: 24,
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
    ...shadowStyle({ color: '#000', offsetX: 0, offsetY: 2, blur: 8, opacity: 0.1, elevation: 3 }),
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
    marginTop: 8,
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
    ...shadowStyle({ color: '#000', offsetX: 0, offsetY: 2, blur: 8, opacity: 0.1, elevation: 3 }),
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
  footerSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 6,
  },
  deleteText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
  versionWrap: {
    marginTop: 2,
    alignItems: 'center',
  },
  versionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6a3f2a1A',
    marginBottom: 6,
  },
  versionText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
});

