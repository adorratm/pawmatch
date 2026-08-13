export type PatiSubscriptionPrefs = {
  tier?: string;
  activeUntil?: string;
  usageWeekKey?: string;
  superlikesUsedInWeek?: number;
  productId?: string | null;
  syncedAt?: string;
};

export const GOLD_SUPER_LIKE_WEEKLY = 3;

/** O anın tarihinin ait olduğu haftanın Pazartesi günü 00:00 UTC (Date). */
export function mondayUtcDate(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay() || 7;
  if (day !== 1) x.setUTCDate(x.getUTCDate() - (day - 1));
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export function mondayUtcWeekKey(d = new Date()): string {
  return mondayUtcDate(d).toISOString().slice(0, 10);
}

/**
 * Kayıt haftasının Pazartesi (UTC) ile şu anki haftanın Pazartesi (UTC) arasında
 * kaç tam takvim haftası geçti (0 = hâlâ kayıt haftası veya ondan önceki aynı Pazartesi).
 */
export function calendarUtcWeeksElapsedSinceSignup(signupAt: Date, now = new Date()): number {
  const start = mondayUtcDate(signupAt).getTime();
  const end = mondayUtcDate(now).getTime();
  return Math.floor((end - start) / (7 * 24 * 60 * 60 * 1000));
}

export function resolveGoldFromPreferences(
  preferences: Record<string, unknown> | null | undefined,
): boolean {
  const pati = (preferences?.patiSubscription ?? {}) as PatiSubscriptionPrefs;
  const activeUntil = pati.activeUntil ? new Date(pati.activeUntil) : null;
  return (
    pati.tier === 'gold' &&
    activeUntil != null &&
    !Number.isNaN(activeUntil.getTime()) &&
    activeUntil > new Date()
  );
}
