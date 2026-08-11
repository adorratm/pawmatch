import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapView, Marker } from '@/presentation/components/maps/RNMaps';
import { useNavigation } from "expo-router/react-navigation";
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';

import { shadowStyle } from '@/presentation/styles/shadow';
export default function SuggestMeetingPointScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
  });
  const [suggestedPlaces] = useState([
    { id: 1, name: t('chat.placeKadikoy'), address: t('chat.placeKadikoyAddr') },
    { id: 2, name: t('chat.placeMacka'), address: t('chat.placeMackaAddr') },
    { id: 3, name: t('chat.placeEmirgan'), address: t('chat.placeEmirganAddr') },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('chat.suggestMeetingTitle')}</Text>
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
        <Text style={styles.sheetTitle}>{t('chat.suggestSafePlaces')}</Text>
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

        <TouchableOpacity style={styles.suggestButton}>
          <Text style={styles.suggestButtonText}>{t('chat.suggestThisLocation')}</Text>
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
    ...shadowStyle({ color: '#000', offsetX: 0, offsetY: -4, blur: 8, opacity: 0.1, elevation: 10 }),
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
    ...shadowStyle({ color: '#000', offsetX: 0, offsetY: 2, blur: 8, opacity: 0.1, elevation: 3 }),
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
    ...shadowStyle({ color: COLORS.primary, offsetX: 0, offsetY: 4, blur: 8, opacity: 0.3, elevation: 5 }),
  },
  suggestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});


