import api from './api';

export const veterinariansService = {
  async getNearby(latitude: number, longitude: number, radius?: number) {
    const response = await api.get('/veterinarians/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },

  async getClinic(id: number) {
    const response = await api.get(`/veterinarians/${id}`);
    return response.data;
  },
};

