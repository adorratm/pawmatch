import { create } from 'zustand';
import { Pet } from '@/domain/entities/Pet';
import { petRepository } from '@/infrastructure/repositories/ApiPetRepository';
import { petsService } from '@/infrastructure/api/pets.service';
import { userRepository } from '@/infrastructure/repositories/ApiUserRepository';
import { mergeAndSavePreferences } from '@/infrastructure/api/userPreferences';

export type MyPetChip = {
  id: number;
  name: string;
  photos?: { url: string }[];
};

interface PetState {
  pets: Pet[];
  currentIndex: number;
  loading: boolean;
  activeDiscoverFilters: Record<string, unknown> | null;
  myPetsForLike: MyPetChip[];
  likerPetId: number | null;
  setActiveDiscoverFilters: (f: Record<string, unknown> | null) => void;
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
  myPetsForLike: [],
  likerPetId: null,

  setActiveDiscoverFilters: (f) => set({ activeDiscoverFilters: f }),

  loadMyPetsForLike: async () => {
    try {
      const list = (await petsService.getMyPets()) as MyPetChip[];
      const chips = Array.isArray(list)
        ? list.map((p) => ({
            id: p.id,
            name: p.name,
            photos: p.photos,
          }))
        : [];
      const me = await userRepository.getCurrentUser();
      const saved = (me?.profile?.preferences as Record<string, unknown> | undefined)
        ?.activeLikerPetId as number | undefined;
      const validSaved = saved && chips.some((c) => c.id === saved) ? saved : null;
      const chosen = validSaved ?? chips[0]?.id ?? null;
      set({ myPetsForLike: chips, likerPetId: chosen });
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
      const resolved =
        filters !== undefined ? filters : get().activeDiscoverFilters || undefined;
      const pets = await petRepository.findAll(resolved);
      set({ pets: pets || [], currentIndex: 0, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  likePet: async (petId: number, opts?: { isSuperLike?: boolean }) => {
    try {
      const liker = get().likerPetId;
      await petRepository.likePet(petId, {
        ...opts,
        ...(liker != null ? { likerPetId: liker } : {}),
      });
      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      throw error;
    }
  },

  dislikePet: async (petId: number) => {
    try {
      const liker = get().likerPetId;
      await petRepository.dislikePet(petId, liker != null ? { dislikerPetId: liker } : {});
      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      throw error;
    }
  },

  nextPet: () => {
    set((state) => ({ currentIndex: state.currentIndex + 1 }));
  },
}));
