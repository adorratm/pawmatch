import { Pet } from '@/domain/entities/Pet';

export interface IPetRepository {
  findAll(filters?: any): Promise<Pet[]>;
  findById(id: number): Promise<Pet | null>;
  likePet(id: number, opts?: { isSuperLike?: boolean; likerPetId?: number }): Promise<void>;
  dislikePet(id: number, opts?: { dislikerPetId?: number }): Promise<void>;
}
