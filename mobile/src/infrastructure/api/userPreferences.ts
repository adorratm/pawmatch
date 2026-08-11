import { userRepository } from '@/infrastructure/repositories/ApiUserRepository';

function mergeNested(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...a };
  for (const key of Object.keys(b)) {
    const inc = b[key];
    const ex = a[key];
    if (
      inc !== null &&
      typeof inc === 'object' &&
      !Array.isArray(inc) &&
      ex !== null &&
      typeof ex === 'object' &&
      !Array.isArray(ex)
    ) {
      out[key] = mergeNested(ex as Record<string, unknown>, inc as Record<string, unknown>);
    } else {
      out[key] = inc;
    }
  }
  return out;
}

export async function mergeAndSavePreferences(
  partial: Record<string, unknown>,
): Promise<void> {
  const me = await userRepository.getCurrentUser();
  if (!me) return;
  const prev = ((me.profile as { preferences?: Record<string, unknown> })?.preferences ??
    {}) as Record<string, unknown>;
  const next = mergeNested(prev, partial);
  const updated = await userRepository.updateProfile({ preferences: next });
  // Lazy import: authStore → patiSubscriptionSync → userPreferences döngüsünü kırar
  const { useAuthStore } = await import('@/application/stores/authStore');
  useAuthStore.getState().setUser(updated);
}
