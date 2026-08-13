import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { isPatiGoldFromProfile } from '@/application/subscription';
import { useAuthStore } from '@/application/stores/authStore';
import { useTranslation } from 'react-i18next';
import { adsService, type AdCreative } from '@/infrastructure/api/ads.service';

type Props = {
  /** Gold iken tamamen gizlenir */
  variant?: 'compact' | 'card';
  placement?: string;
};

/**
 * Panelden yönetilen reklam creatives; yoksa i18n placeholder.
 * Pati Gold kullanıcılarında gösterilmez.
 */
export function PawmatchAdBanner({ variant = 'compact', placement = 'discover' }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const [creative, setCreative] = useState<AdCreative | null>(null);

  useEffect(() => {
    let cancelled = false;
    adsService.getActive(placement).then((list) => {
      if (!cancelled && list[0]) setCreative(list[0]);
    });
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (isPatiGoldFromProfile(user?.profile ?? null)) {
    return null;
  }

  const goIap = () => (navigation as any).navigate('InAppPurchases');
  const onCta = () => {
    if (creative?.ctaUrl?.startsWith('http')) {
      Linking.openURL(creative.ctaUrl).catch(() => goIap());
      return;
    }
    goIap();
  };

  const title = creative?.title || t('settings.adSponsorTitle');
  const body = creative?.body || t('settings.adSponsorSub');
  const cta = creative?.ctaLabel || t('purchases.tierGold');

  if (variant === 'card') {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{body}</Text>
        <TouchableOpacity style={styles.cta} onPress={onCta}>
          <Text style={styles.ctaText}>{cta}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.compact}>
      <Text style={styles.compactText} numberOfLines={1}>
        {creative?.title || t('settings.adLabel')}
      </Text>
      <TouchableOpacity onPress={onCta}>
        <Text style={styles.compactLink}>
          {creative?.ctaLabel || t('settings.adRemove')}
        </Text>
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
  compactText: { flex: 1, marginRight: 8, fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
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
