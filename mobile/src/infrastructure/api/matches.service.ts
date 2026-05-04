import api from '@/infrastructure/api/api';

export const matchesService = {
  async discover(filters: any) {
    const response = await api.get('/matches/discover', { params: filters });
    return response.data;
  },

  async like(
    petId: number,
    body?: { isSuperLike?: boolean; likerPetId?: number },
  ) {
    const response = await api.post(`/matches/${petId}/like`, body ?? {});
    return response.data;
  },

  async dislike(petId: number, body?: { dislikerPetId?: number }) {
    const response = await api.post(`/matches/${petId}/dislike`, body ?? {});
    return response.data;
  },

  async unmatchByPet(targetPetId: number) {
    const response = await api.post(`/matches/unmatch-by-pet/${targetPetId}`);
    return response.data;
  },

  async getMatches() {
    const response = await api.get('/matches');
    return response.data;
  },

  async getIncomingLikes() {
    const response = await api.get('/matches/incoming-likes');
    return response.data;
  },
};


