import { create } from 'zustand';
import { usersService } from '@/infrastructure/api/users.service';

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profile?: {
    bio?: string;
    avatar?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    district?: string;
  };
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  updateLocation: (data: any) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  loading: false,

  loadProfile: async () => {
    set({ loading: true });
    try {
      const data = await usersService.getMe();
      set({ profile: data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateProfile: async (data: any) => {
    try {
      const updated = await usersService.updateProfile(data);
      set({ profile: updated });
    } catch (error) {
      throw error;
    }
  },

  updateLocation: async (data: any) => {
    try {
      await usersService.updateLocation(data);
      const profile = await usersService.getMe();
      set({ profile });
    } catch (error) {
      throw error;
    }
  },
}));

