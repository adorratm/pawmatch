import { create } from 'zustand';
import { User } from '@/domain/entities/User';
import { userRepository } from '@/infrastructure/repositories/ApiUserRepository';
import { LoginDto, RegisterDto } from '@/domain/repositories/IUserRepository';
import { socketService } from '@/infrastructure/api/socket.service';
import { revenueCatService } from '@/infrastructure/purchases/revenueCat.service';
import { syncPatiSubscriptionToBackendProfile } from '@/infrastructure/api/patiSubscriptionSync';
import {
  registerPushTokenWithBackend,
  unregisterPushTokenFromBackend,
} from '@/infrastructure/push/expoPushRegistration';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { user } = await userRepository.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
      await revenueCatService.logInAppUser(String(user.id));
      await socketService.connect();
      void syncPatiSubscriptionToBackendProfile();
      void registerPushTokenWithBackend();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const { user } = await userRepository.register(data);
      set({ user, isAuthenticated: true, isLoading: false });
      await revenueCatService.logInAppUser(String(user.id));
      await socketService.connect();
      void syncPatiSubscriptionToBackendProfile();
      void registerPushTokenWithBackend();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await unregisterPushTokenFromBackend();
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await revenueCatService.logOutAppUser();
    socketService.disconnect();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const user = await userRepository.getCurrentUser();
        if (user) {
          set({ user, isAuthenticated: true, isLoading: false });
          await revenueCatService.logInAppUser(String(user.id));
          await socketService.connect();
          void syncPatiSubscriptionToBackendProfile();
          void registerPushTokenWithBackend();
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
