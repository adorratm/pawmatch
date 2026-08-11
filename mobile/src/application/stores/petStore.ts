import { create } from 'zustand';
import { Pet } from '@/domain/entities/Pet';
import { petRepository } from '@/infrastructure/repositories/ApiPetRepository';
import { petsService } from '@/infrastructure/api/pets.service';
import { userRepository } from '@/infrastructure/repositories/ApiUserRepository';
import { mergeAndSavePreferences } from '@/infrastructure/api/userPreferences';

export type DiscoverMode = 'playmate' | 'adoption';

export type MyPetChip = {
  id: number;
  name: string;
  purpose?: string | null;
  isAdopted?: boolean;
  photos?: { url: string }[];
};

interface PetState {
  pets: Pet[];
  currentIndex: number;
  loading: boolean;
  activeDiscoverFilters: Record<string, unknown> | null;
  discoverMode: DiscoverMode;
  myPetsForLike: MyPetChip[];
  likerPetId: number | null;
  setActiveDiscoverFilters: (f: Record<string, unknown> | null) => void;
  setDiscoverMode: (mode: DiscoverMode) => Promise<void>;
  loadMyPetsForLike: () => Promise<void>;
  setLikerPetId: (id: number) => Promise<void>;
  loadPets: (filters?: any) => Promise<void>;
  likePet: (petId: number, opts?: { isSuperLike?: boolean }) => Promise<void>;
  dislikePet: (petId: number) => Promise<void>;
  nextPet: () => void;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  currentIndex: 0,
  loading: false,
  activeDiscoverFilters: null,
  discoverMode: 'playmate',
  myPetsForLike: [],
  likerPetId: null,

  setActiveDiscoverFilters: (f) => set({ activeDiscoverFilters: f }),

  setDiscoverMode: async (mode) => {
    set({ discoverMode: mode });
    await mergeAndSavePreferences({ discoverMode: mode }).catch(() => {});
    const base = get().activeDiscoverFilters || {};
    const next = { ...base, mode };
    set({ activeDiscoverFilters: next });
    await get().loadPets(next);
  },

  loadMyPetsForLike: async () => {
    try {
      const list = (await petsService.getMyPets()) as MyPetChip[];
      const playmateChips = Array.isArray(list)
        ? list
            .filter((p) => p.purpose === 'playmate' && !p.isAdopted)
            .map((p) => ({
              id: p.id,
              name: p.name,
              purpose: p.purpose,
              isAdopted: p.isAdopted,
              photos: p.photos,
            }))
        : [];
      const me = await userRepository.getCurrentUser();
      const prefs = (me?.profile?.preferences as Record<string, unknown> | undefined) ?? {};
      const savedMode = prefs.discoverMode as DiscoverMode | undefined;
      const discoverMode: DiscoverMode =
        savedMode === 'adoption' || savedMode === 'playmate' ? savedMode : 'playmate';
      const saved = prefs.activeLikerPetId as number | undefined;
      const validSaved = saved && playmateChips.some((c) => c.id === saved) ? saved : null;
      const chosen = validSaved ?? playmateChips[0]?.id ?? null;
      set({
        myPetsForLike: playmateChips,
        likerPetId: chosen,
        discoverMode,
      });
    } catch {
      set({ myPetsForLike: [], likerPetId: null });
    }
  },

  setLikerPetId: async (id: number) => {
    set({ likerPetId: id });
    await mergeAndSavePreferences({ activeLikerPetId: id }).catch(() => {});
  },

  loadPets: async (filters) => {
    set({ loading: true });
    try {
      const mode = get().discoverMode;
      const resolved =
        filters !== undefined ? filters : get().activeDiscoverFilters || undefined;
      const withMode = { ...(resolved || {}), mode };
      const pets = await petRepository.findAll(withMode);
      set({ pets: pets || [], currentIndex: 0, loading: false, activeDiscoverFilters: withMode });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  likePet: async (petId: number, opts?: { isSuperLike?: boolean }) => {
    try {
      const mode = get().discoverMode;
      const liker = get().likerPetId;
      await petRepository.likePet(petId, {
        ...opts,
        ...(mode === 'playmate' && liker != null ? { likerPetId: liker } : {}),
      });
      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      throw error;
    }
  },

  dislikePet: async (petId: number) => {
    try {
      const mode = get().discoverMode;
      const liker = get().likerPetId;
      await petRepository.dislikePet(
        petId,
        mode === 'playmate' && liker != null ? { dislikerPetId: liker } : {},
      );
      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      throw error;
    }
  },

  nextPet: () => {
    set((state) => ({ currentIndex: state.currentIndex + 1 }));
  },
}));
