import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapView, Marker } from '@/presentation/components/maps/RNMaps';
import { useNavigation } from 'expo-router/react-navigation';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { veterinariansService } from '@/infrastructure/api/veterinarians.service';

type ClinicMarker = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
};

export default function VeterinariansMapScreen() {
  const navigation = useNavigation();
  const [clinics, setClinics] = useState<ClinicMarker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await veterinariansService.getNearby(41.0082, 28.9784, 25);
        const list = (data?.clinics || [])
          .map((c: any) => {
            const lat = Number(c.latitude);
            const lng = Number(c.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            return {
              id: c.id,
              name: c.name,
              latitude: lat,
              longitude: lng,
              distance: typeof c.distance === 'number' ? c.distance : undefined,
            } as ClinicMarker;
          })
          .filter(Boolean) as ClinicMarker[];
        if (alive) setClinics(list);
      } catch (error) {
        console.error('Error loading clinics map:', error);
        if (alive) setClinics([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Veteriner Haritası</Text>
        <View style={styles.spacer} />
      </View>

      <MapView
        style={styles.map}
        region={{
          latitude: clinics[0]?.latitude ?? 41.0082,
          longitude: clinics[0]?.longitude ?? 28.9784,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {clinics.map((clinic) => (
          <Marker
            key={clinic.id}
            coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
            title={clinic.name}
            onPress={() =>
              (navigation as any).navigate('VeterinarianDetail1', {
                clinicId: String(clinic.id),
              })
            }
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
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 24 }} />
        ) : clinics.length === 0 ? (
          <Text style={styles.emptyText}>Yakınınızda veteriner bulunamadı</Text>
        ) : (
          clinics.map((clinic) => (
            <TouchableOpacity
              key={clinic.id}
              style={styles.clinicItem}
              onPress={() =>
                (navigation as any).navigate('VeterinarianDetail1', {
                  clinicId: String(clinic.id),
                })
              }
            >
              <View style={styles.clinicIcon}>
                <Ionicons name="medical" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{clinic.name}</Text>
                <Text style={styles.clinicDistance}>
                  {clinic.distance != null && Number.isFinite(clinic.distance)
                    ? `${clinic.distance.toFixed(1)} km uzaklıkta`
                    : 'Konum mevcut'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))
        )}
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
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
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
