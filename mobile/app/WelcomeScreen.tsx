import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="paw" size={24} color="#fff" />
          </View>
          <Text style={styles.logoText}>PawMatch</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6pW6vkFkkjdFGLXmUBx3pWzVNAqEAOOXjQJhfnweCHUkNdajc4jgC45f1hsjxsHYaNdme_cPopOu45U7wHNIoqU1sR8IBoip6U4aec5GoA3BAjraVxDvu5diW6urKugwzGXmVLAe2-aMtWmpGDoV20j7xWN3S5eGPsclXSxcjU8usmgOtSmFsgGEvmBp9yad0QWWCRqQT1MnUkaYuVFpIHCP5dLKjoUmpKFr_D9-l5R_plqF6dbkOiEmn-kfHwAsmZr0dWfYgZGvo' }}
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
            Mükemmel Eşleşmeni{'\n'}
            <Text style={styles.titleHighlight}>Keşfet</Text>
          </Text>
          <Text style={styles.description}>
            İster yeni bir en iyi arkadaş sahiplen, ister köpeğin için bir oyun arkadaşı bul. Sevgi dolu patiler burada.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Onboarding1' as never)}
        >
          <Text style={styles.primaryButtonText}>Hadi Başlayalım</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.secondaryButtonText}>Zaten hesabın var mı? Giriş yap</Text>
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
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontFamily: 'Ubuntu-Bold',
    color: COLORS.primary,
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
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
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
    marginBottom: 24,
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
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Ubuntu-Bold',
    textAlign: 'center',
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 32,
  },
  titleHighlight: {
    color: COLORS.primary,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Medium',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
  },
});

