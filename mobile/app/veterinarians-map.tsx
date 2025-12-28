import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { veterinariansService } from '../src/services/veterinarians.service';
import { COLORS } from '../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function VeterinariansMapScreen() {
  const router = useRouter();
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<any | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (location) {
      loadClinics();
    }
  }, [location]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const newLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setLocation(newLocation);
        setRegion({
          ...newLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadClinics = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const response = await veterinariansService.getNearby(
        location.latitude,
        location.longitude,
        10,
      );
      setClinics(response.clinics || []);
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    if (!phone) {
      Alert.alert('Hata', 'Telefon numarası bulunamadı.');
      return;
    }

    const phoneNumber = phone.startsWith('+') ? phone : `+90${phone.replace(/\D/g, '')}`;
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
      console.error('Error calling:', err);
      Alert.alert('Hata', 'Arama yapılamadı.');
    });
  };

  const handleNavigate = (clinic: any) => {
    if (!clinic.latitude || !clinic.longitude) {
      Alert.alert('Hata', 'Konum bilgisi bulunamadı.');
      return;
    }

    const lat = parseFloat(clinic.latitude.toString());
    const lng = parseFloat(clinic.longitude.toString());

    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    });

    Linking.openURL(url || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`).catch(
      (err) => {
        console.error('Error opening maps:', err);
        Alert.alert('Hata', 'Harita uygulaması açılamadı.');
      },
    );
  };

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
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {clinics.map((clinic) => {
          if (!clinic.latitude || !clinic.longitude) return null;
          return (
            <Marker
              key={clinic.id}
              coordinate={{
                latitude: parseFloat(clinic.latitude.toString()),
                longitude: parseFloat(clinic.longitude.toString()),
              }}
              title={clinic.name}
              onPress={() => setSelectedClinic(clinic)}
            >
              <View style={styles.markerContainer}>
                <Ionicons name="medical" size={24} color={COLORS.primary} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>Yakındaki Veterinerler</Text>
        {selectedClinic ? (
          <View style={styles.clinicDetail}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedClinic(null)}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.clinicDetailName}>{selectedClinic.name}</Text>
            {selectedClinic.address && (
              <Text style={styles.clinicDetailAddress}>{selectedClinic.address}</Text>
            )}
            {selectedClinic.distance !== undefined && (
              <Text style={styles.clinicDetailDistance}>
                {Math.round(selectedClinic.distance * 10) / 10} km uzaklıkta
              </Text>
            )}
            <View style={styles.clinicActions}>
              {selectedClinic.phone && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => handleCall(selectedClinic.phone)}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Ara</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.navigateButton]}
                onPress={() => handleNavigate(selectedClinic)}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Yol Tarifi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.detailButton]}
                onPress={() => router.push(`/veterinarian-detail-1?clinicId=${selectedClinic.id}`)}
              >
                <Text style={styles.actionButtonText}>Detay</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {clinics.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="medical-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Yakında veteriner bulunamadı</Text>
              </View>
            ) : (
              clinics.map((clinic) => (
                <TouchableOpacity
                  key={clinic.id}
                  style={styles.clinicItem}
                  onPress={() => setSelectedClinic(clinic)}
                >
                  <View style={styles.clinicIcon}>
                    <Ionicons name="medical" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.clinicInfo}>
                    <Text style={styles.clinicName}>{clinic.name}</Text>
                    <Text style={styles.clinicDistance}>
                      {clinic.distance !== undefined
                        ? `${Math.round(clinic.distance * 10) / 10} km uzaklıkta`
                        : 'Konum bilgisi yok'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicDetail: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicDetailName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  clinicDetailAddress: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  clinicDetailDistance: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  clinicActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  callButton: {
    backgroundColor: '#10b981',
  },
  navigateButton: {
    backgroundColor: COLORS.primary,
  },
  detailButton: {
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
  },
});