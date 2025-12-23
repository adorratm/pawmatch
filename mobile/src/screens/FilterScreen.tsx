import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function FilterScreen() {
  const navigation = useNavigation();
  const [species, setSpecies] = useState<'all' | 'dog' | 'cat' | 'other'>('all');
  const [gender, setGender] = useState<'all' | 'male' | 'female'>('all');
  const [minAge, setMinAge] = useState(0);
  const [maxAge, setMaxAge] = useState(15);
  const [maxDistance, setMaxDistance] = useState(50);
  const [onlyVaccinated, setOnlyVaccinated] = useState(false);
  const [onlySpayed, setOnlySpayed] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtreler</Text>
        <TouchableOpacity>
          <Text style={styles.resetText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tür</Text>
          <View style={styles.optionsRow}>
            {['all', 'dog', 'cat', 'other'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.optionButton, species === s && styles.optionButtonActive]}
                onPress={() => setSpecies(s as any)}
              >
                <Text style={[styles.optionText, species === s && styles.optionTextActive]}>
                  {s === 'all' ? 'Tümü' : s === 'dog' ? 'Köpek' : s === 'cat' ? 'Kedi' : 'Diğer'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cinsiyet</Text>
          <View style={styles.optionsRow}>
            {['all', 'male', 'female'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.optionButton, gender === g && styles.optionButtonActive]}
                onPress={() => setGender(g as any)}
              >
                <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>
                  {g === 'all' ? 'Tümü' : g === 'male' ? 'Erkek' : 'Dişi'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yaş Aralığı</Text>
          <View style={styles.ageRange}>
            <Text style={styles.ageText}>{minAge} - {maxAge} yaş</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maksimum Mesafe</Text>
          <View style={styles.distanceRange}>
            <Text style={styles.distanceText}>{maxDistance} km</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchItem}>
            <View>
              <Text style={styles.switchTitle}>Sadece Aşılı</Text>
              <Text style={styles.switchSubtitle}>Aşıları tamamlanmış hayvanları göster</Text>
            </View>
            <Switch
              value={onlyVaccinated}
              onValueChange={setOnlyVaccinated}
              trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.switchItem}>
            <View>
              <Text style={styles.switchTitle}>Sadece Kısırlaştırılmış</Text>
              <Text style={styles.switchSubtitle}>Kısırlaştırılmış hayvanları göster</Text>
            </View>
            <Switch
              value={onlySpayed}
              onValueChange={setOnlySpayed}
              trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Filtreleri Uygula</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  ageRange: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  ageText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  distanceRange: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  applyButton: {
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
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});


