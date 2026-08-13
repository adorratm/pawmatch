import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EntityManager, In, IsNull } from 'typeorm';
import { Match } from '../database/entities/match.entity';
import { MatchLike } from '../database/entities/match-like.entity';
import { MatchDislike } from '../database/entities/match-dislike.entity';
import { Pet, PetPurpose } from '../database/entities/pet.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { SubscriptionPlan } from '../database/entities/subscription-plan.entity';
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
    const mode: PetPurpose =
      filters.mode === 'adoption' ? PetPurpose.ADOPTION : PetPurpose.PLAYMATE;

    const userPets = await this.entityManager.find(Pet, {
      where: { ownerId: userId, isActive: true, isAdopted: false },
    });

    const userPetIds = userPets.map((p) => p.id);
    let excludedPetIds: number[] = [];

    if (mode === PetPurpose.PLAYMATE && userPetIds.length > 0) {
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

    if (mode === PetPurpose.ADOPTION) {
      const likedPets = await this.entityManager.find(MatchLike, {
        where: { likerUserId: userId, likerPetId: IsNull() },
      });
      const dislikedPets = await this.entityManager.find(MatchDislike, {
        where: { dislikerUserId: userId, dislikerPetId: IsNull() },
      });
      excludedPetIds = [
        ...likedPets.map((l) => l.likedPetId),
        ...dislikedPets.map((d) => d.dislikedPetId),
      ];
    }

    const query = this.entityManager
      .createQueryBuilder(Pet, 'pet')
      .leftJoinAndSelect('pet.photos', 'photos')
      .leftJoinAndSelect('pet.owner', 'owner')
      .leftJoinAndSelect('owner.locations', 'locations')
      .leftJoinAndSelect('owner.profile', 'ownerProfile')
      .leftJoinAndSelect('pet.temperaments', 'temperaments')
      .where('pet.isActive = :isActive', { isActive: true })
      .andWhere('pet.isAdopted = :isAdopted', { isAdopted: false })
      .andWhere('pet.purpose = :purpose', { purpose: mode })
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
        purpose: pet.purpose,
      })),
      hasMore: pets.length === (filters.limit || 20),
      mode,
    };
  }

  async like(petId: number, userId: number, dto?: LikePetDto) {
    return this.entityManager.transaction(async (manager) => {
      const likedPet = await manager.findOne(Pet, {
        where: { id: petId },
        relations: { owner: true },
      });

      if (!likedPet) {
        throw new NotFoundException('Pet not found');
      }
      if (likedPet.isAdopted || !likedPet.isActive) {
        throw new BadRequestException('Bu pati artık listelenmiyor');
      }
      if (likedPet.ownerId === userId) {
        throw new ForbiddenException('Kendi patini beğenemezsin');
      }

      if (likedPet.purpose === PetPurpose.ADOPTION) {
        return this.likeAdoption(manager, likedPet, userId, dto);
      }

      return this.likePlaymate(manager, likedPet, userId, dto);
    });
  }

  private async likeAdoption(
    manager: EntityManager,
    likedPet: Pet,
    userId: number,
    dto?: LikePetDto,
  ) {
    const isSuperLike = dto?.isSuperLike === true;
    if (isSuperLike) {
      await this.assertSuperlikeAllowed(manager, userId);
    }

    const existingLike = await manager.findOne(MatchLike, {
      where: { likerUserId: userId, likedPetId: likedPet.id, likerPetId: IsNull() },
    });
    if (existingLike) {
      return { isMatch: false };
    }

    const like = manager.create(MatchLike, {
      likerPetId: null,
      likerUserId: userId,
      likedPetId: likedPet.id,
      isSuperLike,
      acceptedAt: null,
    });
    const savedLike = await manager.save(like);

    if (isSuperLike) {
      await this.incrementSuperlikeUsage(manager, userId);
    }

    await this.notificationsService.create({
      userId: likedPet.ownerId,
      type: 'like',
      title: 'Sahiplenme ilgisi',
      body: `${likedPet.name} için yeni bir sahiplenme ilgisi var.`,
      data: {
        matchLikeId: savedLike.id,
        likedPetId: likedPet.id,
        isAdoption: true,
        isSuperLike,
      },
    });

    return { isMatch: false, likeId: savedLike.id };
  }

  private async likePlaymate(
    manager: EntityManager,
    likedPet: Pet,
    userId: number,
    dto?: LikePetDto,
  ) {
    if (likedPet.purpose !== PetPurpose.PLAYMATE) {
      throw new BadRequestException('Bu pati oyun arkadaşı için listelenmiyor');
    }

    const userPets = await manager.find(Pet, {
      where: {
        ownerId: userId,
        isActive: true,
        isAdopted: false,
        purpose: PetPurpose.PLAYMATE,
      },
      order: { createdAt: 'ASC' },
    });

    if (userPets.length === 0) {
      throw new BadRequestException('Oyun arkadaşı için aktif bir patin olmalı');
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
      where: { likerPetId, likedPetId: likedPet.id },
    });
    if (existingLike) {
      return { isMatch: false };
    }

    const like = manager.create(MatchLike, {
      likerPetId,
      likerUserId: userId,
      likedPetId: likedPet.id,
      isSuperLike,
    });
    const savedLike = await manager.save(like);

    if (isSuperLike) {
      await this.incrementSuperlikeUsage(manager, userId);
    }

    const mutualLike = await manager.findOne(MatchLike, {
      where: {
        likerPetId: likedPet.id,
        likedPetId: likerPetId,
      },
    });

    if (mutualLike) {
      const match = manager.create(Match, {
        pet1Id: likerPetId,
        pet2Id: likedPet.id,
        user1Id: userId,
        matchedAt: new Date(),
      });
      const savedMatch = await manager.save(match);

      const conversation = manager.create(Conversation, {
        matchId: savedMatch.id,
        pet1Id: likerPetId,
        pet2Id: likedPet.id,
        user1Id: userId,
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

    await this.notificationsService.create({
      userId: likedPet.ownerId,
      type: 'like',
      title: 'Yeni beğeni',
      body: `${likerPet.name}, ${likedPet.name} profilini beğendi.`,
      data: {
        matchLikeId: savedLike.id,
        likerPetId,
        likedPetId: likedPet.id,
        isSuperLike,
      },
    });

    return { isMatch: false };
  }

  async acceptIncomingLike(likeId: number, ownerUserId: number) {
    return this.entityManager.transaction(async (manager) => {
      const like = await manager.findOne(MatchLike, {
        where: { id: likeId },
        relations: { likedPet: true, likerUser: true, likerPet: true },
      });
      if (!like) {
        throw new NotFoundException('Beğeni bulunamadı');
      }
      if (like.likedPet.ownerId !== ownerUserId) {
        throw new ForbiddenException('Bu beğeniyi kabul edemezsin');
      }
      if (like.likedPet.isAdopted) {
        throw new BadRequestException('Bu pati zaten sahiplendirildi');
      }
      if (like.acceptedAt) {
        throw new BadRequestException('Bu ilgi zaten kabul edildi');
      }

      // Adoption interest (no liker pet)
      if (like.likerPetId == null) {
        if (!like.likerUserId) {
          throw new BadRequestException('Geçersiz sahiplenme ilgisi');
        }

        const existingMatch = await manager.findOne(Match, {
          where: {
            user1Id: like.likerUserId,
            pet2Id: like.likedPetId,
            isActive: true,
          },
        });
        if (existingMatch) {
          const conv = await manager.findOne(Conversation, {
            where: { matchId: existingMatch.id },
          });
          return {
            isMatch: true,
            matchId: existingMatch.id,
            conversationId: conv?.id,
          };
        }

        like.acceptedAt = new Date();
        await manager.save(like);

        const match = manager.create(Match, {
          pet1Id: null,
          pet2Id: like.likedPetId,
          user1Id: like.likerUserId,
          matchedAt: new Date(),
        });
        const savedMatch = await manager.save(match);

        const conversation = manager.create(Conversation, {
          matchId: savedMatch.id,
          pet1Id: null,
          pet2Id: like.likedPetId,
          user1Id: like.likerUserId,
        });
        const savedConversation = await manager.save(conversation);

        await this.notificationsService.create({
          userId: like.likerUserId,
          type: 'match',
          title: 'Sahiplenme eşleşmesi!',
          body: `${like.likedPet.name} için ilgin kabul edildi.`,
          data: { matchId: savedMatch.id, conversationId: savedConversation.id },
        });

        return {
          isMatch: true,
          matchId: savedMatch.id,
          conversationId: savedConversation.id,
        };
      }

      // Playmate: accept by creating reverse like if missing, then match
      const reverse = await manager.findOne(MatchLike, {
        where: {
          likerPetId: like.likedPetId,
          likedPetId: like.likerPetId,
        },
      });
      if (!reverse) {
        await manager.save(
          manager.create(MatchLike, {
            likerPetId: like.likedPetId,
            likedPetId: like.likerPetId!,
            likerUserId: ownerUserId,
            isSuperLike: false,
          }),
        );
      }

      like.acceptedAt = new Date();
      await manager.save(like);

      const match = manager.create(Match, {
        pet1Id: like.likerPetId,
        pet2Id: like.likedPetId,
        user1Id: like.likerUserId,
        matchedAt: new Date(),
      });
      const savedMatch = await manager.save(match);

      const conversation = manager.create(Conversation, {
        matchId: savedMatch.id,
        pet1Id: like.likerPetId,
        pet2Id: like.likedPetId,
        user1Id: like.likerUserId,
      });
      const savedConversation = await manager.save(conversation);

      if (like.likerUserId) {
        await this.notificationsService.create({
          userId: like.likerUserId,
          type: 'match',
          title: 'Yeni Eşleşme!',
          body: `${like.likedPet.name} ile eşleştiniz!`,
          data: { matchId: savedMatch.id, conversationId: savedConversation.id },
        });
      }

      return {
        isMatch: true,
        matchId: savedMatch.id,
        conversationId: savedConversation.id,
      };
    });
  }

  async dislike(petId: number, userId: number, dislikerPetId?: number) {
    return this.entityManager.transaction(async (manager) => {
      const target = await manager.findOne(Pet, { where: { id: petId } });
      if (!target) {
        throw new NotFoundException('Pet not found');
      }

      if (target.purpose === PetPurpose.ADOPTION) {
        const existing = await manager.findOne(MatchDislike, {
          where: {
            dislikerUserId: userId,
            dislikedPetId: petId,
            dislikerPetId: IsNull(),
          },
        });
        if (existing) return { success: true };
        await manager.save(
          manager.create(MatchDislike, {
            dislikerPetId: null,
            dislikerUserId: userId,
            dislikedPetId: petId,
          }),
        );
        return { success: true };
      }

      const userPets = await manager.find(Pet, {
        where: {
          ownerId: userId,
          isActive: true,
          isAdopted: false,
          purpose: PetPurpose.PLAYMATE,
        },
        order: { createdAt: 'ASC' },
      });

      if (userPets.length === 0) {
        throw new BadRequestException('Oyun arkadaşı için aktif bir patin olmalı');
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

      await manager.save(
        manager.create(MatchDislike, {
          dislikerPetId: dpId,
          dislikerUserId: userId,
          dislikedPetId: petId,
        }),
      );

      return { success: true };
    });
  }

  async unmatchByTargetPet(targetPetId: number, userId: number) {
    return this.entityManager.transaction(async (manager) => {
      const userPets = await manager.find(Pet, {
        where: { ownerId: userId, isActive: true },
      });
      const userPetIds = userPets.map((p) => p.id);

      const where: any[] = [{ user1Id: userId, pet2Id: targetPetId, isActive: true }];
      if (userPetIds.length) {
        where.push(
          { pet1Id: In(userPetIds), pet2Id: targetPetId, isActive: true },
          { pet2Id: In(userPetIds), pet1Id: targetPetId, isActive: true },
          { pet2Id: targetPetId, isActive: true },
        );
      }

      const candidates = await manager.find(Match, {
        where,
        relations: { conversation: true },
      });

      const found = candidates.find((m) => {
        if (m.user1Id === userId && m.pet2Id === targetPetId) return true;
        if (m.pet1Id != null && userPetIds.includes(m.pet1Id) && m.pet2Id === targetPetId)
          return true;
        if (m.pet1Id != null && userPetIds.includes(m.pet2Id) && m.pet1Id === targetPetId)
          return true;
        // owner of listed pet (adoption)
        if (m.pet2Id === targetPetId && userPetIds.includes(m.pet2Id)) return true;
        return false;
      });

      if (!found) {
        throw new NotFoundException('Eşleşme bulunamadı');
      }

      found.isActive = false;
      await manager.save(found);

      if (found.conversation) {
        found.conversation.isActive = false;
        await manager.save(found.conversation);
      } else {
        const conv = await manager.findOne(Conversation, { where: { matchId: found.id } });
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
    const userPetIds = userPets.map((p) => p.id);

    const where: any[] = [{ user1Id: userId, isActive: true }];
    if (userPetIds.length) {
      where.push(
        { pet1Id: In(userPetIds), isActive: true },
        { pet2Id: In(userPetIds), isActive: true },
      );
    }

    const matches = await this.entityManager.find(Match, {
      where,
      relations: {
        pet1: { photos: true },
        pet2: { photos: true },
        conversation: true,
      },
      order: { matchedAt: 'DESC' },
    });

    const seen = new Set<number>();
    const unique = matches.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    return {
      matches: unique.map((match) => {
        const isAdoption = match.pet1Id == null;
        const iOwnPet1 = match.pet1Id != null && userPetIds.includes(match.pet1Id);
        const otherPet = iOwnPet1 ? match.pet2 : match.pet1Id ? match.pet1 : match.pet2;
        return {
          id: match.id,
          pet: otherPet
            ? {
                id: otherPet.id,
                name: otherPet.name,
                photos: otherPet.photos,
              }
            : null,
          matchedAt: match.matchedAt,
          conversationId: match.conversation?.id,
          isAdoption,
        };
      }),
    };
  }

  async getIncomingLikes(userId: number) {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const gold = resolveGoldFromPreferences(
      (user.profile?.preferences ?? {}) as Record<string, unknown>,
    );

    const myPets = await this.entityManager.find(Pet, {
      where: { ownerId: userId, isActive: true, isAdopted: false },
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
      relations: {
        likerPet: { photos: true, owner: true },
        likedPet: { photos: true },
        likerUser: { profile: true },
      },
      order: { createdAt: 'ASC' },
    });

    const activeMatches = await this.entityManager.find(Match, {
      where: [
        { pet2Id: In(myPetIds), isActive: true },
        { pet1Id: In(myPetIds), isActive: true },
      ],
    });

    const matchedPetPairs = new Set(
      activeMatches
        .filter((m) => m.pet1Id != null)
        .map((m) => `${Math.min(m.pet1Id!, m.pet2Id)}_${Math.max(m.pet1Id!, m.pet2Id)}`),
    );
    const matchedAdoptionUsers = new Set(
      activeMatches
        .filter((m) => m.pet1Id == null && m.user1Id != null)
        .map((m) => `${m.user1Id}_${m.pet2Id}`),
    );

    const incoming = likes.filter((l) => {
      if (l.acceptedAt) return false;
      if (l.likerPetId == null) {
        return !matchedAdoptionUsers.has(`${l.likerUserId}_${l.likedPetId}`);
      }
      return !matchedPetPairs.has(
        `${Math.min(l.likerPetId, l.likedPetId)}_${Math.max(l.likerPetId, l.likedPetId)}`,
      );
    });

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

    return {
      isGold: gold,
      visibleSlots,
      total: incoming.length,
      weeksElapsedCalendarUtc,
      anchorWeekMondayUtc: mondayUtcWeekKey(new Date(user.createdAt)),
      currentWeekMondayUtc: mondayUtcWeekKey(),
      items: incoming.map((like, index) => {
        const visible = gold || index < visibleSlots;
        const isAdoption = like.likerPetId == null;
        return {
          id: like.id,
          createdAt: like.createdAt,
          visible,
          isSuperLike: like.isSuperLike,
          isAdoption,
          myPet: {
            id: like.likedPet.id,
            name: like.likedPet.name,
            photos: like.likedPet.photos,
            purpose: like.likedPet.purpose,
          },
          likerPet:
            isAdoption || !like.likerPet
              ? null
              : visible
                ? mapLikerPublic(like.likerPet)
                : { id: like.likerPetId, hidden: true },
          likerUser:
            isAdoption && like.likerUser
              ? visible
                ? {
                    id: like.likerUser.id,
                    firstName: like.likerUser.firstName,
                    lastName: like.likerUser.lastName,
                    avatar: like.likerUser.profile?.avatar ?? null,
                  }
                : { id: like.likerUserId, hidden: true }
              : null,
        };
      }),
    };
  }

  private async assertSuperlikeAllowed(manager: EntityManager, likerUserId: number): Promise<void> {
    const user = await manager.findOne(User, {
      where: { id: likerUserId },
      relations: { profile: true },
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
    const goldPlan = await manager.findOne(SubscriptionPlan, {
      where: { tier: 'gold', isActive: true },
    });
    const weeklyLimit = goldPlan?.superlikesWeeklyLimit ?? GOLD_SUPER_LIKE_WEEKLY;
    if (used >= weeklyLimit) {
      throw new ForbiddenException('Haftalık süper beğeni hakkın doldu');
    }
  }

  private async incrementSuperlikeUsage(manager: EntityManager, likerUserId: number): Promise<void> {
    const user = await manager.findOne(User, {
      where: { id: likerUserId },
      relations: { profile: true },
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
