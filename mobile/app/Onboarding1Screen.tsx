import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';

export default function Onboarding1Screen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.skipText}>Atla</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCexJ6SqWFLIzH03C_WpWXOt6JyoDtiOXRO4eWo8MEGGM0UxXozAgdXyF-IfVg7btrE1GxULDYCvtHPZJOux15lOvWQFJvhk8x-zxhGCwK7H-JolS0ma_rybEkz1LxnHhXASAv6WTEPXY7uTjfZuYs3mUeOnFdAZlgKpp5Bxtky3Z7uTA3QlbmW_wkHbY8TZvY-G3K-swZh-J-rRyR2c5Ir4D3TcvAmNCrLkOA0LZeTExQ1vhLD4YrBQvKgkqOVydrQ0Yjh-1pjEjPy' }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>HOŞ GELDİNİZ</Text>
          </View>
          <Text style={styles.title}>
            En İyi Dostunuz{'\n'}
            <Text style={styles.titleHighlight}>Sizi Bekliyor</Text>
          </Text>
          <Text style={styles.description}>
            Sahiplenmek veya oyun arkadaşı bulmak için sağa kaydırın. Evcil hayvanlar için en güvenilir topluluğa katılın.
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
          <Text style={styles.nextButtonText}>İleri</Text>
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
    borderRadius: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
    color: '#8a7a6a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
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
    marginBottom: 16,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Ubuntu-Bold',
    textAlign: 'center',
    color: '#333333',
    marginBottom: 16,
    lineHeight: 38,
  },
  titleHighlight: {
    color: COLORS.primary,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Medium',
    color: '#8a7a6a',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Ubuntu-Bold',
  },
});


