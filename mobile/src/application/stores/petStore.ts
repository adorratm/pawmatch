import { create } from 'zustand';
import { Pet } from '@/domain/entities/Pet';
import { petRepository } from '@/infrastructure/repositories/ApiPetRepository';

interface PetState {
  pets: Pet[];
  currentIndex: number;
  loading: boolean;
  activeDiscoverFilters: Record<string, unknown> | null;
  setActiveDiscoverFilters: (f: Record<string, unknown> | null) => void;
  loadPets: (filters?: any) => Promise<void>;
  likePet: (petId: number) => Promise<void>;
  dislikePet: (petId: number) => Promise<void>;
  nextPet: () => void;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  currentIndex: 0,
  loading: false,
  activeDiscoverFilters: null,

  setActiveDiscoverFilters: (f) => set({ activeDiscoverFilters: f }),

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

  likePet: async (petId: number) => {
    try {
      await petRepository.likePet(petId);
      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      throw error;
    }
  },

  dislikePet: async (petId: number) => {
    try {
      await petRepository.dislikePet(petId);
      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      throw error;
    }
  },

  nextPet: () => {
    set((state) => ({ currentIndex: state.currentIndex + 1 }));
  },
}));
