import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import api from '@/infrastructure/api/api';

const { width } = Dimensions.get('window');

export default function VeterinarianDetailScreen1() {
  const route = useRoute();
  const navigation = useNavigation();
  const { clinicId } = route.params as any;
  const [clinic, setClinic] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadClinic();
  }, [clinicId]);

  const loadClinic = async () => {
    try {
      const response = await api.get(`/veterinarians/${clinicId}`);
      setClinic(response.data);
    } catch (error) {
      console.error('Error loading clinic:', error);
    }
  };

  if (!clinic) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail</Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          data={[1, 2, 3]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          renderItem={({ index }) => (
            <Image
              source={{ uri: `https://picsum.photos/400/300?random=${clinicId + index}` }}
              style={styles.heroImage}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
        />

        <View style={styles.content}>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={18} color="#fbbf24" />
              <Text style={styles.ratingText}>{clinic.rating?.toFixed(1) || '4.8'}</Text>
            </View>
            <Text style={styles.reviews}>{clinic.reviewCount || 120} Reviews</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>OPEN NOW</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Ara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Yol Tarifi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() =>
                (navigation as any).navigate('AppointmentManagement', {
                  clinicId: String(clinic.id),
                })
              }
            >
              <Ionicons name="calendar" size={20} color="#fff" />
              <Text style={[styles.actionText, styles.primaryActionText]}>Randevu Al</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.rateClinicButton}
            onPress={() =>
              (navigation as any).navigate('Rating2', { clinicId: String(clinic.id) })
            }
          >
            <Ionicons name="star-outline" size={22} color={COLORS.primary} />
            <Text style={styles.rateClinicText}>Kliniği değerlendir</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hakkında</Text>
            <Text style={styles.sectionText}>{clinic.veterinarian?.bio || 'Modern ve donanımlı veteriner kliniği.'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İletişim</Text>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{clinic.address}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{clinic.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{clinic.email}</Text>
            </View>
          </View>

          {clinic.services && clinic.services.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hizmetler</Text>
              {clinic.services.map((service: any) => (
                <View key={service.id} style={styles.serviceItem}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.servicePrice}>{service.price} ₺</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  heroImage: {
    width: width,
    height: width * 0.75,
  },
  content: {
    padding: 24,
  },
  clinicName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviews: {
    fontSize: 14,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  rateClinicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  rateClinicText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  primaryAction: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  primaryActionText: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.text,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});


