import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router/react-navigation';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { userRepository } from '@/infrastructure/repositories/ApiUserRepository';
import { mergeAndSavePreferences } from '@/infrastructure/api/userPreferences';
import { confirmDeleteAccount } from '@/presentation/utils/accountActions';

import { shadowStyle } from '@/presentation/styles/shadow';
export default function SettingsScreen2() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showAge, setShowAge] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await userRepository.getCurrentUser();
        const p = (u?.profile?.preferences || {}) as {
          showAge?: boolean;
          showDistance?: boolean;
          allowMessagesFromAnyone?: boolean;
        };
        if (cancelled) return;
        if (typeof p.showAge === 'boolean') setShowAge(p.showAge);
        if (typeof p.showDistance === 'boolean') setShowDistance(p.showDistance);
        if (typeof p.allowMessagesFromAnyone === 'boolean') {
          setAllowMessages(p.allowMessagesFromAnyone);
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
        showAge,
        showDistance,
        allowMessagesFromAnyone: allowMessages,
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [hydrated, showAge, showDistance, allowMessages]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.privacyTitle')}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.visibilitySection')}</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.showAge')}</Text>
                <Text style={styles.settingSubtitle}>{t('settings.showAgeHint')}</Text>
              </View>
              <Switch
                value={showAge}
                onValueChange={setShowAge}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.showDistance')}</Text>
                <Text style={styles.settingSubtitle}>{t('settings.showDistanceHint')}</Text>
              </View>
              <Switch
                value={showDistance}
                onValueChange={setShowDistance}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.messagingSection')}</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.allowAnyoneMessage')}</Text>
                <Text style={styles.settingSubtitle}>{t('settings.allowAnyoneMessageHint')}</Text>
              </View>
              <Switch
                value={allowMessages}
                onValueChange={setAllowMessages}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sectionAccount')}</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem} onPress={confirmDeleteAccount}>
              <Ionicons name="trash" size={24} color="#ef4444" />
              <Text style={[styles.settingTitle, styles.dangerText]}>{t('settings.deleteAccount')}</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  spacer: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    marginTop: 8,
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
  dangerText: {
    color: '#ef4444',
  },
});
