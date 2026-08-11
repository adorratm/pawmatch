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
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/presentation/components/forms/Input';
import { supportService } from '@/infrastructure/api/support.service';

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'Nasıl eşleşme yapabilirim?',
    answer: 'Keşfet ekranından hayvan profillerini beğenerek eşleşme yapabilirsiniz.',
  },
  {
    id: 2,
    question: 'Mesaj göndermek için ne yapmalıyım?',
    answer: 'Eşleştiğiniz kullanıcılarla otomatik olarak sohbet başlatabilirsiniz.',
  },
  {
    id: 3,
    question: 'Profilimi nasıl düzenlerim?',
    answer: 'Profil ekranından “Profili Düzenle”ye dokunarak ad, soyad ve bio güncelleyebilirsiniz.',
  },
];

function notify(title: string, message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım & Destek</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <Input
            size="search"
            leftIcon="search"
            placeholder="Sorunuzu arayın..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
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
            <Text style={styles.emptyText}>Aramanızla eşleşen soru bulunamadı.</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bize Ulaşın</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL('mailto:destek@pawmatch.com.tr')}
            >
              <Ionicons name="mail" size={24} color={COLORS.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>E-posta</Text>
                <Text style={styles.contactValue}>destek@pawmatch.com.tr</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactItem, styles.contactItemLast]}
              onPress={() => Linking.openURL('tel:+905551234567')}
            >
              <Ionicons name="call" size={24} color={COLORS.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Telefon</Text>
                <Text style={styles.contactValue}>+90 555 123 4567</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mesaj Gönder</Text>
          <Input
            placeholder="Sorunuzu veya önerinizi yazın..."
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
                await supportService.createTicket(message.trim(), 'Yardım talebi');
                notify('Gönderildi', 'Mesajın destek ekibimize iletildi.');
                setMessage('');
              } catch (e: any) {
                notify('Hata', e?.response?.data?.message || 'Gönderilemedi.');
              } finally {
                setSending(false);
              }
            }}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Gönder</Text>
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
