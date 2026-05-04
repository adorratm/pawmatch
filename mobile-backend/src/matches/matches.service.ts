import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { Match } from '../database/entities/match.entity';
import { MatchLike } from '../database/entities/match-like.entity';
import { MatchDislike } from '../database/entities/match-dislike.entity';
import { Pet } from '../database/entities/pet.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { NotificationsService } from '../notifications/notifications.service';
import type { LikePetDto } from './dto/like-pet.dto';
import {
  GOLD_SUPER_LIKE_WEEKLY,
  mondayUtcWeekKey,
  calendarUtcWeeksElapsedSinceSignup,
  type PatiSubscriptionPrefs,
  resolveGoldFromPreferences,
} from '../common/pati-subscription.util';

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
      .leftJoinAndSelect('owner.profile', 'ownerProfile')
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
    if (filters.minAge != null) {
      query.andWhere('pet.age >= :minAge', { minAge: filters.minAge });
    }
    if (filters.maxAge != null) {
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

    let petsWithDistance = pets.map((pet) => {
      let distance = null as number | null;
      if (filters.latitude && filters.longitude && pet.owner?.locations?.length) {
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

    const ownerGoldBoost = (pet: Pet & { distance?: number | null }) =>
      pet.owner?.profile?.preferences
        ? resolveGoldFromPreferences(pet.owner.profile.preferences as Record<string, unknown>)
        : false;

    if (filters.latitude && filters.longitude) {
      petsWithDistance.sort((a, b) => {
        const ga = ownerGoldBoost(a as Pet & { distance?: number | null });
        const gb = ownerGoldBoost(b as Pet & { distance?: number | null });
        if (ga !== gb) return ga ? -1 : 1;
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    } else {
      petsWithDistance.sort((a, b) => {
        const ga = ownerGoldBoost(a as Pet & { distance?: number | null });
        const gb = ownerGoldBoost(b as Pet & { distance?: number | null });
        if (ga !== gb) return ga ? -1 : 1;
        return 0;
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
        owner: pet.owner
          ? {
              id: pet.owner.id,
              firstName: pet.owner.firstName,
              lastName: pet.owner.lastName,
              locations: (pet.owner.locations || []).map((loc: any) => ({
                latitude: parseFloat(String(loc.latitude)),
                longitude: parseFloat(String(loc.longitude)),
                isCurrent: loc.isCurrent,
              })),
            }
          : null,
        distance: pet.distance != null ? Math.round(pet.distance * 10) / 10 : null,
        matchScore: 98,
      })),
      hasMore: pets.length === (filters.limit || 20),
    };
  }

  async like(petId: number, userId: number, dto?: LikePetDto) {
    return this.entityManager.transaction(async (manager) => {
      const likedPet = await manager.findOne(Pet, {
        where: { id: petId },
        relations: ['owner'],
      });

      if (!likedPet) {
        throw new NotFoundException('Pet not found');
      }

      const userPets = await manager.find(Pet, {
        where: { ownerId: userId, isActive: true },
        order: { createdAt: 'ASC' },
      });

      if (userPets.length === 0) {
        throw new NotFoundException('You need to have at least one pet');
      }

      let likerPet = userPets[0];
      if (dto?.likerPetId != null) {
        const chosen = userPets.find((p) => p.id === dto.likerPetId);
        if (!chosen) {
          throw new ForbiddenException('Geçersiz hayvan profili');
        }
        likerPet = chosen;
      }
      const likerPetId = likerPet.id;

      const isSuperLike = dto?.isSuperLike === true;
      if (isSuperLike) {
        await this.assertSuperlikeAllowed(manager, userId);
      }

      const existingLike = await manager.findOne(MatchLike, {
        where: { likerPetId, likedPetId: petId },
      });

      if (existingLike) {
        return { isMatch: false };
      }

      const like = manager.create(MatchLike, {
        likerPetId,
        likedPetId: petId,
        isSuperLike,
      });
      const savedLike = await manager.save(like);

      if (isSuperLike) {
        await this.incrementSuperlikeUsage(manager, userId);
      }

      const mutualLike = await manager.findOne(MatchLike, {
        where: {
          likerPetId: petId,
          likedPetId: likerPetId,
        },
      });

      if (mutualLike) {
        const match = manager.create(Match, {
          pet1Id: likerPetId,
          pet2Id: petId,
          matchedAt: new Date(),
        });
        const savedMatch = await manager.save(match);

        const conversation = manager.create(Conversation, {
          matchId: savedMatch.id,
          pet1Id: likerPetId,
          pet2Id: petId,
        });
        const savedConversation = await manager.save(conversation);

        await this.notificationsService.create({
          userId: likedPet.ownerId,
          type: 'match',
          title: 'Yeni Eşleşme!',
          body: `${likerPet.name} ile eşleştiniz!`,
          data: { matchId: savedMatch.id, conversationId: savedConversation.id },
        });

        return {
          isMatch: true,
          matchId: savedMatch.id,
          conversationId: savedConversation.id,
        };
      }

      if (likedPet.ownerId !== userId) {
        await this.notificationsService.create({
          userId: likedPet.ownerId,
          type: 'like',
          title: 'Yeni beğeni',
          body: `${likerPet.name}, ${likedPet.name} profilini beğendi.`,
          data: {
            matchLikeId: savedLike.id,
            likerPetId,
            likedPetId: petId,
            isSuperLike,
          },
        });
      }

      return { isMatch: false };
    });
  }

  async dislike(petId: number, userId: number, dislikerPetId?: number) {
    return this.entityManager.transaction(async (manager) => {
      const userPets = await manager.find(Pet, {
        where: { ownerId: userId, isActive: true },
        order: { createdAt: 'ASC' },
      });

      if (userPets.length === 0) {
        throw new NotFoundException('You need to have at least one pet');
      }

      let dislikerPet = userPets[0];
      if (dislikerPetId != null) {
        const chosen = userPets.find((p) => p.id === dislikerPetId);
        if (!chosen) {
          throw new ForbiddenException('Geçersiz hayvan profili');
        }
        dislikerPet = chosen;
      }
      const dpId = dislikerPet.id;

      const existingDislike = await manager.findOne(MatchDislike, {
        where: { dislikerPetId: dpId, dislikedPetId: petId },
      });

      if (existingDislike) {
        return { success: true };
      }

      const dislike = manager.create(MatchDislike, {
        dislikerPetId: dpId,
        dislikedPetId: petId,
      });
      await manager.save(dislike);

      return { success: true };
    });
  }

  async unmatchByTargetPet(targetPetId: number, userId: number) {
    return this.entityManager.transaction(async (manager) => {
      const userPets = await manager.find(Pet, {
        where: { ownerId: userId, isActive: true },
      });
      const userPetIds = userPets.map((p) => p.id);
      if (userPetIds.length === 0) {
        throw new NotFoundException('You need to have at least one pet');
      }

      const match = await manager.findOne(Match, {
        where: [
          { pet1Id: In(userPetIds), pet2Id: targetPetId, isActive: true },
          { pet2Id: In(userPetIds), pet1Id: targetPetId, isActive: true },
        ],
        relations: ['conversation'],
      });

      if (!match) {
        throw new NotFoundException('Eşleşme bulunamadı');
      }

      match.isActive = false;
      await manager.save(match);

      if (match.conversation) {
        match.conversation.isActive = false;
        await manager.save(match.conversation);
      } else if (match.id) {
        const conv = await manager.findOne(Conversation, { where: { matchId: match.id } });
        if (conv) {
          conv.isActive = false;
          await manager.save(conv);
        }
      }

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
        const otherPet = userPetIds.includes(match.pet1Id) ? match.pet2 : match.pet1;
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

  /**
   * Hayvanlarımı beğenenler (karşılıklı eşleşme oluşmamış tek yönlü beğeniler).
   * Pati Gold: tümü görünür. Ücretsiz: Pazartesi UTC takvim haftasına göre kümülatif +1 profil / hafta.
   */
  async getIncomingLikes(userId: number) {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const gold = resolveGoldFromPreferences(
      (user.profile?.preferences ?? {}) as Record<string, unknown>,
    );

    const myPets = await this.entityManager.find(Pet, {
      where: { ownerId: userId, isActive: true },
    });
    const myPetIds = myPets.map((p) => p.id);
    if (myPetIds.length === 0) {
      return {
        isGold: gold,
        visibleSlots: 0,
        total: 0,
        weeksElapsedCalendarUtc: 0,
        anchorWeekMondayUtc: mondayUtcWeekKey(new Date(user.createdAt)),
        currentWeekMondayUtc: mondayUtcWeekKey(),
        items: [] as any[],
      };
    }

    const likes = await this.entityManager.find(MatchLike, {
      where: { likedPetId: In(myPetIds) },
      relations: ['likerPet', 'likerPet.photos', 'likerPet.owner', 'likedPet', 'likedPet.photos'],
      order: { createdAt: 'ASC' },
    });

    const activeMatches = await this.entityManager.find(Match, {
      where: [
        { pet1Id: In(myPetIds), isActive: true },
        { pet2Id: In(myPetIds), isActive: true },
      ],
    });
    const pairKey = (a: number, b: number) => `${Math.min(a, b)}_${Math.max(a, b)}`;
    const matchedPairs = new Set(activeMatches.map((m) => pairKey(m.pet1Id, m.pet2Id)));

    const incoming = likes.filter(
      (l) => !matchedPairs.has(pairKey(l.likerPetId, l.likedPetId)),
    );

    const weeksElapsedCalendarUtc = calendarUtcWeeksElapsedSinceSignup(
      new Date(user.createdAt),
      new Date(),
    );
    const visibleSlots = gold
      ? incoming.length
      : Math.min(incoming.length, Math.max(1, weeksElapsedCalendarUtc + 1));

    const mapLikerPublic = (pet: Pet) => ({
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      species: pet.species,
      photos: pet.photos,
      owner: pet.owner
        ? {
            id: pet.owner.id,
            firstName: pet.owner.firstName,
            lastName: pet.owner.lastName,
          }
        : undefined,
    });

    const mapMyPetMin = (pet: Pet) => ({
      id: pet.id,
      name: pet.name,
      photos: pet.photos,
    });

    return {
      isGold: gold,
      visibleSlots,
      total: incoming.length,
      weeksElapsedCalendarUtc,
      anchorWeekMondayUtc: mondayUtcWeekKey(new Date(user.createdAt)),
      currentWeekMondayUtc: mondayUtcWeekKey(),
      items: incoming.map((like, index) => {
        const visible = gold || index < visibleSlots;
        return {
          id: like.id,
          createdAt: like.createdAt,
          visible,
          isSuperLike: like.isSuperLike,
          myPet: mapMyPetMin(like.likedPet),
          likerPet: visible ? mapLikerPublic(like.likerPet) : { id: like.likerPetId, hidden: true },
        };
      }),
    };
  }

  private async assertSuperlikeAllowed(manager: EntityManager, likerUserId: number): Promise<void> {
    const user = await manager.findOne(User, {
      where: { id: likerUserId },
      relations: ['profile'],
    });
    const prefs = (user?.profile?.preferences ?? {}) as Record<string, unknown>;
    if (!resolveGoldFromPreferences(prefs)) {
      throw new ForbiddenException('Süper beğeni için Pati Gold gerekir');
    }
    const pati = (prefs.patiSubscription ?? {}) as PatiSubscriptionPrefs;
    const weekKey = mondayUtcWeekKey();
    let used = typeof pati.superlikesUsedInWeek === 'number' ? pati.superlikesUsedInWeek : 0;
    if (pati.usageWeekKey !== weekKey) {
      used = 0;
    }
    if (used >= GOLD_SUPER_LIKE_WEEKLY) {
      throw new ForbiddenException('Haftalık süper beğeni hakkın doldu');
    }
  }

  private async incrementSuperlikeUsage(manager: EntityManager, likerUserId: number): Promise<void> {
    const user = await manager.findOne(User, {
      where: { id: likerUserId },
      relations: ['profile'],
    });
    if (!user) return;

    if (!user.profile) {
      user.profile = manager.create(UserProfile, { userId: likerUserId, preferences: {} });
      await manager.save(user.profile);
    }

    const prefs = { ...(user.profile.preferences || {}) } as Record<string, unknown>;
    const weekKey = mondayUtcWeekKey();
    const pati = { ...((prefs.patiSubscription as PatiSubscriptionPrefs) || {}) };
    if (pati.usageWeekKey !== weekKey) {
      pati.usageWeekKey = weekKey;
      pati.superlikesUsedInWeek = 0;
    }
    pati.superlikesUsedInWeek = (pati.superlikesUsedInWeek || 0) + 1;
    prefs.patiSubscription = pati;
    user.profile.preferences = prefs;
    await manager.save(user.profile);
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
