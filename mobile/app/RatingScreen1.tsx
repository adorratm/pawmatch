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
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/presentation/components/forms/Input';
import { ratingsService } from '@/infrastructure/api/ratings.service';

import { shadowStyle } from '@/presentation/styles/shadow';

export default function RatingScreen1() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params as any;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('vet.ratingTitle')}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>{t('vet.ratingOverall')}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={48}
                  color={star <= rating ? '#fbbf24' : '#e5e5e5'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating === 0
              ? t('vet.ratingSelect')
              : rating === 1
                ? t('vet.ratingVeryBad')
                : rating === 2
                  ? t('vet.ratingBad')
                  : rating === 3
                    ? t('vet.ratingOk')
                    : rating === 4
                      ? t('vet.ratingGood')
                      : t('vet.ratingExcellent')}
          </Text>
        </View>

        <View style={styles.commentSection}>
          <Input
            label={t('vet.ratingCommentOptional')}
            placeholder={t('vet.ratingPlaceholder')}
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
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          disabled={rating === 0 || submitting}
          onPress={async () => {
            if (!userId) return;
            setSubmitting(true);
            try {
              await ratingsService.rateUser(Number(userId), rating, comment.trim() || undefined);
              Alert.alert(t('vet.ratingThanks'), t('vet.ratingSavedUser'));
              navigation.goBack();
            } catch (e: any) {
              Alert.alert(t('common.error'), e?.response?.data?.message || t('vet.ratingFailed'));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('vet.ratingSubmit')}</Text>
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
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  commentSection: {
    marginBottom: 24,
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
    ...shadowStyle({ color: COLORS.primary, offsetX: 0, offsetY: 4, blur: 8, opacity: 0.3, elevation: 5 }),
  },
  submitButtonDisabled: {
    backgroundColor: '#e5e5e5',
    ...shadowStyle({ none: true }),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});


