import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function InAppPurchasesScreen() {
  const router = useRouter();

  const plans = [
    { id: 1, name: 'Pati Gold Aylık', price: '₺99.99', period: 'ay', features: ['Sınırsız beğeni', 'Kimlerin beğendiğini gör', 'Reklamsız deneyim', 'Öncelikli destek'], popular: false },
    { id: 2, name: 'Pati Gold Yıllık', price: '₺799.99', period: 'yıl', originalPrice: '₺1199.88', features: ['Sınırsız beğeni', 'Kimlerin beğendiğini gör', 'Reklamsız deneyim', 'Öncelikli destek', '2 ay bedava'], popular: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
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
          <Text style={styles.heroSubtitle}>Sınırsız beğeni hakkı kazan ve seni kimlerin beğendiğini anında gör.</Text>
        </View>

        <View style={styles.plansSection}>
          {plans.map((plan) => (
            <TouchableOpacity key={plan.id} style={[styles.planCard, plan.popular && styles.planCardPopular]}>
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>EN POPÜLER</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  {plan.originalPrice && <Text style={styles.originalPrice}>{plan.originalPrice}</Text>}
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.period}>/{plan.period}</Text>
                </View>
              </View>
              <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={[styles.subscribeButton, plan.popular && styles.subscribeButtonPopular]}>
                <Text style={[styles.subscribeButtonText, plan.popular && styles.subscribeButtonTextPopular]}>Abone Ol</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Abonelik otomatik olarak yenilenir. İstediğiniz zaman iptal edebilirsiniz.</Text>
          <TouchableOpacity>
            <Text style={styles.infoLink}>Kullanım Koşulları</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  spacer: { width: 24 },
  content: { flex: 1, padding: 24 },
  heroSection: { alignItems: 'center', marginBottom: 32, paddingVertical: 24 },
  iconContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primary + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  heroSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  plansSection: { gap: 16, marginBottom: 32 },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 2, borderColor: '#e5e5e5', position: 'relative' },
  planCardPopular: { borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  popularBadge: { position: 'absolute', top: -12, left: 24, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  popularText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  planHeader: { marginBottom: 20 },
  planName: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  originalPrice: { fontSize: 14, color: COLORS.textMuted, textDecorationLine: 'line-through', marginRight: 8 },
  price: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
  period: { fontSize: 16, color: COLORS.textMuted, marginLeft: 4 },
  featuresList: { marginBottom: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureText: { fontSize: 14, color: COLORS.text, flex: 1 },
  subscribeButton: { backgroundColor: COLORS.primary, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  subscribeButtonPopular: { backgroundColor: COLORS.primary },
  subscribeButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  subscribeButtonTextPopular: { color: '#fff' },
  infoSection: { alignItems: 'center', paddingVertical: 24 },
  infoText: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginBottom: 8, lineHeight: 18 },
  infoLink: { fontSize: 12, color: COLORS.primary, textDecorationLine: 'underline' },
});


