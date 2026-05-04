import api from '@/infrastructure/api/api';

export const favoritesService = {
  async list() {
    const { data } = await api.get<{ pets: any[] }>('/pets/favorites');
    return data.pets ?? [];
  },

  async add(petId: number) {
    const { data } = await api.post(`/pets/favorites/${petId}`);
    return data;
  },

  async remove(petId: number) {
    const { data } = await api.delete(`/pets/favorites/${petId}`);
    return data;
  },
};
