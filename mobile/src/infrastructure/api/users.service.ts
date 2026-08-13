import api from '@/infrastructure/api/api';
import { appendImageFile } from '@/infrastructure/api/imageUpload';

export const usersService = {
  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: string;
    preferences?: Record<string, unknown>;
  }) {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  async updateLocation(data: any) {
    const response = await api.post('/users/me/location', data);
    return response.data;
  },

  async uploadAvatar(fileUri: string) {
    const formData = new FormData();
    await appendImageFile(formData, fileUri);
    const response = await api.post('/users/me/avatar', formData);
    return response.data;
  },

  async deleteAccount() {
    await api.delete('/users/me');
  },
};


