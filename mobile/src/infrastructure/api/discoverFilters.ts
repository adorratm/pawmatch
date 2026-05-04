import * as Location from 'expo-location';

export type DiscoverFiltersSaved = {
  species?: 'all' | 'dog' | 'cat' | 'other';
  gender?: 'all' | 'male' | 'female';
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  onlyVaccinated?: boolean;
  onlySpayed?: boolean;
  lastLatitude?: number;
  lastLongitude?: number;
};

export async function resolveDiscoverCoordinates(saved?: DiscoverFiltersSaved | null) {
  if (saved?.lastLatitude != null && saved?.lastLongitude != null) {
    return { latitude: saved.lastLatitude, longitude: saved.lastLongitude };
  }
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const pos = await Location.getCurrentPositionAsync({});
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    }
  } catch {
    /* ignore */
  }
  return { latitude: 41.0082, longitude: 28.9784 };
}

export function buildDiscoverApiParams(
  saved: DiscoverFiltersSaved,
  coords: { latitude: number; longitude: number },
): Record<string, unknown> {
  const species = saved.species ?? 'all';
  const gender = saved.gender ?? 'all';
  const params: Record<string, unknown> = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    radius: saved.maxDistance ?? 50,
    minAge: saved.minAge ?? 0,
    maxAge: saved.maxAge ?? 15,
  };
  if (species !== 'all') params.species = species;
  if (gender !== 'all') params.gender = gender;
  if (saved.onlyVaccinated) params.isVaccinated = true;
  if (saved.onlySpayed) params.isSpayed = true;
  return params;
}
