import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { PurchasesPackage } from 'react-native-purchases';
import Purchases from 'react-native-purchases';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { subscriptionsService } from '@/infrastructure/api/subscriptions.service';
import {
  revenueCatHasApiKeyInEnv,
  revenueCatIsNativeSupported,
  revenueCatService,
} from '@/infrastructure/purchases/revenueCat.service';
import { syncPatiSubscriptionToBackendProfile } from '@/infrastructure/api/patiSubscriptionSync';

const FEATURES = [
  'Sınırsız beğeni',
  'Kimlerin beğendiğini gör',
  'Reklamsız deneyim',
  'Öncelikli destek',
];

function isUserCancelled(e: unknown): boolean {
  const err = e as { code?: string | number; userCancelled?: boolean };
  if (err.userCancelled === true) return true;
  const code = err.code == null ? '' : String(err.code);
  const rc = Purchases.PURCHASES_ERROR_CODE?.PURCHASE_CANCELLED_ERROR;
  if (rc != null && code === String(rc)) return true;
  return code === 'PURCHASE_CANCELLED_ERROR';
}

export default function InAppPurchasesScreen() {
  const navigation = useNavigation();
  const [tierLabel, setTierLabel] = useState<string | null>(null);
  const [keyModeLabel, setKeyModeLabel] = useState<string | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const s = await subscriptionsService.getMySubscription();
      setTierLabel(s.isActive ? (s.tier === 'gold' ? 'Pati Gold' : s.tier) : 'Ücretsiz');
      setKeyModeLabel(s.keyMode ?? null);
    } catch {
      setTierLabel(null);
      setKeyModeLabel(null);
    }
  }, []);

  const loadOfferings = useCallback(async () => {
    if (!revenueCatIsNativeSupported() || !revenueCatHasApiKeyInEnv()) {
      setPackages([]);
      setLoadingOfferings(false);
      return;
    }
    setLoadingOfferings(true);
    try {
      const pkgs = await revenueCatService.getCurrentPackages();
      setPackages(pkgs);
    } catch {
      setPackages([]);
    } finally {
      setLoadingOfferings(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
    void loadOfferings();
  }, [refreshStatus, loadOfferings]);

  const onPurchase = async (pkg: PurchasesPackage) => {
    if (!revenueCatService.isConfigured()) {
      Alert.alert('Kurulum', 'RevenueCat API anahtarlarını .env içinde tanımlayıp uygulamayı yeniden derleyin.');
      return;
    }
    setPurchasingId(pkg.identifier);
    try {
      await revenueCatService.purchasePackage(pkg);
      await refreshStatus();
      await syncPatiSubscriptionToBackendProfile();
      Alert.alert('Teşekkürler', 'Pati Gold aboneliğin aktifleştirildi.');
    } catch (e: unknown) {
      if (isUserCancelled(e)) return;
      const msg = (e as { message?: string })?.message ?? 'Satın alma tamamlanamadı.';
      Alert.alert('Hata', msg);
    } finally {
      setPurchasingId(null);
    }
  };

  const onRestore = async () => {
    if (!revenueCatService.isConfigured()) return;
    setRestoring(true);
    try {
      await revenueCatService.restorePurchases();
      await refreshStatus();
      await syncPatiSubscriptionToBackendProfile();
      Alert.alert('Geri yükleme', 'Satın alımlar senkronize edildi.');
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? 'Geri yükleme başarısız.';
      Alert.alert('Hata', msg);
    } finally {
      setRestoring(false);
    }
  };

  const rcReady =
    revenueCatIsNativeSupported() && revenueCatHasApiKeyInEnv() && revenueCatService.isConfigured();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pati Gold</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="star" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>Pati Gold'a Geç</Text>
          <Text style={styles.heroSubtitle}>
            Sınırsız beğeni hakkı kazan ve seni kimlerin beğendiğini anında gör.
          </Text>
          {tierLabel !== null && (
            <Text style={styles.currentPlanHint}>Mevcut plan: {tierLabel}</Text>
          )}
          {keyModeLabel === 'sandbox' && (
            <View style={styles.sandboxBadge}>
              <Text style={styles.sandboxBadgeText}>
                Mağaza: Sandbox (EXPO_PUBLIC_REVENUECAT_KEY_MODE=sandbox veya geliştirme)
              </Text>
            </View>
          )}
          {keyModeLabel === 'production' && rcReady && (
            <Text style={styles.prodHint}>Mağaza: Production anahtarı</Text>
          )}
          {!revenueCatHasApiKeyInEnv() && revenueCatIsNativeSupported() && (
            <Text style={styles.warningHint}>
              RevenueCat API anahtarı yok — .env içine EXPO_PUBLIC_REVENUECAT_IOS_API_KEY (ve Android için
              ANDROID) ekleyin.
            </Text>
          )}
        </View>

        {loadingOfferings ? (
          <ActivityIndicator style={{ marginVertical: 24 }} color={COLORS.primary} />
        ) : packages.length === 0 ? (
          <View style={styles.emptyOfferings}>
            <Text style={styles.emptyOfferingsText}>
              RevenueCat teklifleri bulunamadı. Dashboard&apos;da Offering (varsayılan) ve ürünleri
              bağladığınızdan emin olun; ardından yeniden derleyin.
            </Text>
          </View>
        ) : (
          <View style={styles.plansSection}>
            {packages.map((pkg) => {
              const product = pkg.product as { priceString?: string; title?: string } | undefined;
              const title = product?.title ?? pkg.identifier;
              const price = product?.priceString ?? '—';
              const isAnnual =
                String(pkg.packageType ?? '').includes('ANNUAL') || pkg.identifier.includes('annual');
              return (
                <View
                  key={pkg.identifier}
                  style={[styles.planCard, isAnnual && styles.planCardPopular]}
                >
                  {isAnnual && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>EN POPÜLER</Text>
                    </View>
                  )}
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{title}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{price}</Text>
                    </View>
                  </View>
                  <View style={styles.featuresList}>
                    {FEATURES.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.subscribeButton, isAnnual && styles.subscribeButtonPopular]}
                    disabled={!!purchasingId || restoring}
                    onPress={() => onPurchase(pkg)}
                  >
                    {purchasingId === pkg.identifier ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text
                        style={[
                          styles.subscribeButtonText,
                          isAnnual && styles.subscribeButtonTextPopular,
                        ]}
                      >
                        Abone Ol
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={onRestore}
          disabled={restoring || !rcReady}
        >
          {restoring ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.restoreText}>Satın alımları geri yükle</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Abonelik otomatik olarak yenilenir. İstediğiniz zaman App Store / Play Store üzerinden iptal
            edebilirsiniz.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  spacer: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  currentPlanHint: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  sandboxBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 10,
  },
  sandboxBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
  },
  prodHint: {
    marginTop: 8,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  warningHint: {
    marginTop: 12,
    fontSize: 12,
    color: '#b45309',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyOfferings: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  emptyOfferingsText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  plansSection: {
    gap: 16,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    position: 'relative',
  },
  planCardPopular: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  planHeader: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  subscribeButtonPopular: {
    backgroundColor: COLORS.primary,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  subscribeButtonTextPopular: {
    color: '#fff',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  restoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
