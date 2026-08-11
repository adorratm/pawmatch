import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "expo-router/react-navigation";
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { usePetStore } from '@/application/stores/petStore';
import { userRepository } from '@/infrastructure/repositories/ApiUserRepository';
import { mergeAndSavePreferences } from '@/infrastructure/api/userPreferences';
import {
  buildDiscoverApiParams,
  resolveDiscoverCoordinates,
  type DiscoverFiltersSaved,
} from '@/infrastructure/api/discoverFilters';
import { useTranslation } from 'react-i18next';

import { shadowStyle } from '@/presentation/styles/shadow';
export default function FilterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const loadPets = usePetStore((s) => s.loadPets);
  const setActiveDiscoverFilters = usePetStore((s) => s.setActiveDiscoverFilters);
  const [species, setSpecies] = useState<'all' | 'dog' | 'cat' | 'other'>('all');
  const [gender, setGender] = useState<'all' | 'male' | 'female'>('all');
  const [minAge, setMinAge] = useState(0);
  const [maxAge, setMaxAge] = useState(15);
  const [maxDistance, setMaxDistance] = useState(50);
  const [onlyVaccinated, setOnlyVaccinated] = useState(false);
  const [onlySpayed, setOnlySpayed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await userRepository.getCurrentUser();
        const df = (u?.profile?.preferences as Record<string, unknown> | undefined)
          ?.discoverFilters as DiscoverFiltersSaved | undefined;
        if (cancelled || !df || typeof df !== 'object') return;
        if (typeof df.species === 'string') setSpecies(df.species as typeof species);
        if (typeof df.gender === 'string') setGender(df.gender as typeof gender);
        if (typeof df.minAge === 'number') setMinAge(df.minAge);
        if (typeof df.maxAge === 'number') setMaxAge(df.maxAge);
        if (typeof df.maxDistance === 'number') setMaxDistance(df.maxDistance);
        if (typeof df.onlyVaccinated === 'boolean') setOnlyVaccinated(df.onlyVaccinated);
        if (typeof df.onlySpayed === 'boolean') setOnlySpayed(df.onlySpayed);
      } catch {
        /* profil yok veya ağ hatası */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetAll = async () => {
    setSpecies('all');
    setGender('all');
    setMinAge(0);
    setMaxAge(15);
    setMaxDistance(50);
    setOnlyVaccinated(false);
    setOnlySpayed(false);
    setActiveDiscoverFilters(null);
    await mergeAndSavePreferences({ discoverFilters: null }).catch(() => {});
    await loadPets();
  };

  const applyFilters = async () => {
    const coords = await resolveDiscoverCoordinates();
    const saved: DiscoverFiltersSaved = {
      species,
      gender,
      minAge,
      maxAge,
      maxDistance,
      onlyVaccinated,
      onlySpayed,
      lastLatitude: coords.latitude,
      lastLongitude: coords.longitude,
    };
    await mergeAndSavePreferences({ discoverFilters: saved }).catch(() => {});
    const params = buildDiscoverApiParams(saved, coords);
    setActiveDiscoverFilters(params);
    await loadPets(params);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('discover.filtersTitle')}</Text>
        <TouchableOpacity onPress={resetAll}>
          <Text style={styles.resetText}>{t('discover.filtersReset')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('discover.filtersSpecies')}</Text>
          <View style={styles.optionsRow}>
            {['all', 'dog', 'cat', 'other'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.optionButton, species === s && styles.optionButtonActive]}
                onPress={() => setSpecies(s as any)}
              >
                <Text style={[styles.optionText, species === s && styles.optionTextActive]}>
                  {s === 'all'
                    ? t('common.all')
                    : s === 'dog'
                      ? t('discover.filtersDog')
                      : s === 'cat'
                        ? t('discover.filtersCat')
                        : t('discover.filtersOther')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('discover.filtersGender')}</Text>
          <View style={styles.optionsRow}>
            {['all', 'male', 'female'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.optionButton, gender === g && styles.optionButtonActive]}
                onPress={() => setGender(g as any)}
              >
                <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>
                  {g === 'all'
                    ? t('common.all')
                    : g === 'male'
                      ? t('discover.filtersMale')
                      : t('discover.filtersFemale')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('discover.filtersAgeRange')}</Text>
          <View style={styles.rangeCard}>
            <Text style={styles.rangeValue}>
              {t('common.ageRange', { min: minAge, max: maxAge })}
            </Text>
            <View style={styles.stepperRow}>
              <Text style={styles.stepperLabel}>{t('discover.filtersMin')}</Text>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setMinAge((v) => Math.max(0, Math.min(v - 1, maxAge)))}
                >
                  <Ionicons name="remove" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{minAge}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setMinAge((v) => Math.min(v + 1, maxAge))}
                >
                  <Ionicons name="add" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.stepperRow}>
              <Text style={styles.stepperLabel}>{t('discover.filtersMax')}</Text>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setMaxAge((v) => Math.max(minAge, v - 1))}
                >
                  <Ionicons name="remove" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{maxAge}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setMaxAge((v) => Math.min(20, v + 1))}
                >
                  <Ionicons name="add" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('discover.filtersMaxDistance')}</Text>
          <View style={styles.rangeCard}>
            <Text style={styles.rangeValue}>{t('common.km', { n: maxDistance })}</Text>
            <View style={styles.distanceChips}>
              {[5, 10, 25, 50, 100].map((km) => (
                <TouchableOpacity
                  key={km}
                  style={[
                    styles.distanceChip,
                    maxDistance === km && styles.distanceChipActive,
                  ]}
                  onPress={() => setMaxDistance(km)}
                >
                  <Text
                    style={[
                      styles.distanceChipText,
                      maxDistance === km && styles.distanceChipTextActive,
                    ]}
                  >
                    {t('common.km', { n: km })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.stepperRow}>
              <Text style={styles.stepperLabel}>{t('discover.filtersCustom')}</Text>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setMaxDistance((v) => Math.max(1, v - 5))}
                >
                  <Ionicons name="remove" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{maxDistance}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setMaxDistance((v) => Math.min(200, v + 5))}
                >
                  <Ionicons name="add" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchItem}>
            <View>
              <Text style={styles.switchTitle}>{t('discover.filtersOnlyVaccinated')}</Text>
              <Text style={styles.switchSubtitle}>{t('discover.filtersOnlyVaccinatedHint')}</Text>
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
              <Text style={styles.switchTitle}>{t('discover.filtersOnlySpayed')}</Text>
              <Text style={styles.switchSubtitle}>{t('discover.filtersOnlySpayedHint')}</Text>
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
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>{t('discover.filtersApply')}</Text>
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
  rangeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  rangeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  distanceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  distanceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  distanceChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  distanceChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  distanceChipTextActive: {
    color: '#fff',
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
    ...shadowStyle({ color: COLORS.primary, offsetX: 0, offsetY: 4, blur: 8, opacity: 0.3, elevation: 5 }),
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});


