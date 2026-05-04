import api from '@/infrastructure/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterDto) {
    const response = await api.post('/auth/register', data);
    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },

  async login(data: LoginDto) {
    const response = await api.post('/auth/login', data);
    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  },

  async refreshToken() {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    const response = await api.post('/auth/refresh', { refreshToken });
    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },

  async googleLogin(payload: {
    idToken?: string;
    accessToken?: string;
    authorizationCode?: string;
    redirectUri?: string;
    codeVerifier?: string;
    clientId?: string;
  }) {
    const response = await api.post('/auth/oauth/google', payload);
    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },

  async facebookLogin(accessToken: string) {
    const response = await api.post('/auth/oauth/facebook', { accessToken });
    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },

  async appleLogin(idToken: string, authorizationCode?: string) {
    const response = await api.post('/auth/oauth/apple', { idToken, authorizationCode });
    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },
};


