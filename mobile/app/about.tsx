import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uygulama Hakkında</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="paw" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>PawMatch</Text>
          <Text style={styles.appVersion}>Versiyon 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionText}>
            PawMatch, hayvan sahiplenmek isteyen ve hayvanını sahiplendirmek isteyen kullanıcıları buluşturan bir platformdur.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim</Text>
          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="mail" size={20} color={COLORS.primary} />
            <Text style={styles.linkText}>destek@pawmatch.com</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="globe" size={20} color={COLORS.primary} />
            <Text style={styles.linkText}>www.pawmatch.com</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yasal</Text>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Kullanım Koşulları</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Gizlilik Politikası</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 PawMatch. Tüm hakları saklıdır.</Text>
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
  logoSection: { alignItems: 'center', marginBottom: 32, paddingVertical: 32 },
  logoContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primary + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  appName: { fontSize: 28, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  appVersion: { fontSize: 14, color: COLORS.textMuted },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  sectionText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
  linkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  linkText: { flex: 1, fontSize: 16, color: COLORS.text, marginLeft: 12 },
  footer: { paddingVertical: 32, alignItems: 'center' },
  footerText: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
});

