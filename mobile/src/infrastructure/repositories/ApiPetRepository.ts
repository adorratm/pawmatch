import { IPetRepository } from '@/domain/repositories/IPetRepository';
import { Pet } from '@/domain/entities/Pet';
import api from '@/infrastructure/api/api';

export class ApiPetRepository implements IPetRepository {
  async findAll(filters?: any): Promise<Pet[]> {
    const response = await api.get('/pets', { params: filters });
    return (response.data || []).map((json: any) => Pet.fromJSON(json));
  }

  async findById(id: number): Promise<Pet | null> {
    const response = await api.get(`/pets/${id}`);
    return response.data ? Pet.fromJSON(response.data) : null;
  }

  async likePet(id: number): Promise<void> {
    await api.post(`/pets/${id}/like`);
  }

  async dislikePet(id: number): Promise<void> {
    await api.post(`/pets/${id}/dislike`);
  }
}

export const petRepository = new ApiPetRepository();
