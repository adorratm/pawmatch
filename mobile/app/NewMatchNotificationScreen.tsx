import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from "expo-router/react-navigation";
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';

import { shadowStyle } from '@/presentation/styles/shadow';
export default function NewMatchNotificationScreen() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { match } = route.params as any;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart" size={48} color="#fff" />
          </View>
        </View>

        <Text style={styles.title}>{t('matches.newMatchTitle')}</Text>
        <Text style={styles.subtitle}>
          {t('matches.newMatchSubtitle', { name: match?.pet?.name || t('matches.newMatchFallbackName') })}
        </Text>

        {match?.pet?.photos?.[0] && (
          <View style={styles.petImageContainer}>
            <Image source={{ uri: match.pet.photos[0].url }} style={styles.petImage} />
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => (navigation as any).navigate('Chat', { id: match.conversationId.toString() })}
          >
            <Ionicons name="chatbubble" size={20} color="#171515ff" />
            <Text style={styles.chatButtonText}>{t('matches.startChat')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueButtonText}>{t('matches.keepSwiping')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyle({ color: COLORS.primary, offsetX: 0, offsetY: 8, blur: 16, opacity: 0.3, elevation: 10 }),
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  petImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadowStyle({ color: COLORS.primary, offsetX: 0, offsetY: 4, blur: 8, opacity: 0.3, elevation: 5 }),
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  continueButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});


