import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from 'expo-router/react-navigation';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';

export default function LegalDocumentScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const docKey = ((route.params as { doc?: string } | undefined)?.doc || 'terms') as
    | 'terms'
    | 'privacy';
  const doc =
    docKey === 'privacy'
      ? { title: t('legal.privacyTitle'), body: t('legal.privacyBody') }
      : { title: t('legal.termsTitle'), body: t('legal.termsBody') };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{doc.title}</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.body}>{doc.body}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center' },
  spacer: { width: 24 },
  content: { flex: 1, padding: 24 },
  body: { fontSize: 14, lineHeight: 22, color: COLORS.textMuted },
});
