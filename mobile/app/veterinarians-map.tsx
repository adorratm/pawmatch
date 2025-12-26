import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function VeterinariansMapScreen() {
  const router = useRouter();
  const [clinics] = useState([
    { id: 1, name: 'Paws & Claws Clinic', latitude: 41.0082, longitude: 28.9784 },
    { id: 2, name: 'Animal Care Center', latitude: 41.0122, longitude: 28.9824 },
    { id: 3, name: 'Pet Health Clinic', latitude: 41.0042, longitude: 28.9744 },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Veteriner Haritası</Text>
        <View style={styles.spacer} />
      </View>

      <MapView
        style={styles.map}
        region={{
          latitude: 41.0082,
          longitude: 28.9784,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {clinics.map((clinic) => (
          <Marker
            key={clinic.id}
            coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
            title={clinic.name}
          >
            <View style={styles.markerContainer}>
              <Ionicons name="medical" size={24} color={COLORS.primary} />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>Yakındaki Veterinerler</Text>
        {clinics.map((clinic) => (
          <TouchableOpacity
            key={clinic.id}
            style={styles.clinicItem}
            onPress={() => router.push(`/veterinarian-detail-1?clinicId=${clinic.id}`)}
          >
            <View style={styles.clinicIcon}>
              <Ionicons name="medical" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName}>{clinic.name}</Text>
              <Text style={styles.clinicDistance}>0.5 km uzaklıkta</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
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
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  spacer: {
    width: 24,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '40%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e5e5',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  clinicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  clinicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  clinicDistance: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});