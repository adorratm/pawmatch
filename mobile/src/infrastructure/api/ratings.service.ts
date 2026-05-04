import api from '@/infrastructure/api/api';

export const ratingsService = {
  async rateUser(rateeId: number, rating: number, comment?: string) {
    const { data } = await api.post('/ratings/users', {
      rateeId,
      rating,
      comment: comment || undefined,
    });
    return data;
  },

  async listForUser(userId: number) {
    const { data } = await api.get<{ ratings: any[] }>(`/ratings/users/${userId}`);
    return data.ratings ?? [];
  },
};
