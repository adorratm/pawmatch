import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/presentation/components/forms/Input';
import api from '@/infrastructure/api/api';

export default function RatingScreen2() {
  const route = useRoute();
  const navigation = useNavigation();
  const { clinicId } = route.params as any;
  const [overallRating, setOverallRating] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [service, setService] = useState(0);
  const [value, setValue] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const RatingCategory = ({
    title,
    rating,
    onRatingChange,
  }: {
    title: string;
    rating: number;
    onRatingChange: (rating: number) => void;
  }) => (
    <View style={styles.category}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? '#fbbf24' : '#e5e5e5'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Değerlendir</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Deneyiminizi Paylaşın</Text>
        <Text style={styles.subtitle}>Görüşleriniz bizim için çok değerli</Text>

        <RatingCategory
          title="Genel Değerlendirme"
          rating={overallRating}
          onRatingChange={setOverallRating}
        />
        <RatingCategory
          title="Temizlik"
          rating={cleanliness}
          onRatingChange={setCleanliness}
        />
        <RatingCategory
          title="Hizmet Kalitesi"
          rating={service}
          onRatingChange={setService}
        />
        <RatingCategory
          title="Fiyat/Performans"
          rating={value}
          onRatingChange={setValue}
        />

        <View style={styles.commentSection}>
          <Input
            label="Yorumunuz"
            placeholder="Deneyiminizi detaylı olarak paylaşın..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            maxLength={500}
            hint={`${comment.length}/500`}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            overallRating === 0 && styles.submitButtonDisabled,
          ]}
          disabled={
            overallRating === 0 ||
            cleanliness === 0 ||
            service === 0 ||
            value === 0 ||
            submitting
          }
          onPress={async () => {
            if (!clinicId) return;
            setSubmitting(true);
            try {
              await api.post(`/veterinarians/${clinicId}/reviews`, {
                overallRating,
                cleanlinessRating: cleanliness,
                serviceRating: service,
                valueRating: value,
                comment: comment.trim() || undefined,
              });
              Alert.alert('Teşekkürler', 'Klinik değerlendirmen kaydedildi.');
              navigation.goBack();
            } catch (e: any) {
              const msg =
                e?.response?.data?.message ||
                (Array.isArray(e?.response?.data?.message)
                  ? e.response.data.message.join(', ')
                  : null);
              Alert.alert('Hata', msg || 'Gönderilemedi.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Değerlendirmeyi Gönder</Text>
          )}
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 32,
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  commentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: '#e5e5e5',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});


