import { create } from 'zustand';
import { matchesService } from '../services/matches.service';

interface Pet {
  id: number;
  name: string;
  photos?: any[];
  distance?: number;
  matchScore?: number;
}

interface PetState {
  pets: Pet[];
  currentIndex: number;
  loading: boolean;
  loadPets: (filters?: any) => Promise<void>;
  likePet: (petId: number) => Promise<{ isMatch: boolean; matchId?: number }>;
  dislikePet: (petId: number) => Promise<void>;
  nextPet: () => void;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  currentIndex: 0,
  loading: false,

  loadPets: async (filters) => {
    set({ loading: true });
    try {
      const data = await matchesService.discover(filters);
      set({ pets: data.pets || [], currentIndex: 0, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  likePet: async (petId: number) => {
    try {
      const result = await matchesService.like(petId);
      set((state) => ({ currentIndex: state.currentIndex + 1 }));
      return result;
    } catch (error) {
      throw error;
    }
  },

  dislikePet: async (petId: number) => {
    try {
      await matchesService.dislike(petId);
      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      throw error;
    }
  },

  nextPet: () => {
    set((state) => ({ currentIndex: state.currentIndex + 1 }));
  },
}));

