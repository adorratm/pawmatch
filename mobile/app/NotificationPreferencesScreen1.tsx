import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { userRepository } from '@/infrastructure/repositories/ApiUserRepository';
import { mergeAndSavePreferences } from '@/infrastructure/api/userPreferences';

import { shadowStyle } from '@/presentation/styles/shadow';
export default function NotificationPreferencesScreen1() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [newMatches, setNewMatches] = useState(true);
  const [messages, setMessages] = useState(true);
  const [likes, setLikes] = useState(false);
  const [appointments, setAppointments] = useState(true);
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
        const types = (u.profile?.preferences as { notifications?: { types?: Record<string, boolean> } })
          ?.notifications?.types;
        if (types) {
          setNewMatches(types.newMatches !== false);
          setMessages(types.messages !== false);
          setLikes(types.likes === true);
          setAppointments(types.appointments !== false);
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
        notifications: {
          types: {
            newMatches,
            messages,
            likes,
            appointments,
          },
        },
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [hydrated, newMatches, messages, likes, appointments]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.notifTypesTitle')}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifTypesSection')}</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="heart" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.notifNewMatches')}</Text>
                <Text style={styles.settingSubtitle}>{t('settings.notifNewMatchesHint')}</Text>
              </View>
              <Switch
                value={newMatches}
                onValueChange={setNewMatches}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="chatbubble" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.notifNewMessages')}</Text>
                <Text style={styles.settingSubtitle}>{t('settings.notifNewMessagesHint')}</Text>
              </View>
              <Switch
                value={messages}
                onValueChange={setMessages}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="thumbs-up" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.notifLikes')}</Text>
                <Text style={styles.settingSubtitle}>{t('settings.notifLikesHint')}</Text>
              </View>
              <Switch
                value={likes}
                onValueChange={setLikes}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('settings.notifAppointments')}</Text>
                <Text style={styles.settingSubtitle}>{t('settings.notifAppointmentsHint')}</Text>
              </View>
              <Switch
                value={appointments}
                onValueChange={setAppointments}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
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
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});


