import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils/colors';

export default function AppointmentScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Randevu Detayları</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Randevu Onaylandı!</Text>
          <Text style={styles.successSubtitle}>
            Randevunuz başarıyla oluşturuldu. Aşağıda detayları bulabilirsiniz.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Klinik Bilgileri</Text>
          <View style={styles.clinicCard}>
            <View style={styles.clinicImage} />
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName}>Pati Veteriner Kliniği</Text>
              <Text style={styles.clinicLocation}>Kadıköy, İstanbul</Text>
              <View style={styles.clinicRating}>
                <Text style={styles.ratingText}>⭐ 4.8 (120)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Randevu Özeti</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Tarih</Text>
            <Text style={styles.detailValue}>14 Ekim 2023, Cmt</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🕐 Saat</Text>
            <Text style={styles.detailValue}>14:30</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🐾 Hasta</Text>
            <Text style={styles.detailValue}>Tarçın</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🏥 Hizmet</Text>
            <Text style={styles.detailValue}>Genel Muayene</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konum</Text>
          <View style={styles.mapContainer}>
            <Text style={styles.mapPlaceholder}>🗺️ Map View</Text>
          </View>
          <Text style={styles.address}>
            Caferağa Mah, Neşet Ömer Sk. No:12, 34710 Kadıköy/İstanbul
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>📅 Takvime Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>
              ✏️ Randevuyu Yeniden Planla
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelAction}>
            <Text style={styles.cancelActionText}>Randevuyu İptal Et</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    fontSize: 24,
    color: colors.primary,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    fontSize: 48,
    color: colors.primary,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  clinicCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 12,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  clinicImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  clinicInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  clinicLocation: {
    fontSize: 14,
    color: colors.textMuted,
  },
  clinicRating: {
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  mapContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mapPlaceholder: {
    fontSize: 24,
  },
  address: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryAction: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelAction: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
});


