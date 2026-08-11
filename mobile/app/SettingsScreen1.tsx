import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/application/stores/authStore';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { userRepository } from '@/infrastructure/repositories/ApiUserRepository';
import { mergeAndSavePreferences } from '@/infrastructure/api/userPreferences';

import { shadowStyle } from '@/presentation/styles/shadow';
const PLACEHOLDER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCG3B8xe_3c4vII4DM0h6bfLId7eOc8O3pVJtHKhJXQpNP05XDFgW4FI8XycNBFd0MeKsZUzfHjpDWF6RONaYYJCUvxC0k54YFJliAYlAfR0f7VZGmEaZsdUFS9uFTjuPygy9LAEBjBatQ0Twnsr4nZwGcm8SeOgMMgroiLDvR7UoItHV_-7nCqPD7tIkw8_Cing7Ed-B_ZnydmhSKwgDZEgaeDBS3iZTJVAzBZBJLQVJ1b-7NBSzD1Sw8AQUn6f3RzkJ3jC4nMPBt8';

export default function SettingsScreen1() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await userRepository.getCurrentUser();
        if (!u || cancelled) {
          setHydrated(true);
          return;
        }
        const p = u.profile?.preferences as {
          notificationsMaster?: boolean;
          discoveryLocationEnabled?: boolean;
        };
        if (p) {
          if (typeof p.notificationsMaster === 'boolean') {
            setNotificationsEnabled(p.notificationsMaster);
          }
          if (typeof p.discoveryLocationEnabled === 'boolean') {
            setLocationEnabled(p.discoveryLocationEnabled);
          }
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      mergeAndSavePreferences({
        notificationsMaster: notificationsEnabled,
        discoveryLocationEnabled: locationEnabled,
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [hydrated, notificationsEnabled, locationEnabled]);

  const avatarUri = user?.profile?.photoUrl || PLACEHOLDER_AVATAR;
  const displayName = user?.fullName || t('profile.fallbackDisplayName');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.doneText}>{t('common.done')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => navigation.navigate('EditProfile' as never)}
          >
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: avatarUri }} style={styles.profileImage} />
              <View style={styles.editBadge}>
                <Ionicons name="create" size={12} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileSubtext}>{t('settings.editProfile')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.premiumSection}>
          <View style={styles.premiumCard}>
            <View style={styles.premiumIcon}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>{t('settings.premiumTitle')}</Text>
              <Text style={styles.premiumSubtitle}>
                {t('settings.premiumSubtitle')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => navigation.navigate('InAppPurchases' as never)}
            >
              <Text style={styles.premiumButtonText}>{t('settings.premiumCta')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sectionDiscovery')}</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="location" size={24} color={COLORS.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.location')}</Text>
                <Text style={styles.settingSubtitle}>{t('settings.locationSample')}</Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Filter' as never)}
            >
              <Ionicons name="options" size={24} color={COLORS.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.filters')}</Text>
                <Text style={styles.settingSubtitle}>
                  {t('settings.filtersSubtitle')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sectionNotifications')}</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('NotificationsInbox')}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('inbox.openInbox')}</Text>
                <Text style={styles.settingSubtitle}>{t('inbox.emptyHint')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <View style={styles.settingItem}>
              <Ionicons name="notifications" size={24} color={COLORS.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.notifications')}</Text>
                <Text style={styles.settingSubtitle}>{t('settings.notificationsSubtitle')}</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => (navigation as any).navigate('NotificationPreferences1')}
            >
              <Ionicons name="settings" size={24} color={COLORS.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.notificationPrefs')}</Text>
                <Text style={styles.settingSubtitle}>{t('settings.notificationPrefsSubtitle')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sectionAccount')}</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('EditProfile' as never)}
            >
              <Ionicons name="person" size={24} color={COLORS.text} />
              <Text style={styles.settingTitle}>{t('settings.profileSettings')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Settings2' as never)}
            >
              <Ionicons name="lock-closed" size={24} color={COLORS.text} />
              <Text style={styles.settingTitle}>{t('settings.privacy')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('About' as never)}
            >
              <Ionicons name="shield-checkmark" size={24} color={COLORS.text} />
              <Text style={styles.settingTitle}>{t('settings.securityLegal')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sectionOther')}</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('HelpSupport' as never)}
            >
              <Ionicons name="help-circle" size={24} color={COLORS.text} />
              <Text style={styles.settingTitle}>{t('settings.helpSupport')}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('About' as never)}
            >
              <Ionicons name="information-circle" size={24} color={COLORS.text} />
              <Text style={styles.settingTitle}>{t('settings.aboutApp')}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  spacer: {
    width: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 24,
    paddingBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...shadowStyle({ color: '#000', offsetX: 0, offsetY: 2, blur: 8, opacity: 0.1, elevation: 3 }),
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
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
  profileSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  premiumSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  premiumCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
    ...shadowStyle({ color: '#000', offsetX: 0, offsetY: 2, blur: 8, opacity: 0.1, elevation: 3 }),
  },
  premiumIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  premiumInfo: {
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  premiumButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  settingsList: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
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
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginLeft: 12,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});

