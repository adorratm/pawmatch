import { Platform } from 'react-native';

export type RevenueCatKeyMode = 'production' | 'sandbox';

function resolveKeyMode(): RevenueCatKeyMode {
  const raw = process.env.EXPO_PUBLIC_REVENUECAT_KEY_MODE?.toLowerCase();
  if (raw === 'sandbox' || raw === 'production') {
    return raw;
  }
  return __DEV__ ? 'sandbox' : 'production';
}

export function getRevenueCatKeyMode(): RevenueCatKeyMode {
  return resolveKeyMode();
}

export function getRevenueCatIosApiKey(): string | undefined {
  const key = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim();
  const sandboxKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY_SANDBOX?.trim();
  if (resolveKeyMode() === 'sandbox') {
    return sandboxKey || key;
  }
  return key;
}

export function getRevenueCatAndroidApiKey(): string | undefined {
  const key = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim();
  const sandboxKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY_SANDBOX?.trim();
  if (resolveKeyMode() === 'sandbox') {
    return sandboxKey || key;
  }
  return key;
}

export function getRevenueCatApiKeyForPlatform(): string | undefined {
  if (Platform.OS === 'android') {
    return getRevenueCatAndroidApiKey();
  }
  if (Platform.OS === 'ios') {
    return getRevenueCatIosApiKey();
  }
  return undefined;
}

export function getRevenueCatEntitlementId(): string {
  return process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() || 'pati_gold';
}
