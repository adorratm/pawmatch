import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { colors } from '../../utils/colors';

const temperaments = [
  'Playful',
  'Calm',
  'Energetic',
  'Shy',
  'Cuddly',
  'Social',
  'Loyal',
  'Curious',
];

export default function ProfileCreateScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('Buddy');
  const [species, setSpecies] = useState<'dog' | 'cat' | 'other'>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bio, setBio] = useState('');
  const [isSpayed, setIsSpayed] = useState(true);
  const [isVaccinated, setIsVaccinated] = useState(true);
  const [healthNotes, setHealthNotes] = useState('');
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>(['Playful']);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // For now, just add the local URI
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const toggleTemperament = (temp: string) => {
    if (selectedTemperaments.includes(temp)) {
      setSelectedTemperaments(selectedTemperaments.filter((t) => t !== temp));
    } else if (selectedTemperaments.length < 3) {
      setSelectedTemperaments([...selectedTemperaments, temp]);
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Hata', 'İsim gereklidir');
      return;
    }

    setLoading(true);
    try {
      // For now, just navigate back (using mock data)
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Profile</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={styles.progressBarFill} />
          <View style={styles.progressBarEmpty} />
          <View style={styles.progressBarEmpty} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Who's the good boy/girl?</Text>
          <Text style={styles.subtitle}>
            Add photos and details to find their perfect match.
          </Text>

          {/* Photo Grid */}
          <View style={styles.photoGrid}>
            <TouchableOpacity
              style={[styles.photoSlot, styles.mainPhoto]}
              onPress={pickImage}
            >
              {photos[0] ? (
                <Image source={{ uri: photos[0] }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderIcon}>📷</Text>
                </View>
              )}
              {photos[0] && (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>Main</Text>
                </View>
              )}
            </TouchableOpacity>
            {[1, 2, 3, 4].map((i) => (
              <TouchableOpacity
                key={i}
                style={styles.photoSlot}
                onPress={pickImage}
              >
                {photos[i] ? (
                  <Image source={{ uri: photos[i] }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderIcon}>📷</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.photoHint}>
            Drag to reorder • {photos.length}/6 uploaded
          </Text>

          {/* Form */}
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.speciesContainer}
              >
                {(['dog', 'cat', 'other'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.speciesButton,
                      species === s && styles.speciesButtonActive,
                    ]}
                    onPress={() => setSpecies(s)}
                  >
                    <Text style={styles.speciesEmoji}>
                      {s === 'dog' ? '🐶' : s === 'cat' ? '🐱' : '🐰'}
                    </Text>
                    <Text
                      style={[
                        styles.speciesText,
                        species === s && styles.speciesTextActive,
                      ]}
                    >
                      {s === 'dog' ? 'Dog' : s === 'cat' ? 'Cat' : 'Other'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Breed</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Golden Retriever"
                  value={breed}
                  onChangeText={setBreed}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Age</Text>
                <View style={styles.ageInputWrapper}>
                  <TextInput
                    style={styles.ageInput}
                    placeholder="2"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                  <Text style={styles.ageSuffix}>yrs</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'male' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === 'male' && styles.genderTextActive,
                    ]}
                  >
                    Boy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'female' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === 'female' && styles.genderTextActive,
                    ]}
                  >
                    Girl
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Temperament (Select up to 3)</Text>
              <View style={styles.temperamentContainer}>
                {temperaments.map((temp) => (
                  <TouchableOpacity
                    key={temp}
                    style={[
                      styles.temperamentButton,
                      selectedTemperaments.includes(temp) &&
                        styles.temperamentButtonActive,
                    ]}
                    onPress={() => toggleTemperament(temp)}
                  >
                    <Text
                      style={[
                        styles.temperamentText,
                        selectedTemperaments.includes(temp) &&
                          styles.temperamentTextActive,
                      ]}
                    >
                      #{temp}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Health Status</Text>
              <View style={styles.healthItem}>
                <View style={styles.healthInfo}>
                  <View style={styles.healthIconContainer}>
                    <Text style={styles.healthIcon}>🏥</Text>
                  </View>
                  <View>
                    <Text style={styles.healthTitle}>Spayed / Neutered</Text>
                    <Text style={styles.healthSubtitle}>Is your pet fixed?</Text>
                  </View>
                </View>
                <Switch
                  value={isSpayed}
                  onValueChange={setIsSpayed}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <View style={styles.healthItem}>
                <View style={styles.healthInfo}>
                  <View style={styles.healthIconContainer}>
                    <Text style={styles.healthIcon}>💉</Text>
                  </View>
                  <View>
                    <Text style={styles.healthTitle}>Vaccinations</Text>
                    <Text style={styles.healthSubtitle}>Up to date?</Text>
                  </View>
                </View>
                <Switch
                  value={isVaccinated}
                  onValueChange={setIsVaccinated}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Special needs or common health issues..."
                value={healthNotes}
                onChangeText={setHealthNotes}
              />
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
                maxLength={300}
              />
              <Text style={styles.charCount}>{bio.length}/300</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Continue</Text>
                <Text style={styles.arrow}>→</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  backIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressBarFill: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressBarEmpty: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[100],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 22,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mainPhoto: {
    width: '64%',
    borderColor: `${colors.primary}4D`,
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
  photoPlaceholderIcon: {
    fontSize: 32,
    opacity: 0.4,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mainBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  photoHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  speciesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 24,
  },
  speciesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  speciesButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  speciesEmoji: {
    fontSize: 18,
  },
  speciesText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  speciesTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ageInputWrapper: {
    position: 'relative',
  },
  ageInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    paddingRight: 48,
  },
  ageSuffix: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  genderContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 24,
    padding: 4,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  genderTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  temperamentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  temperamentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  temperamentButtonActive: {
    backgroundColor: `${colors.primary}1A`,
    borderColor: `${colors.primary}33`,
  },
  temperamentText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  temperamentTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 12,
  },
  healthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  healthIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthIcon: {
    fontSize: 20,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  healthSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
