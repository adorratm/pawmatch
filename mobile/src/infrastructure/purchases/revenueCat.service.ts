import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import {
  getRevenueCatApiKeyForPlatform,
  getRevenueCatEntitlementId,
  getRevenueCatKeyMode,
} from '@/infrastructure/purchases/revenueCat.config';

let configured = false;

export function revenueCatHasApiKeyInEnv(): boolean {
  return !!getRevenueCatApiKeyForPlatform();
}

export function revenueCatIsNativeSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export const revenueCatService = {
  isConfigured(): boolean {
    return configured;
  },

  async configure(): Promise<void> {
    if (!revenueCatIsNativeSupported() || configured) {
      return;
    }
    const apiKey = getRevenueCatApiKeyForPlatform();
    if (!apiKey) {
      console.warn('[RevenueCat] EXPO_PUBLIC_REVENUECAT_* API anahtarı yok; IAP devre dışı.');
      return;
    }
    try {
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      Purchases.configure({ apiKey });
      configured = true;
    } catch (e) {
      console.warn('[RevenueCat] configure hatası', e);
    }
  },

  async logInAppUser(userId: string): Promise<void> {
    if (!configured || !revenueCatHasApiKeyInEnv() || !revenueCatIsNativeSupported()) {
      return;
    }
    try {
      await Purchases.logIn(userId);
    } catch (e) {
      console.warn('[RevenueCat] logIn hatası', e);
    }
  },

  async logOutAppUser(): Promise<void> {
    if (!configured || !revenueCatHasApiKeyInEnv() || !revenueCatIsNativeSupported()) {
      return;
    }
    try {
      await Purchases.logOut();
    } catch (e) {
      console.warn('[RevenueCat] logOut hatası', e);
    }
  },

  getEntitlementId(): string {
    return getRevenueCatEntitlementId();
  },

  getKeyMode(): 'production' | 'sandbox' {
    return getRevenueCatKeyMode();
  },

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!configured || !revenueCatHasApiKeyInEnv()) {
      return null;
    }
    try {
      return await Purchases.getCustomerInfo();
    } catch {
      return null;
    }
  },

  isPatiGoldActive(info: CustomerInfo | null): boolean {
    if (!info) return false;
    const id = getRevenueCatEntitlementId();
    return !!info.entitlements.active[id];
  },

  async getSubscriptionStatus(): Promise<{
    tier: string;
    isActive: boolean;
    productId: string | null;
    expiresAt: string | null;
    keyMode: 'production' | 'sandbox';
  } | null> {
    const info = await this.getCustomerInfo();
    if (!info) return null;
    const id = getRevenueCatEntitlementId();
    const ent = info.entitlements.active[id];
    const rawExp = ent?.expirationDate;
    const expiresAt =
      rawExp == null
        ? null
        : typeof rawExp === 'string'
          ? rawExp
          : String(rawExp);
    return {
      tier: ent ? 'gold' : 'free',
      isActive: !!ent,
      productId: ent?.productIdentifier ?? null,
      expiresAt,
      keyMode: getRevenueCatKeyMode(),
    };
  },

  async getCurrentPackages(): Promise<PurchasesPackage[]> {
    if (!configured || !revenueCatHasApiKeyInEnv()) {
      return [];
    }
    const offerings = await Purchases.getOfferings();
    const list = offerings.current?.availablePackages ?? [];
    const rank = (p: PurchasesPackage) => {
      const t = String(p.packageType ?? '');
      if (t === 'MONTHLY' || t.includes('MONTHLY')) return 0;
      if (t === 'ANNUAL' || t.includes('ANNUAL')) return 1;
      return 2;
    };
    return [...list].sort((a, b) => rank(a) - rank(b));
  },

  purchasePackage(pkg: PurchasesPackage) {
    return Purchases.purchasePackage(pkg);
  },

  restorePurchases() {
    return Purchases.restorePurchases();
  },
};
