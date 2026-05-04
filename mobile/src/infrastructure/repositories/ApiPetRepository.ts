import { IPetRepository } from '@/domain/repositories/IPetRepository';
import { Pet } from '@/domain/entities/Pet';
import api from '@/infrastructure/api/api';

export class ApiPetRepository implements IPetRepository {
  async findAll(filters?: any): Promise<Pet[]> {
    const response = await api.get('/matches/discover', { params: filters });
    const list = response.data?.pets ?? [];
    return list.map((json: any) =>
      Pet.fromJSON({
        ...json,
        type: json.type ?? json.species ?? '',
        breed: json.breed ?? '',
        bio: json.bio ?? '',
      }),
    );
  }

  async findById(id: number): Promise<Pet | null> {
    const response = await api.get(`/pets/${id}`);
    return response.data ? Pet.fromJSON(response.data) : null;
  }

  async likePet(
    id: number,
    opts?: { isSuperLike?: boolean; likerPetId?: number },
  ): Promise<void> {
    await api.post(`/matches/${id}/like`, opts ?? {});
  }

  async dislikePet(id: number, opts?: { dislikerPetId?: number }): Promise<void> {
    await api.post(`/matches/${id}/dislike`, opts ?? {});
  }
}

export const petRepository = new ApiPetRepository();
