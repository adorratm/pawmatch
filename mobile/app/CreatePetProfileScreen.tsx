import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/presentation/components/forms/Input';
import * as ImagePicker from 'expo-image-picker';
import { petsService } from '@/infrastructure/api/pets.service';
import { useTranslation } from 'react-i18next';

import { shadowStyle } from '@/presentation/styles/shadow';
export default function CreatePetProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [purpose, setPurpose] = useState<'playmate' | 'adoption' | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat' | 'other'>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bio, setBio] = useState('');
  const [isSpayed, setIsSpayed] = useState(false);
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!purpose) {
        Alert.alert(t('pets.alertPickPurposeTitle'), t('pets.alertPickPurposeMsg'));
        return;
      }
      setStep(2);
      return;
    }
    void handleSubmit();
  };

  const handleSubmit = async () => {
    if (!purpose) {
      Alert.alert(t('pets.alertPickPurposeTitle'), t('pets.alertPickPurposeMsg'));
      setStep(1);
      return;
    }
    const ageNum = parseInt(age, 10);
    if (!name.trim()) {
      Alert.alert(t('auth.missingInfoTitle'), t('pets.alertMissingName'));
      return;
    }
    if (Number.isNaN(ageNum) || ageNum < 0) {
      Alert.alert(t('auth.missingInfoTitle'), t('pets.alertInvalidAge'));
      return;
    }
    setSubmitting(true);
    try {
      const pet = await petsService.createPet({
        name: name.trim(),
        species,
        breed: breed.trim() || undefined,
        age: ageNum,
        gender,
        bio: bio.trim() || undefined,
        isSpayed,
        isVaccinated,
        purpose,
      });
      const petId = pet.id as number;
      const uris = photos.filter(Boolean);
      for (let i = 0; i < uris.length; i++) {
        const uri = uris[i];
        const mime =
          uri.toLowerCase().includes('.png') || uri.includes('image/png')
            ? 'image/png'
            : 'image/jpeg';
        const file = { uri, name: `pet-${petId}-${i}.jpg`, type: mime };
        await petsService.uploadPhoto(petId, file as any, i === 0);
      }
      Alert.alert(t('pets.alertCreatedTitle'), t('pets.alertCreatedMsg'), [
        { text: t('common.continue'), onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        (Array.isArray(e?.response?.data?.message)
          ? e.response.data.message.join(', ')
          : null) ||
        t('pets.alertCreateFailed');
      Alert.alert(t('common.error'), typeof msg === 'string' ? msg : t('pets.alertCreateFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step > 1) setStep(step - 1);
            else navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pets.createTitle')}</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.progress}>
        <View style={[styles.progressBar, step >= 1 && styles.progressBarActive]} />
        <View style={[styles.progressBar, step >= 2 && styles.progressBarActive]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 ? (
          <View>
            <Text style={styles.title}>{t('pets.purposeTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('pets.purposeSubtitle')}
            </Text>
            <TouchableOpacity
              style={[styles.purposeCard, purpose === 'playmate' && styles.purposeCardActive]}
              onPress={() => setPurpose('playmate')}
            >
              <Ionicons
                name="tennisball-outline"
                size={28}
                color={purpose === 'playmate' ? COLORS.primary : COLORS.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.purposeTitle}>{t('pets.purposePlaymate')}</Text>
                <Text style={styles.purposeSub}>{t('pets.purposePlaymateSub')}</Text>
              </View>
              {purpose === 'playmate' ? (
                <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.purposeCard, purpose === 'adoption' && styles.purposeCardActive]}
              onPress={() => setPurpose('adoption')}
            >
              <Ionicons
                name="home-outline"
                size={28}
                color={purpose === 'adoption' ? COLORS.primary : COLORS.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.purposeTitle}>{t('pets.purposeAdoption')}</Text>
                <Text style={styles.purposeSub}>{t('pets.purposeAdoptionSub')}</Text>
              </View>
              {purpose === 'adoption' ? (
                <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              ) : null}
            </TouchableOpacity>
          </View>
        ) : (
          <>
        <Text style={styles.title}>{t('pets.whoTitle')}</Text>
        <Text style={styles.subtitle}>{t('pets.whoSubtitle')}</Text>

        <View style={styles.photoGrid}>
          <TouchableOpacity style={styles.mainPhotoSlot} onPress={pickImage}>
            {photos[0] ? (
              <Image source={{ uri: photos[0] }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="add" size={32} color={COLORS.primary} />
              </View>
            )}
            {photos[0] && (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>{t('pets.mainPhotoBadge')}</Text>
              </View>
            )}
          </TouchableOpacity>
          {[1, 2, 3, 4].map((index) => (
            <TouchableOpacity key={index} style={styles.photoSlot} onPress={pickImage}>
              {photos[index] ? (
                <Image source={{ uri: photos[index] }} style={styles.photo} />
              ) : (
                <Ionicons name="add" size={24} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <Input
            label={t('pets.labelName')}
            placeholder={t('pets.placeholderName')}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('pets.labelSpecies')}</Text>
            <View style={styles.speciesButtons}>
              <TouchableOpacity
                style={[styles.speciesButton, species === 'dog' && styles.speciesButtonActive]}
                onPress={() => setSpecies('dog')}
              >
                <Text style={styles.speciesEmoji}>🐶</Text>
                <Text style={[styles.speciesText, species === 'dog' && styles.speciesTextActive]}>
                  {t('pets.speciesDog')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.speciesButton, species === 'cat' && styles.speciesButtonActive]}
                onPress={() => setSpecies('cat')}
              >
                <Text style={styles.speciesEmoji}>🐱</Text>
                <Text style={[styles.speciesText, species === 'cat' && styles.speciesTextActive]}>
                  {t('pets.speciesCat')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.speciesButton, species === 'other' && styles.speciesButtonActive]}
                onPress={() => setSpecies('other')}
              >
                <Text style={styles.speciesEmoji}>🐰</Text>
                <Text style={[styles.speciesText, species === 'other' && styles.speciesTextActive]}>
                  {t('pets.speciesOther')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <Input
              label={t('pets.labelBreed')}
              placeholder={t('pets.placeholderBreed')}
              value={breed}
              onChangeText={setBreed}
              containerStyle={styles.flex1}
            />
            <Input
              label={t('pets.labelAge')}
              placeholder={t('pets.placeholderAge')}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              containerStyle={styles.ageInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('pets.labelGender')}</Text>
            <View style={styles.genderToggle}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                  {t('pets.genderBoy')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                  {t('pets.genderGirl')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('pets.labelHealth')}</Text>
            <View style={styles.healthItem}>
              <View style={styles.healthInfo}>
                <Ionicons name="medical" size={20} color={COLORS.primary} />
                <View>
                  <Text style={styles.healthTitle}>{t('pets.spayedTitle')}</Text>
                  <Text style={styles.healthSubtitle}>{t('pets.spayedHint')}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.toggle, isSpayed && styles.toggleActive]}
                onPress={() => setIsSpayed(!isSpayed)}
              >
                <View style={[styles.toggleThumb, isSpayed && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>
            <View style={styles.healthItem}>
              <View style={styles.healthInfo}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                <View>
                  <Text style={styles.healthTitle}>{t('pets.vaccinationsTitle')}</Text>
                  <Text style={styles.healthSubtitle}>{t('pets.vaccinationsHint')}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.toggle, isVaccinated && styles.toggleActive]}
                onPress={() => setIsVaccinated(!isVaccinated)}
              >
                <View style={[styles.toggleThumb, isVaccinated && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>
            {isVaccinated ? (
              <View style={styles.vaxInfoBox}>
                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.vaxInfoTitle}>{t('pets.vaccinationsInfoTitle')}</Text>
                  <Text style={styles.vaxInfoBody}>{t('pets.vaccinationsInfoBody')}</Text>
                </View>
              </View>
            ) : null}
          </View>

          <Input
            label={t('pets.labelBio')}
            placeholder={t('pets.placeholderBio')}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            maxLength={300}
            hint={`${bio.length}/300`}
          />
        </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, submitting && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                {step === 1 ? t('common.continue') : t('common.save')}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
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
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  purposeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  purposeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(106, 63, 42, 0.08)',
  },
  purposeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  purposeSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  spacer: {
    width: 24,
  },
  progress: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e5e5',
  },
  progressBarActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  mainPhotoSlot: {
    width: '63%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: COLORS.primary + '4D',
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mainBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  ageInput: {
    width: 100,
  },
  speciesButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  speciesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  speciesButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  speciesEmoji: {
    fontSize: 18,
  },
  speciesText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  speciesTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  genderToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    padding: 4,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  genderTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  healthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  healthSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  vaxInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 63, 42, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(106, 63, 42, 0.18)',
  },
  vaxInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  vaxInfoBody: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e5e5',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadowStyle({ color: COLORS.primary, offsetX: 0, offsetY: 4, blur: 8, opacity: 0.3, elevation: 5 }),
  },
  continueButtonDisabled: {
    opacity: 0.75,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});


