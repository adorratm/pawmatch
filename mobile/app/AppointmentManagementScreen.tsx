import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation, useRoute } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import api from '@/infrastructure/api/api';
import { petsService } from '@/infrastructure/api/pets.service';

export default function AppointmentManagementScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const expoClinic = useLocalSearchParams<{ clinicId: string }>().clinicId;
  const navClinic = (route.params as { clinicId?: string } | undefined)?.clinicId;
  const clinicId = navClinic ?? expoClinic;
  const [clinic, setClinic] = useState<any>(null);
  const [myPets, setMyPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  });
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (clinicId) {
      loadClinic();
    }
  }, [clinicId]);

  useEffect(() => {
    (async () => {
      try {
        const pets = await petsService.getMyPets();
        const list = Array.isArray(pets) ? pets : [];
        setMyPets(list);
        if (list.length === 1) setSelectedPetId(list[0].id);
      } catch {
        setMyPets([]);
      }
    })();
  }, []);

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
    if (!clinicId || !selectedPetId || !selectedService || !selectedDate || !selectedTime) {
      if (!selectedPetId) {
        Alert.alert('Pet gerekli', 'Randevu için önce bir pet profilin olmalı. Pet ekle ekranından oluşturabilirsin.');
      }
      return;
    }

    try {
      const appointmentDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      await api.post('/veterinarians/appointments', {
        clinicId: Number(clinicId),
        petId: selectedPetId,
        serviceId: selectedService.id,
        appointmentDate: appointmentDate.toISOString(),
        notes: notes || undefined,
      });

      Alert.alert('Randevu', 'Randevun kaydedildi.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      Alert.alert('Hata', error?.response?.data?.message || 'Randevu oluşturulamadı.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
              <Text style={styles.sectionTitle}>Hangi pet için?</Text>
              {myPets.length === 0 ? (
                <Text style={styles.hintText}>
                  Kayıtlı pet yok. Önce pet profili oluşturmalısın.
                </Text>
              ) : (
                myPets.map((p: any) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.serviceCard,
                      selectedPetId === p.id && styles.serviceCardSelected,
                    ]}
                    onPress={() => setSelectedPetId(p.id)}
                  >
                    <Text style={styles.serviceName}>{p.name}</Text>
                    <Text style={styles.serviceDescription}>{p.breed || p.species}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hizmet Seç</Text>
              {clinic.services?.map((service: any) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selectedService?.id === service.id && styles.serviceCardSelected,
                  ]}
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
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  const d = selectedDate ? new Date(selectedDate) : new Date();
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d);
                }}
              >
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.dateButtonText}>
                  {selectedDate
                    ? selectedDate.toLocaleDateString('tr-TR')
                    : 'Tarih seç'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saat Seç</Text>
              <View style={styles.timeGrid}>
                {availableTimes.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      selectedTime === time && styles.timeButtonSelected,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        selectedTime === time && styles.timeTextSelected,
                      ]}
                    >
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
          style={[
            styles.bookButton,
            (!selectedPetId || !selectedService || !selectedDate || !selectedTime) &&
              styles.bookButtonDisabled,
          ]}
          onPress={handleBookAppointment}
          disabled={!selectedPetId || !selectedService || !selectedDate || !selectedTime}
        >
          <Text style={styles.bookButtonText}>Randevu Al</Text>
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
  clinicName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 24,
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
  hintText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  serviceCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '0A',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  timeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeTextSelected: {
    color: '#fff',
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    fontSize: 14,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonDisabled: {
    backgroundColor: '#e5e5e5',
    shadowOpacity: 0,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});


