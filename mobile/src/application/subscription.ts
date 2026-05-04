import type { UserProfile } from '@/domain/entities/User';

/** Profildeki patiSubscription (RevenueCat senkronu) ile Pati Gold aktif mi? */
export function isPatiGoldFromProfile(profile?: UserProfile | null): boolean {
  const prefs = profile?.preferences as Record<string, unknown> | undefined;
  const pati = (prefs?.patiSubscription ?? {}) as {
    tier?: string;
    activeUntil?: string;
  };
  const until = pati.activeUntil ? new Date(pati.activeUntil) : null;
  return (
    pati.tier === 'gold' &&
    until != null &&
    !Number.isNaN(until.getTime()) &&
    until > new Date()
  );
}
