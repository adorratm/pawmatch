import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from 'expo-router/react-navigation';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';

const DOCS: Record<string, { title: string; body: string }> = {
  terms: {
    title: 'Kullanım Koşulları',
    body: `Son güncelleme: 2026

1. Kabul
PawMatch uygulamasını kullanarak bu koşulları kabul etmiş olursunuz.

2. Hizmet
PawMatch, hayvan sahipleri arasında eşleşme ve iletişim sağlayan bir platformdur. Kullanıcılar kendi içeriklerinden sorumludur.

3. Hesap
Doğru bilgi vermek, hesabınızı güvende tutmak ve yasalara uygun davranmak sizin sorumluluğunuzdadır. 18 yaşından küçüklerin ebeveyn onayı olmadan kullanması önerilmez.

4. Yasaklı davranışlar
Taciz, spam, sahte profil, yasa dışı içerik ve başkalarının haklarını ihlal eden paylaşımlar yasaktır. İhlalde hesap askıya alınabilir veya silinebilir.

5. Sorumluluk reddi
Platform "olduğu gibi" sunulur. Eşleşme sonuçları veya kullanıcı davranışlarından PawMatch sorumlu tutulamaz.

6. Değişiklikler
Koşullar güncellenebilir. Uygulamayı kullanmaya devam etmeniz güncel koşulları kabul ettiğiniz anlamına gelir.

Sorularınız için: destek@pawmatch.com.tr`,
  },
  privacy: {
    title: 'Gizlilik Politikası',
    body: `Son güncelleme: 2026

1. Topladığımız veriler
Hesap bilgileri (ad, e-posta), profil ve konum tercihleri, mesajlaşma ve kullanım verileri, cihaz bildirim token'ları.

2. Kullanım amacı
Hizmeti sağlamak, eşleşme ve güvenlik, destek taleplerini yanıtlamak, yasal yükümlülükleri yerine getirmek.

3. Paylaşım
Verileriniz, yasal zorunluluk veya hizmet sağlayıcıları (barındırma, bildirim) dışında üçüncü taraflara satılmaz.

4. Saklama
Hesabınız aktifken veriler saklanır. Hesap silindiğinde kişisel veriler anonimleştirilir veya silinir.

5. Haklarınız
Profilinizi güncelleyebilir, hesabınızı silebilir, destek üzerinden veri talebinde bulunabilirsiniz.

6. İletişim
Gizlilik soruları: destek@pawmatch.com.tr`,
  },
};

export default function LegalDocumentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const docKey = ((route.params as { doc?: string } | undefined)?.doc || 'terms') as
    | 'terms'
    | 'privacy';
  const doc = DOCS[docKey] || DOCS.terms;

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
