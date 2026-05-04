import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { Match } from '../database/entities/match.entity';
import { MatchLike } from '../database/entities/match-like.entity';
import { MatchDislike } from '../database/entities/match-dislike.entity';
import { Pet } from '../database/entities/pet.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MatchesService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly notificationsService: NotificationsService,
  ) {}

  async discover(userId: number, filters: any) {
    const userPets = await this.entityManager.find(Pet, {
      where: { ownerId: userId, isActive: true },
    });

    const userPetIds = userPets.map((p) => p.id);

    let excludedPetIds: number[] = [];
    if (userPetIds.length > 0) {
      const likedPets = await this.entityManager.find(MatchLike, {
        where: { likerPetId: In(userPetIds) },
      });
      const dislikedPets = await this.entityManager.find(MatchDislike, {
        where: { dislikerPetId: In(userPetIds) },
      });
      excludedPetIds = [
        ...likedPets.map((l) => l.likedPetId),
        ...dislikedPets.map((d) => d.dislikedPetId),
      ];
    }

    const isAdoptedFilter = filters.mode === 'adoption';

    const query = this.entityManager
      .createQueryBuilder(Pet, 'pet')
      .leftJoinAndSelect('pet.photos', 'photos')
      .leftJoinAndSelect('pet.owner', 'owner')
      .leftJoinAndSelect('owner.locations', 'locations')
      .leftJoinAndSelect('pet.temperaments', 'temperaments')
      .where('pet.isActive = :isActive', { isActive: true })
      .andWhere('pet.isAdopted = :isAdopted', { isAdopted: isAdoptedFilter })
      .andWhere('pet.ownerId != :discoverUserId', { discoverUserId: userId });

    if (excludedPetIds.length > 0) {
      query.andWhere('pet.id NOT IN (:...excludedIds)', { excludedIds: excludedPetIds });
    }

    if (filters.species) {
      query.andWhere('pet.species = :species', { species: filters.species });
    }
    if (filters.minAge) {
      query.andWhere('pet.age >= :minAge', { minAge: filters.minAge });
    }
    if (filters.maxAge) {
      query.andWhere('pet.age <= :maxAge', { maxAge: filters.maxAge });
    }
    if (filters.gender) {
      query.andWhere('pet.gender = :gender', { gender: filters.gender });
    }
    if (filters.isVaccinated) {
      query.andWhere('pet.isVaccinated = :isVaccinated', { isVaccinated: true });
    }
    if (filters.isSpayed) {
      query.andWhere('pet.isSpayed = :isSpayed', { isSpayed: true });
    }

    const pets = await query
      .orderBy('pet.createdAt', 'DESC')
      .limit(filters.limit || 20)
      .getMany();

    // Calculate distance if location provided
    let petsWithDistance = pets.map((pet) => {
      let distance = null;
      if (filters.latitude && filters.longitude && pet.owner?.locations?.length > 0) {
        const ownerLocation = pet.owner.locations.find((loc) => loc.isCurrent) || pet.owner.locations[0];
        if (ownerLocation) {
          distance = this.calculateDistance(
            filters.latitude,
            filters.longitude,
            parseFloat(ownerLocation.latitude.toString()),
            parseFloat(ownerLocation.longitude.toString()),
          );
        }
      }
      return { ...pet, distance };
    });

    // Sort by distance if location provided
    if (filters.latitude && filters.longitude) {
      petsWithDistance.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    if (
      filters.latitude != null &&
      filters.longitude != null &&
      filters.radius != null &&
      filters.radius > 0
    ) {
      petsWithDistance = petsWithDistance.filter(
        (pet) => pet.distance !== null && pet.distance <= filters.radius,
      );
    }

    return {
      pets: petsWithDistance.map((pet: any) => ({
        id: pet.id,
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        species: pet.species,
        bio: pet.bio,
        photos: pet.photos,
        owner: pet.owner ? {
          id: pet.owner.id,
          firstName: pet.owner.firstName,
          lastName: pet.owner.lastName,
        } : null,
        distance: pet.distance ? Math.round(pet.distance * 10) / 10 : null, // Round to 1 decimal
        matchScore: 98, // Calculate match score
      })),
      hasMore: pets.length === (filters.limit || 20),
    };
  }

  async like(petId: number, userId: number) {
    return this.entityManager.transaction(async (manager) => {
      const likedPet = await manager.findOne(Pet, {
        where: { id: petId },
        relations: ['owner'],
      });

      if (!likedPet) {
        throw new NotFoundException('Pet not found');
      }

      // Get user's pets
      const userPets = await manager.find(Pet, {
        where: { ownerId: userId },
      });

      if (userPets.length === 0) {
        throw new NotFoundException('You need to have at least one pet');
      }

      const likerPetId = userPets[0].id;

      // Check if already liked
      const existingLike = await manager.findOne(MatchLike, {
        where: { likerPetId, likedPetId: petId },
      });

      if (existingLike) {
        return { isMatch: false };
      }

      // Create like
      const like = manager.create(MatchLike, {
        likerPetId,
        likedPetId: petId,
      });
      await manager.save(like);

      // Check for mutual like (match)
      const mutualLike = await manager.findOne(MatchLike, {
        where: {
          likerPetId: petId,
          likedPetId: likerPetId,
        },
      });

      if (mutualLike) {
        // Create match
        const match = manager.create(Match, {
          pet1Id: likerPetId,
          pet2Id: petId,
          matchedAt: new Date(),
        });
        const savedMatch = await manager.save(match);

        // Create conversation
        const conversation = manager.create(Conversation, {
          matchId: savedMatch.id,
          pet1Id: likerPetId,
          pet2Id: petId,
        });
        const savedConversation = await manager.save(conversation);

        // Send notifications
        await this.notificationsService.create({
          userId: likedPet.ownerId,
          type: 'match',
          title: 'Yeni Eşleşme!',
          body: `${userPets[0].name} ile eşleştiniz!`,
          data: { matchId: savedMatch.id, conversationId: savedConversation.id },
        });

        return {
          isMatch: true,
          matchId: savedMatch.id,
          conversationId: savedConversation.id,
        };
      }

      return { isMatch: false };
    });
  }

  async dislike(petId: number, userId: number) {
    return this.entityManager.transaction(async (manager) => {
      const userPets = await manager.find(Pet, {
        where: { ownerId: userId },
      });

      if (userPets.length === 0) {
        throw new NotFoundException('You need to have at least one pet');
      }

      const dislikerPetId = userPets[0].id;

      // Check if already disliked
      const existingDislike = await manager.findOne(MatchDislike, {
        where: { dislikerPetId, dislikedPetId: petId },
      });

      if (existingDislike) {
        return { success: true };
      }

      // Create dislike
      const dislike = manager.create(MatchDislike, {
        dislikerPetId,
        dislikedPetId: petId,
      });
      await manager.save(dislike);

      return { success: true };
    });
  }

  async getUserMatches(userId: number) {
    const userPets = await this.entityManager.find(Pet, {
      where: { ownerId: userId },
    });

    if (userPets.length === 0) {
      return { matches: [] };
    }

    const userPetIds = userPets.map((p) => p.id);

    const matches = await this.entityManager.find(Match, {
      where: [
        { pet1Id: In(userPetIds), isActive: true },
        { pet2Id: In(userPetIds), isActive: true },
      ],
      relations: ['pet1', 'pet2', 'pet1.photos', 'pet2.photos', 'conversation'],
      order: { matchedAt: 'DESC' },
    });

    return {
      matches: matches.map((match) => {
        const otherPet = match.pet1Id === userPetIds[0] ? match.pet2 : match.pet1;
        return {
          id: match.id,
          pet: {
            id: otherPet.id,
            name: otherPet.name,
            photos: otherPet.photos,
          },
          matchedAt: match.matchedAt,
          conversationId: match.conversation?.id,
        };
      }),
    };
  }

  // Haversine formula to calculate distance between two coordinates
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
