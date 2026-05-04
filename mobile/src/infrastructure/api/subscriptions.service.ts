import api from '@/infrastructure/api/api';
import {
  revenueCatHasApiKeyInEnv,
  revenueCatIsNativeSupported,
  revenueCatService,
} from '@/infrastructure/purchases/revenueCat.service';

export interface SubscriptionStatus {
  tier: string;
  isActive: boolean;
  productId: string | null;
  expiresAt: string | null;
  userId: number;
  /** RevenueCat anahtar modu; yalnızca istemci IAP kullandığında dolu */
  keyMode?: 'production' | 'sandbox';
  /** Backend /subscriptions/me (Pati Gold süper beğeni kotası) */
  superlikesRemaining?: number;
  superlikesWeeklyLimit?: number;
}

export const subscriptionsService = {
  async getMySubscription(): Promise<SubscriptionStatus> {
    if (revenueCatIsNativeSupported() && revenueCatHasApiKeyInEnv() && revenueCatService.isConfigured()) {
      const rc = await revenueCatService.getSubscriptionStatus();
      if (rc) {
        return {
          tier: rc.tier,
          isActive: rc.isActive,
          productId: rc.productId,
          expiresAt: rc.expiresAt,
          userId: 0,
          keyMode: rc.keyMode,
        };
      }
    }

    try {
      const { data } = await api.get<SubscriptionStatus>('/subscriptions/me');
      return {
        ...data,
        keyMode: 'production',
        superlikesRemaining: data.superlikesRemaining,
        superlikesWeeklyLimit: data.superlikesWeeklyLimit,
      };
    } catch {
      return {
        tier: 'free',
        isActive: false,
        productId: null,
        expiresAt: null,
        userId: 0,
        keyMode: 'production',
      };
    }
  },
};
