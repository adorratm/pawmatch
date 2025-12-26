import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function SuggestMeetingPointScreen() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
  });
  const [suggestedPlaces] = useState([
    { id: 1, name: 'Kadıköy Sahil Parkı', address: 'Kadıköy, İstanbul' },
    { id: 2, name: 'Maçka Parkı', address: 'Beşiktaş, İstanbul' },
    { id: 3, name: 'Emirgan Korusu', address: 'Sarıyer, İstanbul' },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buluşma Noktası Öner</Text>
        <View style={styles.spacer} />
      </View>

      <MapView
        style={styles.map}
        region={{
          ...selectedLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={selectedLocation}>
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
          </View>
        </Marker>
      </MapView>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>Önerilen Güvenli Yerler</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {suggestedPlaces.map((place) => (
            <TouchableOpacity key={place.id} style={styles.placeCard}>
              <View style={styles.placeIcon}>
                <Ionicons name="location" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeAddress}>{place.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.suggestButton} onPress={() => router.back()}>
          <Text style={styles.suggestButtonText}>Bu Konumu Öner</Text>
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
    maxHeight: '50%',
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
  placeCard: {
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
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  suggestButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});