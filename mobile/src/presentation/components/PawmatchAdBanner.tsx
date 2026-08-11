import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { isPatiGoldFromProfile } from '@/application/subscription';
import { useAuthStore } from '@/application/stores/authStore';
import { useTranslation } from 'react-i18next';

type Props = {
  /** Gold iken tamamen gizlenir */
  variant?: 'compact' | 'card';
};

/**
 * Reklam SDK entegrasyonu öncesi placeholder. Pati Gold kullanıcılarında gösterilmez.
 * İleride AdMob vb. buraya bağlanır.
 */
export function PawmatchAdBanner({ variant = 'compact' }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  if (isPatiGoldFromProfile(user?.profile ?? null)) {
    return null;
  }

  if (variant === 'card') {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('settings.adSponsorTitle')}</Text>
        <Text style={styles.cardSub}>
          {t('settings.adSponsorSub')}
        </Text>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => (navigation as any).navigate('InAppPurchases')}
        >
          <Text style={styles.ctaText}>{t('purchases.tierGold')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.compact}>
      <Text style={styles.compactText}>{t('settings.adLabel')}</Text>
      <TouchableOpacity onPress={() => (navigation as any).navigate('InAppPurchases')}>
        <Text style={styles.compactLink}>{t('settings.adRemove')}</Text>
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
