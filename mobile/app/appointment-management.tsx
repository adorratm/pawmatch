import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../src/constants/config';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';

export default function AppointmentManagementScreen() {
  const router = useRouter();
  const { clinicId } = useLocalSearchParams<{ clinicId: string }>();
  const [clinic, setClinic] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (clinicId) {
      loadClinic();
    }
  }, [clinicId]);

  const loadClinic = async () => {
    try {
      const response = await api.get(`/veterinarians/${clinicId}`);
      setClinic(response.data);
    } catch (error) {
      console.error('Error loading clinic:', error);
    }
  };

  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const handleBookAppointment = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clinicId) return;

    try {
      const appointmentDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      await api.post('/veterinarians/appointments', {
        clinicId: parseInt(clinicId),
        serviceId: selectedService.id,
        appointmentDate: appointmentDate.toISOString(),
        notes,
      });

      router.back();
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Randevu Al</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {clinic && (
          <>
            <Text style={styles.clinicName}>{clinic.name}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hizmet Seç</Text>
              {clinic.services?.map((service: any) => (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceCard, selectedService?.id === service.id && styles.serviceCardSelected]}
                  onPress={() => setSelectedService(service)}
                >
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                    <Text style={styles.serviceDuration}>{service.duration} dakika</Text>
                  </View>
                  <Text style={styles.servicePrice}>{service.price} ₺</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tarih Seç</Text>
              <TouchableOpacity style={styles.dateButton}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.dateButtonText}>
                  {selectedDate ? selectedDate.toLocaleDateString('tr-TR') : 'Tarih seç'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saat Seç</Text>
              <View style={styles.timeGrid}>
                {availableTimes.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeButton, selectedTime === time && styles.timeButtonSelected]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notlar (Opsiyonel)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Randevu ile ilgili notlarınız..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, (!selectedService || !selectedDate || !selectedTime) && styles.bookButtonDisabled]}
          onPress={handleBookAppointment}
          disabled={!selectedService || !selectedDate || !selectedTime}
        >
          <Text style={styles.bookButtonText}>Randevu Al</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  spacer: { width: 24 },
  content: { flex: 1, padding: 24 },
  clinicName: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  serviceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#e5e5e5' },
  serviceCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '0A' },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  serviceDescription: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  serviceDuration: { fontSize: 12, color: COLORS.textMuted },
  servicePrice: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e5e5' },
  dateButtonText: { fontSize: 16, color: COLORS.text },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5' },
  timeButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  timeTextSelected: { color: '#fff' },
  notesInput: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e5e5', fontSize: 14, color: COLORS.text, minHeight: 100, textAlignVertical: 'top' },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  bookButton: { backgroundColor: COLORS.primary, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  bookButtonDisabled: { backgroundColor: '#e5e5e5', shadowOpacity: 0 },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});


