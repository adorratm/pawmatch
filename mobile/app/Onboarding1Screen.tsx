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

export default function Onboarding1Screen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const imageHeight = useMemo(() => {
    const contentWidth = width - 48;
    const byAspect = contentWidth * (5 / 4);
    return Math.min(byAspect, height * 0.36, 320);
  }, [width, height]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCexJ6SqWFLIzH03C_WpWXOt6JyoDtiOXRO4eWo8MEGGM0UxXozAgdXyF-IfVg7btrE1GxULDYCvtHPZJOux15lOvWQFJvhk8x-zxhGCwK7H-JolS0ma_rybEkz1LxnHhXASAv6WTEPXY7uTjfZuYs3mUeOnFdAZlgKpp5Bxtky3Z7uTA3QlbmW_wkHbY8TZvY-G3K-swZh-J-rRyR2c5Ir4D3TcvAmNCrLkOA0LZeTExQ1vhLD4YrBQvKgkqOVydrQ0Yjh-1pjEjPy',
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('onboarding.badgeWelcome')}</Text>
          </View>
          <Text style={styles.title}>
            {t('onboarding.ob1Title')}{'\n'}
            <Text style={styles.titleHighlight}>{t('onboarding.ob1TitleHighlight')}</Text>
          </Text>
          <Text style={styles.description}>
            {t('onboarding.ob1Description')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('Onboarding2' as never)}
        >
          <Text style={styles.nextButtonText}>{t('common.next')}</Text>
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
    paddingTop: 4,
    paddingBottom: 4,
  },
  spacer: {
    flex: 1,
  },
  skipButton: {
    padding: 8,
    borderRadius: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#8a7a6a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  imageContainer: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  badge: {
    backgroundColor: 'rgba(106, 63, 42, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 12,
    lineHeight: 36,
  },
  titleHighlight: {
    color: COLORS.primary,
  },
  description: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: '#8a7a6a',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
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
  nextButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: FONTS.bold,
  },
});
