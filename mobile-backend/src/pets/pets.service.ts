import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { Pet } from '../database/entities/pet.entity';
import { PetFavorite } from '../database/entities/pet-favorite.entity';
import { PetPhoto } from '../database/entities/pet-photo.entity';
import { Temperament } from '../database/entities/temperament.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class PetsService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(ownerId: number, createPetDto: CreatePetDto) {
    const { temperaments: temperamentNames, ...petData } = createPetDto;
    
    return this.entityManager.transaction(async (manager) => {
      const pet = manager.create(Pet, {
        ...petData,
        ownerId,
      });

      const savedPet = await manager.save(pet);

      // Handle temperaments
      if (temperamentNames && temperamentNames.length > 0) {
        const temperaments = await manager.find(Temperament, {
          where: { name: In(temperamentNames) },
        });

        savedPet.temperaments = temperaments;
        await manager.save(savedPet);
      }

      return this.findOne(savedPet.id);
    });
  }

  async findOne(id: number) {
    const pet = await this.entityManager.findOne(Pet, {
      where: { id },
      // `owner` relation is intentionally omitted here to avoid UUID-cast
      // failures caused by legacy/inconsistent owner references on old pets.
      // Pet detail screens currently require photos + temperaments only.
      relations: { photos: true, temperaments: true },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    return pet;
  }

  async findByOwner(ownerId: number) {
    return this.entityManager.find(Pet, {
      where: { ownerId, isActive: true },
      relations: { photos: true, temperaments: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, ownerId: number, updatePetDto: UpdatePetDto) {
    return this.entityManager.transaction(async (manager) => {
      const pet = await manager.findOne(Pet, {
        where: { id },
        relations: { temperaments: true },
      });

      if (!pet) {
        throw new NotFoundException('Pet not found');
      }

      if (pet.ownerId !== ownerId) {
        throw new ForbiddenException('You can only update your own pets');
      }

      Object.assign(pet, updatePetDto);

      if (updatePetDto.temperaments) {
        const temperaments = await manager.find(Temperament, {
          where: { name: In(updatePetDto.temperaments) },
        });
        pet.temperaments = temperaments;
      }

      await manager.save(pet);

      return this.findOne(id);
    });
  }

  async remove(id: number, ownerId: number) {
    const pet = await this.entityManager.findOne(Pet, {
      where: { id },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own pets');
    }

    await this.entityManager.remove(pet);
  }

  async addPhoto(petId: number, ownerId: number, file: Express.Multer.File, isMain?: boolean) {
    return this.entityManager.transaction(async (manager) => {
      const pet = await manager.findOne(Pet, {
        where: { id: petId },
      });

      if (!pet) {
        throw new NotFoundException('Pet not found');
      }

      if (pet.ownerId !== ownerId) {
        throw new ForbiddenException('You can only add photos to your own pets');
      }

      const url = await this.uploadsService.uploadFile(file);

      if (isMain) {
        // Unset other main photos
        await manager.update(
          PetPhoto,
          { petId },
          { isMain: false },
        );
      }

      const photo = manager.create(PetPhoto, {
        petId,
        url,
        isMain: isMain || false,
        order: 0,
      });

      return manager.save(photo);
    });
  }

  async removePhoto(photoId: number, ownerId: number) {
    const photo = await this.entityManager.findOne(PetPhoto, {
      where: { id: photoId },
      relations: { pet: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.pet.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete photos from your own pets');
    }

    await this.entityManager.remove(photo);
  }

  async listFavorites(userId: number) {
    const rows = await this.entityManager.find(PetFavorite, {
      where: { userId },
      relations: { pet: { photos: true, owner: true } },
      order: { createdAt: 'DESC' },
    });
    return {
      pets: rows
        .filter((r) => r.pet && r.pet.isActive)
        .map((r) => ({
          id: r.pet.id,
          name: r.pet.name,
          breed: r.pet.breed,
          age: r.pet.age,
          gender: r.pet.gender,
          species: r.pet.species,
          bio: r.pet.bio,
          photos: r.pet.photos,
          owner: r.pet.owner
            ? {
                id: r.pet.owner.id,
                firstName: r.pet.owner.firstName,
                lastName: r.pet.owner.lastName,
              }
            : null,
          favoritedAt: r.createdAt,
        })),
    };
  }

  async addFavorite(userId: number, petId: number) {
    const pet = await this.entityManager.findOne(Pet, { where: { id: petId } });
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }
    if (pet.ownerId === userId) {
      throw new ForbiddenException('Cannot favorite your own pet');
    }
    const existing = await this.entityManager.findOne(PetFavorite, {
      where: { userId, petId },
    });
    if (existing) {
      return { success: true, petId };
    }
    await this.entityManager.save(
      this.entityManager.create(PetFavorite, { userId, petId }),
    );
    return { success: true, petId };
  }

  async removeFavorite(userId: number, petId: number) {
    await this.entityManager.delete(PetFavorite, { userId, petId });
    return { success: true };
  }
}

