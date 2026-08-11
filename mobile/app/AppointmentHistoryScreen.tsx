import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import api from '@/infrastructure/api/api';

import { shadowStyle } from '@/presentation/styles/shadow';
export default function AppointmentHistoryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.get('/veterinarians/appointments/me');
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      case 'completed':
        return COLORS.textMuted;
      default:
        return COLORS.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t('appointments.statusConfirmed');
      case 'pending':
        return t('appointments.statusPending');
      case 'cancelled':
        return t('appointments.statusCancelled');
      case 'completed':
        return t('appointments.statusCompleted');
      default:
        return status;
    }
  };

  const renderAppointment = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentInfo}>
          <Text style={styles.clinicName}>{item.clinic?.name || t('appointments.clinicFallback')}</Text>
          <View style={styles.appointmentMeta}>
            <Ionicons name="calendar" size={16} color={COLORS.textMuted} />
            <Text style={styles.appointmentDate}>
              {new Date(item.appointmentDate).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      {item.service && (
        <View style={styles.serviceInfo}>
          <Ionicons name="medical" size={16} color={COLORS.primary} />
          <Text style={styles.serviceText}>{item.service.name}</Text>
        </View>
      )}
      {item.pet && (
        <View style={styles.petInfo}>
          <Ionicons name="paw" size={16} color={COLORS.primary} />
          <Text style={styles.petText}>{item.pet.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('appointments.historyTitle')}</Text>
        <View style={styles.spacer} />
      </View>

      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>{t('appointments.historyEmpty')}</Text>
          </View>
        }
      />
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  spacer: {
    width: 24,
  },
  list: {
    padding: 24,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...shadowStyle({ color: '#000', offsetX: 0, offsetY: 2, blur: 8, opacity: 0.1, elevation: 3 }),
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentDate: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    color: COLORS.text,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petText: {
    fontSize: 14,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
  },
});


