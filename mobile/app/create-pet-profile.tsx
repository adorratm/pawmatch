import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/config';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePetProfileScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Profile</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.progress}>
        <View style={[styles.progressBar, step >= 1 && styles.progressBarActive]} />
        <View style={[styles.progressBar, step >= 2 && styles.progressBarActive]} />
        <View style={[styles.progressBar, step >= 3 && styles.progressBarActive]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Who's the good boy/girl?</Text>
        <Text style={styles.subtitle}>Add photos and details to find their perfect match.</Text>

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
                <Text style={styles.mainBadgeText}>Main</Text>
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Charlie"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Species</Text>
            <View style={styles.speciesButtons}>
              <TouchableOpacity
                style={[styles.speciesButton, species === 'dog' && styles.speciesButtonActive]}
                onPress={() => setSpecies('dog')}
              >
                <Text style={styles.speciesEmoji}>🐶</Text>
                <Text style={[styles.speciesText, species === 'dog' && styles.speciesTextActive]}>
                  Dog
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.speciesButton, species === 'cat' && styles.speciesButtonActive]}
                onPress={() => setSpecies('cat')}
              >
                <Text style={styles.speciesEmoji}>🐱</Text>
                <Text style={[styles.speciesText, species === 'cat' && styles.speciesTextActive]}>
                  Cat
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.speciesButton, species === 'other' && styles.speciesButtonActive]}
                onPress={() => setSpecies('other')}
              >
                <Text style={styles.speciesEmoji}>🐰</Text>
                <Text style={[styles.speciesText, species === 'other' && styles.speciesTextActive]}>
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Breed</Text>
              <TextInput
                style={styles.input}
                placeholder="Golden Retriever"
                value={breed}
                onChangeText={setBreed}
              />
            </View>
            <View style={[styles.inputGroup, styles.ageInput]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="2"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderToggle}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                  Boy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                  Girl
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Health Status</Text>
            <View style={styles.healthItem}>
              <View style={styles.healthInfo}>
                <Ionicons name="medical" size={20} color={COLORS.primary} />
                <View>
                  <Text style={styles.healthTitle}>Spayed / Neutered</Text>
                  <Text style={styles.healthSubtitle}>Is your pet fixed?</Text>
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
                  <Text style={styles.healthTitle}>Vaccinations</Text>
                  <Text style={styles.healthSubtitle}>Up to date?</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.toggle, isVaccinated && styles.toggleActive]}
                onPress={() => setIsVaccinated(!isVaccinated)}
              >
                <View style={[styles.toggleThumb, isVaccinated && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Short Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about their favorite toys, treats, and personality..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{bio.length}/300</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    color: COLORS.primary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});


