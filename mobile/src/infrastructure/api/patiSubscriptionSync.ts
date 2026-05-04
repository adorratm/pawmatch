import { mergeAndSavePreferences } from '@/infrastructure/api/userPreferences';
import {
  revenueCatHasApiKeyInEnv,
  revenueCatService,
} from '@/infrastructure/purchases/revenueCat.service';

/**
 * RevenueCat durumunu kullanıcı profilindeki preferences.patiSubscription ile senkronize eder;
 * backend süper beğeni kotası ve Pati Gold öne çıkarma için bu alanı okur.
 */
export async function syncPatiSubscriptionToBackendProfile(): Promise<void> {
  if (!revenueCatHasApiKeyInEnv() || !revenueCatService.isConfigured()) {
    return;
  }
  const rc = await revenueCatService.getSubscriptionStatus();
  if (!rc) return;

  const activeUntil =
    rc.isActive && rc.expiresAt ? rc.expiresAt : new Date(0).toISOString();

  await mergeAndSavePreferences({
    patiSubscription: {
      tier: rc.isActive ? 'gold' : 'free',
      activeUntil,
      productId: rc.productId,
      syncedAt: new Date().toISOString(),
    },
  });
}
