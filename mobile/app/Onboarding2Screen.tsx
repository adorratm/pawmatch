import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { shadowStyle } from '@/presentation/styles/shadow';
export default function Onboarding2Screen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.cardsContainer}>
          {/* Background Cards */}
          <View style={[styles.card, styles.cardBack1]} />
          <View style={[styles.card, styles.cardBack2]} />

          {/* Main Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardImageContainer}>
              <ImageBackground
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4QOE2yIVDrh-4QjqEVOlcxUKUMYlifIgiShHnzHRbmNYtSwX6FhvY6e2zJmiebkdFc8HiziyhvkFSyvrPw4YQqKN6sJu4qdGx5QgRna-wC1QIzYROXEUKPlqZPbcA9_z3my8HyyTdwCBViRe-137TN6lL1i9xqTTEoqUxRmpefQDnSLsTXPyr9MPo1K8rW0EkWeK-eXTUlepdt-L10-HyGHdF3nZF-PF5pVYrYM5DtTiXnjU0hkwbZ6qOK_Ty8U9lKY4i3dwYQuVN' }}
                style={styles.image}
                resizeMode="cover"
              >
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{t('onboarding.demoBadgeDog')}</Text>
                </View>
                <View style={styles.imageOverlay} />
              </ImageBackground>
            </View>
            <View style={styles.cardDetails}>
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.petName}>{t('onboarding.demoPetName')}</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={16} color={COLORS.primary} />
                  <Text style={styles.locationText}>{t('onboarding.demoLocation')}</Text>
                </View>
              </View>
              <View style={styles.heartIcon}>
                <Ionicons name="heart" size={28} color="#ef4444" />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('onboarding.ob2Title')}</Text>
          <Text style={styles.description}>
            {t('onboarding.ob2Description')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.nextButtonText}>{t('common.continueAction')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  spacer: {
    flex: 1,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardsContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    maxHeight: 420,
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '85%',
    height: '90%',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  cardBack1: {
    transform: [{ rotate: '-8deg' }, { translateY: 24 }],
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
  cardBack2: {
    transform: [{ rotate: '4deg' }, { translateY: 12 }],
    backgroundColor: '#ffffff',
    zIndex: 2,
    ...shadowStyle({ color: '#000', offsetX: 0, offsetY: 2, blur: 4, opacity: 0.05 }),
  },
  mainCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    zIndex: 3,
    overflow: 'hidden',
    ...shadowStyle({ color: COLORS.primary, offsetX: 0, offsetY: 20, blur: 40, opacity: 0.15, elevation: 10 }),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardImageContainer: {
    height: '72%',
    width: '100%',
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Ubuntu-Bold',
  },
  cardDetails: {
    flex: 1,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  petName: {
    fontSize: 22,
    fontFamily: 'Ubuntu-Bold',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Medium',
    color: '#6b7280',
  },
  heartIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyle({ color: COLORS.primary, offsetX: 0, offsetY: 8, blur: 16, opacity: 0.15, elevation: 5 }),
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Ubuntu-Bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Medium',
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(106, 63, 42, 0.2)',
  },
  dotActive: {
    width: 40,
    backgroundColor: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadowStyle({ color: COLORS.primary, offsetX: 0, offsetY: 4, blur: 8, opacity: 0.3, elevation: 5 }),
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
  },
});


