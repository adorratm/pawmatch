import api from './api';

export const petsService = {
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

  async uploadPhoto(petId: number, file: any, isMain?: boolean) {
    const formData = new FormData();
    formData.append('file', file);
    if (isMain) {
      formData.append('isMain', 'true');
    }
    const response = await api.post(`/pets/${petId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};


