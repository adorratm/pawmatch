import api from '@/infrastructure/api/api';
import { appendImageFile } from '@/infrastructure/api/imageUpload';

export const petsService = {
  async getMyPets() {
    const response = await api.get('/pets/my-pets');
    return response.data;
  },

  async getPet(id: number) {
    const response = await api.get(`/pets/${id}`);
    return response.data;
  },

  async createPet(data: any) {
    const response = await api.post('/pets', data);
    return response.data;
  },

  async updatePet(id: number, data: any) {
    const response = await api.put(`/pets/${id}`, data);
    return response.data;
  },

  async deletePet(id: number) {
    await api.delete(`/pets/${id}`);
  },

  async uploadPhoto(petId: number, fileUri: string, isMain?: boolean) {
    const formData = new FormData();
    await appendImageFile(formData, fileUri);
    if (isMain) {
      formData.append('isMain', 'true');
    }
    const response = await api.post(`/pets/${petId}/photos`, formData);
    return response.data;
  },
};


