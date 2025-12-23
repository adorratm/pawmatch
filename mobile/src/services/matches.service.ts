import api from './api';

export const matchesService = {
  async discover(filters: any) {
    const response = await api.get('/matches/discover', { params: filters });
    return response.data;
  },

  async like(petId: number) {
    const response = await api.post(`/matches/${petId}/like`);
    return response.data;
  },

  async dislike(petId: number) {
    const response = await api.post(`/matches/${petId}/dislike`);
    return response.data;
  },

  async getMatches() {
    const response = await api.get('/matches');
    return response.data;
  },
};


