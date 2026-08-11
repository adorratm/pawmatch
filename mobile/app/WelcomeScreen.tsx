import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router/react-navigation';
import { COLORS, FONTS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const imageHeight = useMemo(() => {
    const contentWidth = width - 48;
    const byAspect = contentWidth * (5 / 4); // 4:5 portrait
    return Math.min(byAspect, height * 0.38, 340);
  }, [width, height]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="paw" size={22} color="#fff" />
          </View>
          <Text style={styles.logoText}>{t('onboarding.welcomeBrand')}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6pW6vkFkkjdFGLXmUBx3pWzVNAqEAOOXjQJhfnweCHUkNdajc4jgC45f1hsjxsHYaNdme_cPopOu45U7wHNIoqU1sR8IBoip6U4aec5GoA3BAjraVxDvu5diW6urKugwzGXmVLAe2-aMtWmpGDoV20j7xWN3S5eGPsclXSxcjU8usmgOtSmFsgGEvmBp9yad0QWWCRqQT1MnUkaYuVFpIHCP5dLKjoUmpKFr_D9-l5R_plqF6dbkOiEmn-kfHwAsmZr0dWfYgZGvo',
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {t('onboarding.welcomeTitle')}{'\n'}
            <Text style={styles.titleHighlight}>{t('onboarding.welcomeTitleHighlight')}</Text>
          </Text>
          <Text style={styles.description}>
            {t('onboarding.welcomeDescription')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Onboarding1' as never)}
        >
          <Text style={styles.primaryButtonText}>{t('onboarding.ctaStart')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.secondaryButtonText}>
            {t('auth.alreadyHaveAccount')}
          </Text>
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
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  imageContainer: {
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e5e5',
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 340,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    color: COLORS.text,
    marginBottom: 10,
    lineHeight: 32,
  },
  titleHighlight: {
    color: COLORS.primary,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  secondaryButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
});
