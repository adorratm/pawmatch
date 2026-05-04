import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/presentation/styles/config';
import { isPatiGoldFromProfile } from '@/application/subscription';
import { useAuthStore } from '@/application/stores/authStore';

type Props = {
  /** Gold iken tamamen gizlenir */
  variant?: 'compact' | 'card';
};

/**
 * Reklam SDK entegrasyonu öncesi placeholder. Pati Gold kullanıcılarında gösterilmez.
 * İleride AdMob vb. buraya bağlanır.
 */
export function PawmatchAdBanner({ variant = 'compact' }: Props) {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  if (isPatiGoldFromProfile(user?.profile ?? null)) {
    return null;
  }

  if (variant === 'card') {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sponsor alanı</Text>
        <Text style={styles.cardSub}>
          Pati Gold ile reklamsız deneyim ve öne çıkan profiller.
        </Text>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => (navigation as any).navigate('InAppPurchases')}
        >
          <Text style={styles.ctaText}>Pati Gold</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.compact}>
      <Text style={styles.compactText}>Reklam</Text>
      <TouchableOpacity onPress={() => (navigation as any).navigate('InAppPurchases')}>
        <Text style={styles.compactLink}>Kaldır</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f3f0ee',
    borderWidth: 1,
    borderColor: '#e8e0dc',
  },
  compactText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  compactLink: { fontSize: 12, color: COLORS.primary, fontWeight: '800' },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#faf7f5',
    borderWidth: 1,
    borderColor: '#ebe5e1',
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  cardSub: { marginTop: 6, fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  cta: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
