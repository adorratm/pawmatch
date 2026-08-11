import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/infrastructure/api/api';

const STORAGE_KEY = 'pawmatch_expo_push_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function configurePushNotificationBehavior(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Varsayılan',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

function resolveEasProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  const fromExtra = extra?.eas?.projectId;
  const fromEasConfig = (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig
    ?.projectId;
  const fromEnv = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  return fromExtra || fromEasConfig || fromEnv || undefined;
}

export async function getExpoPushTokenOrNull(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const asked = await Notifications.requestPermissionsAsync();
    finalStatus = asked.status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = resolveEasProjectId();
  const tokenResponse = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  return tokenResponse.data ?? null;
}

/**
 * Expo push token alır ve backend'e kaydeder. Oturum açıkken çağrılmalıdır.
 */
export async function registerPushTokenWithBackend(): Promise<void> {
  try {
    await configurePushNotificationBehavior();
    const token = await getExpoPushTokenOrNull();
    if (!token) return;

    const prev = await AsyncStorage.getItem(STORAGE_KEY);
    if (prev && prev !== token) {
      try {
        await api.delete('/notifications/push-token', { data: { token: prev } });
      } catch {
        /* önceki token temizlenemezse devam */
      }
    }

    await api.post('/notifications/push-token', {
      token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });
    await AsyncStorage.setItem(STORAGE_KEY, token);
  } catch (e) {
    console.warn('[push] registerPushTokenWithBackend', e);
  }
}

export async function unregisterPushTokenFromBackend(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEY);
    if (!token) return;
    try {
      await api.delete('/notifications/push-token', { data: { token } });
    } catch {
      /* ignore */
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[push] unregisterPushTokenFromBackend', e);
  }
}
