import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router/react-navigation';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('legal.aboutTitle')}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="paw" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>{t('legal.appName')}</Text>
          <Text style={styles.appVersion}>{t('legal.version')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionText}>
            {t('legal.aboutBlurb')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('legal.contactSection')}</Text>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => Linking.openURL('mailto:destek@pawmatch.com.tr')}
          >
            <Ionicons name="mail" size={20} color={COLORS.primary} />
            <Text style={styles.linkText}>{t('legal.email')}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => Linking.openURL('https://www.pawmatch.com.tr')}
          >
            <Ionicons name="globe" size={20} color={COLORS.primary} />
            <Text style={styles.linkText}>{t('legal.website')}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('legal.legalSection')}</Text>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => (navigation as any).navigate('LegalDocument', { doc: 'terms' })}
          >
            <Text style={[styles.linkText, styles.linkTextNoIcon]}>{t('legal.termsTitle')}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => (navigation as any).navigate('LegalDocument', { doc: 'privacy' })}
          >
            <Text style={[styles.linkText, styles.linkTextNoIcon]}>{t('legal.privacyTitle')}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('legal.copyright')}</Text>
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 32,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  linkTextNoIcon: {
    marginLeft: 0,
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
