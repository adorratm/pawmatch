import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router/react-navigation';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/presentation/components/forms/Input';
import { supportService } from '@/infrastructure/api/support.service';

function notify(title: string, message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function HelpSupportScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqItems = useMemo(
    () => [
      { id: 1, question: t('help.faq1Q'), answer: t('help.faq1A') },
      { id: 2, question: t('help.faq2Q'), answer: t('help.faq2A') },
      { id: 3, question: t('help.faq3Q'), answer: t('help.faq3A') },
    ],
    [t],
  );

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return faqItems;
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
    );
  }, [searchQuery, faqItems]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('help.title')}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <Input
            size="search"
            leftIcon="search"
            placeholder={t('help.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.faqSection')}</Text>
          {filteredFaqs.map((item) => {
            const open = expandedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.faqItem}
                onPress={() => setExpandedId(open ? null : item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </View>
                {open ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
              </TouchableOpacity>
            );
          })}
          {filteredFaqs.length === 0 ? (
            <Text style={styles.emptyText}>{t('help.faqEmpty')}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.contactSection')}</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL('mailto:destek@pawmatch.com.tr')}
            >
              <Ionicons name="mail" size={24} color={COLORS.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>{t('help.emailLabel')}</Text>
                <Text style={styles.contactValue}>{t('legal.email')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactItem, styles.contactItemLast]}
              onPress={() => Linking.openURL('tel:+905551234567')}
            >
              <Ionicons name="call" size={24} color={COLORS.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>{t('help.phoneLabel')}</Text>
                <Text style={styles.contactValue}>{t('help.phoneValue')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.sendMessageSection')}</Text>
          <Input
            placeholder={t('help.messagePlaceholder')}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            containerStyle={styles.messageInputContainer}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!message.trim() || sending) && styles.sendButtonDisabled]}
            disabled={!message.trim() || sending}
            onPress={async () => {
              setSending(true);
              try {
                await supportService.createTicket(message.trim(), t('help.ticketSubject'));
                notify(t('help.sentTitle'), t('help.sentMsg'));
                setMessage('');
              } catch (e: any) {
                notify(t('common.error'), e?.response?.data?.message || t('help.sendFailed'));
              } finally {
                setSending(false);
              }
            }}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>{t('common.send')}</Text>
            )}
          </TouchableOpacity>
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
  searchSection: {
    marginBottom: 24,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  messageInputContainer: {
    marginBottom: 16,
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
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  faqAnswer: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMuted,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactItemLast: {
    marginBottom: 0,
  },
  contactInfo: {
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.55,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
