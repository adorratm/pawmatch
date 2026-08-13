import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { User, UserRole } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { Pet } from '../database/entities/pet.entity';
import { PetPhoto } from '../database/entities/pet-photo.entity';
import { Match } from '../database/entities/match.entity';
import { MatchLike } from '../database/entities/match-like.entity';
import { MatchDislike } from '../database/entities/match-dislike.entity';
import { Message } from '../database/entities/message.entity';
import { PetFavorite } from '../database/entities/pet-favorite.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { UserLocation } from '../database/entities/user-location.entity';
import { Rating } from '../database/entities/rating.entity';
import { ClinicReview } from '../database/entities/clinic-review.entity';
import { OAuthAccount } from '../database/entities/oauth-account.entity';
import { SupportTicket } from '../database/entities/support-ticket.entity';
import { Notification } from '../database/entities/notification.entity';
import { Veterinarian } from '../database/entities/veterinarian.entity';
import { Shelter } from '../database/entities/shelter.entity';
import { Temperament } from '../database/entities/temperament.entity';
import { TranslationLocale } from '../database/entities/translation-locale.entity';
import { TranslationEntry } from '../database/entities/translation-entry.entity';
import { AdPlacement } from '../database/entities/ad-placement.entity';
import { AdCreative } from '../database/entities/ad-creative.entity';
import { SubscriptionPlan } from '../database/entities/subscription-plan.entity';
import { AppSetting } from '../database/entities/app-setting.entity';
import { CmsPage } from '../database/entities/cms-page.entity';
import { VeterinarianClinic } from '../database/entities/veterinarian-clinic.entity';
import { setNested, flattenObject } from '../common/i18n-flatten.util';
import { UploadsService } from '../uploads/uploads.service';
import {
  GOLD_SUPER_LIKE_WEEKLY,
  type PatiSubscriptionPrefs,
} from '../common/pati-subscription.util';

function applyFocusId(
  qb: { andWhere: (sql: string, params?: object) => unknown },
  alias: string,
  id?: number,
) {
  if (id && id > 0) qb.andWhere(`${alias}.id = :focusId`, { focusId: id });
}

@Injectable()
export class AdminService {
  constructor(
    private readonly em: EntityManager,
    private readonly uploads: UploadsService,
  ) {}

  // ── Dashboard ──────────────────────────────────────────────
  async getDashboard() {
    const [users, pets, matches, openTickets, activeGold] = await Promise.all([
      this.em.count(User),
      this.em.count(Pet),
      this.em.count(Match, { where: { isActive: true } }),
      this.em.count(SupportTicket, { where: { status: 'open' } }),
      this.em
        .createQueryBuilder(UserProfile, 'p')
        .where(`p.preferences -> 'patiSubscription' ->> 'tier' = 'gold'`)
        .getCount(),
    ]);
    return {
      users,
      pets,
      activeMatches: matches,
      openTickets,
      estimatedGoldSubscribers: activeGold,
    };
  }

  // ── Users ──────────────────────────────────────────────────
  async listUsers(q?: string, page = 1, limit = 20, id?: number) {
    const qb = this.em
      .createQueryBuilder(User, 'u')
      .leftJoinAndSelect('u.profile', 'profile')
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    applyFocusId(qb, 'u', id);
    if (q?.trim()) {
      const term = `%${q.trim()}%`;
      qb.andWhere(
        '(u.email ILIKE :term OR u.firstName ILIKE :term OR u.lastName ILIKE :term OR u.phone ILIKE :term)',
        { term },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role,
        isActive: u.isActive,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        avatar: u.profile?.avatar ?? null,
      })),
      total,
      page,
      limit,
    };
  }

  async getUser(id: number) {
    const user = await this.em.findOne(User, {
      where: { id },
      relations: { profile: true, pets: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password: _, ...safe } = user;
    return safe;
  }

  async getUserActivity(id: number) {
    const user = await this.em.findOne(User, {
      where: { id },
      relations: { profile: true, pets: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const petIds = (user.pets ?? []).map((p) => p.id);
    const events: {
      id: string;
      type: string;
      at: string;
      title: string;
      detail?: string;
    }[] = [];

    const clip = (s?: string | null, n = 140) => {
      const t = (s ?? '').trim();
      if (!t) return undefined;
      return t.length > n ? `${t.slice(0, n)}…` : t;
    };

    const [
      likesOut,
      likesIn,
      dislikes,
      matches,
      messages,
      favorites,
      tickets,
      appointments,
      locations,
      ratingsGiven,
      ratingsReceived,
      clinicReviews,
      oauth,
    ] = await Promise.all([
      this.em.find(MatchLike, {
        where: { likerUserId: id },
        relations: { likedPet: true, likerPet: true },
        order: { createdAt: 'DESC' },
        take: 80,
      }),
      petIds.length
        ? this.em
            .createQueryBuilder(MatchLike, 'l')
            .leftJoinAndSelect('l.likedPet', 'likedPet')
            .leftJoinAndSelect('l.likerUser', 'likerUser')
            .where('likedPet.ownerId = :id', { id })
            .andWhere('(l.likerUserId IS NULL OR l.likerUserId != :id)', { id })
            .orderBy('l.createdAt', 'DESC')
            .take(80)
            .getMany()
        : Promise.resolve([] as MatchLike[]),
      this.em.find(MatchDislike, {
        where: { dislikerUserId: id },
        relations: { dislikedPet: true, dislikerPet: true },
        order: { createdAt: 'DESC' },
        take: 80,
      }),
      this.em
        .createQueryBuilder(Match, 'm')
        .leftJoinAndSelect('m.pet1', 'pet1')
        .leftJoinAndSelect('m.pet2', 'pet2')
        .where(
          petIds.length
            ? '(m.user1Id = :id OR m.pet1Id IN (:...petIds) OR m.pet2Id IN (:...petIds))'
            : 'm.user1Id = :id',
          petIds.length ? { id, petIds } : { id },
        )
        .orderBy('m.matchedAt', 'DESC')
        .take(80)
        .getMany(),
      this.em.find(Message, {
        where: { senderId: id },
        order: { createdAt: 'DESC' },
        take: 80,
      }),
      this.em.find(PetFavorite, {
        where: { userId: id },
        relations: { pet: true },
        order: { createdAt: 'DESC' },
        take: 80,
      }),
      this.em.find(SupportTicket, {
        where: { userId: id },
        order: { createdAt: 'DESC' },
        take: 40,
      }),
      this.em.find(Appointment, {
        where: { userId: id },
        relations: { clinic: true, pet: true, service: true },
        order: { createdAt: 'DESC' },
        take: 40,
      }),
      this.em.find(UserLocation, {
        where: { userId: id },
        order: { createdAt: 'DESC' },
        take: 20,
      }),
      this.em.find(Rating, {
        where: { raterId: id },
        relations: { ratee: true },
        order: { createdAt: 'DESC' },
        take: 30,
      }),
      this.em.find(Rating, {
        where: { rateeId: id },
        relations: { rater: true },
        order: { createdAt: 'DESC' },
        take: 30,
      }),
      this.em.find(ClinicReview, {
        where: { userId: id },
        relations: { clinic: true },
        order: { createdAt: 'DESC' },
        take: 30,
      }),
      this.em.find(OAuthAccount, {
        where: { userId: id },
        order: { createdAt: 'DESC' },
      }),
    ]);

    events.push({
      id: `signup-${user.id}`,
      type: 'signup',
      at: user.createdAt.toISOString(),
      title: 'Hesap oluşturuldu',
      detail: user.email,
    });

    for (const p of user.pets ?? []) {
      events.push({
        id: `pet-${p.id}`,
        type: 'pet',
        at: p.createdAt.toISOString(),
        title: `Pet eklendi: ${p.name}`,
        detail: [p.species, p.breed, p.purpose].filter(Boolean).join(' · '),
      });
    }

    for (const l of likesOut) {
      events.push({
        id: `like-${l.id}`,
        type: l.isSuperLike ? 'superlike' : 'like',
        at: l.createdAt.toISOString(),
        title: l.isSuperLike ? 'Süper beğeni gönderildi' : 'Beğeni gönderildi',
        detail: [l.likerPet?.name, l.likedPet?.name].filter(Boolean).join(' → ') || `#${l.likedPetId}`,
      });
      if (l.acceptedAt) {
        events.push({
          id: `like-acc-${l.id}`,
          type: 'like_accepted',
          at: l.acceptedAt.toISOString(),
          title: 'Gönderilen beğeni kabul edildi',
          detail: l.likedPet?.name,
        });
      }
    }

    for (const l of likesIn) {
      const who = [l.likerUser?.firstName, l.likerUser?.lastName].filter(Boolean).join(' ');
      events.push({
        id: `likein-${l.id}`,
        type: 'like_received',
        at: l.createdAt.toISOString(),
        title: l.isSuperLike ? 'Süper beğeni alındı' : 'Beğeni alındı',
        detail: [who || 'Kullanıcı', l.likedPet?.name].filter(Boolean).join(' → '),
      });
    }

    for (const d of dislikes) {
      events.push({
        id: `pass-${d.id}`,
        type: 'dislike',
        at: d.createdAt.toISOString(),
        title: 'Geçildi (pass)',
        detail: [d.dislikerPet?.name, d.dislikedPet?.name].filter(Boolean).join(' → ') || `#${d.dislikedPetId}`,
      });
    }

    for (const m of matches) {
      events.push({
        id: `match-${m.id}`,
        type: m.isActive ? 'match' : 'unmatch',
        at: (m.matchedAt ?? m.createdAt).toISOString(),
        title: m.isActive ? 'Eşleşme oluştu' : 'Eşleşme kapalı',
        detail: [m.pet1?.name, m.pet2?.name].filter(Boolean).join(' ↔ ') || `Eşleşme #${m.id}`,
      });
    }

    for (const msg of messages) {
      events.push({
        id: `msg-${msg.id}`,
        type: 'message',
        at: msg.createdAt.toISOString(),
        title: 'Mesaj gönderildi',
        detail: clip(msg.content),
      });
    }

    for (const f of favorites) {
      events.push({
        id: `fav-${f.id}`,
        type: 'favorite',
        at: f.createdAt.toISOString(),
        title: 'Favorilere eklendi',
        detail: f.pet?.name,
      });
    }

    for (const t of tickets) {
      events.push({
        id: `ticket-${t.id}`,
        type: 'ticket',
        at: t.createdAt.toISOString(),
        title: `Destek talebi (${t.status})`,
        detail: clip(t.subject || t.message),
      });
    }

    for (const a of appointments) {
      events.push({
        id: `apt-${a.id}`,
        type: 'appointment',
        at: a.createdAt.toISOString(),
        title: `Randevu · ${a.status}`,
        detail: [a.pet?.name, a.clinic?.name, a.service?.name]
          .filter(Boolean)
          .join(' · '),
      });
    }

    for (const loc of locations) {
      events.push({
        id: `loc-${loc.id}`,
        type: 'location',
        at: loc.createdAt.toISOString(),
        title: loc.isCurrent ? 'Konum güncellendi' : 'Konum kaydı',
        detail: [loc.district, loc.city].filter(Boolean).join(', ') || undefined,
      });
    }

    for (const r of ratingsGiven) {
      events.push({
        id: `rate-out-${r.id}`,
        type: 'rating',
        at: r.createdAt.toISOString(),
        title: `Puan verdi (${r.rating}/5)`,
        detail: clip(
          [r.ratee ? `${r.ratee.firstName} ${r.ratee.lastName}` : '', r.comment]
            .filter(Boolean)
            .join(' · '),
        ),
      });
    }

    for (const r of ratingsReceived) {
      events.push({
        id: `rate-in-${r.id}`,
        type: 'rating_received',
        at: r.createdAt.toISOString(),
        title: `Puan aldı (${r.rating}/5)`,
        detail: clip(
          [r.rater ? `${r.rater.firstName} ${r.rater.lastName}` : '', r.comment]
            .filter(Boolean)
            .join(' · '),
        ),
      });
    }

    for (const c of clinicReviews) {
      events.push({
        id: `crev-${c.id}`,
        type: 'clinic_review',
        at: c.createdAt.toISOString(),
        title: `Klinik yorumu (${c.overallRating}/5)`,
        detail: clip([c.clinic?.name, c.comment].filter(Boolean).join(' · ')),
      });
    }

    for (const o of oauth) {
      events.push({
        id: `oauth-${o.id}`,
        type: 'oauth',
        at: o.createdAt.toISOString(),
        title: `OAuth bağlandı: ${o.provider}`,
      });
    }

    const prefs = (user.profile?.preferences ?? {}) as Record<string, unknown>;
    const pati = (prefs.patiSubscription ?? {}) as PatiSubscriptionPrefs;
    if (pati.syncedAt || pati.tier) {
      events.push({
        id: `sub-${user.id}`,
        type: 'subscription',
        at: (pati.syncedAt || user.updatedAt.toISOString()) as string,
        title: `Abonelik: ${pati.tier || 'free'}`,
        detail: [
          pati.productId,
          pati.activeUntil ? `bitiş ${new Date(pati.activeUntil).toLocaleString('tr-TR')}` : null,
        ]
          .filter(Boolean)
          .join(' · '),
      });
    }

    events.sort((a, b) => +new Date(b.at) - +new Date(a.at));
    const currentLoc = locations.find((l) => l.isCurrent) ?? locations[0];

    const matchWhere = petIds.length
      ? '(m.user1Id = :id OR m.pet1Id IN (:...petIds) OR m.pet2Id IN (:...petIds))'
      : 'm.user1Id = :id';
    const matchParams = petIds.length ? { id, petIds } : { id };

    const [
      likesSent,
      superLikesSent,
      likesReceived,
      passes,
      matchActive,
      matchClosed,
      messageCount,
      favoriteCount,
      ticketCount,
      appointmentCount,
    ] = await Promise.all([
      this.em.count(MatchLike, { where: { likerUserId: id } }),
      this.em.count(MatchLike, { where: { likerUserId: id, isSuperLike: true } }),
      petIds.length
        ? this.em
            .createQueryBuilder(MatchLike, 'l')
            .leftJoin('l.likedPet', 'likedPet')
            .where('likedPet.ownerId = :id', { id })
            .andWhere('(l.likerUserId IS NULL OR l.likerUserId != :id)', { id })
            .getCount()
        : Promise.resolve(0),
      this.em.count(MatchDislike, { where: { dislikerUserId: id } }),
      this.em
        .createQueryBuilder(Match, 'm')
        .where(`${matchWhere} AND m.isActive = true`, matchParams)
        .getCount(),
      this.em
        .createQueryBuilder(Match, 'm')
        .where(`${matchWhere} AND m.isActive = false`, matchParams)
        .getCount(),
      this.em.count(Message, { where: { senderId: id } }),
      this.em.count(PetFavorite, { where: { userId: id } }),
      this.em.count(SupportTicket, { where: { userId: id } }),
      this.em.count(Appointment, { where: { userId: id } }),
    ]);

    return {
      summary: {
        likesSent,
        superLikesSent,
        likesReceived,
        passes,
        matches: matchActive,
        matchesClosed: matchClosed,
        messages: messageCount,
        favorites: favoriteCount,
        pets: user.pets?.length ?? 0,
        tickets: ticketCount,
        appointments: appointmentCount,
        gold: !!(
          pati.tier === 'gold' &&
          pati.activeUntil &&
          new Date(pati.activeUntil) > new Date()
        ),
        subscriptionTier: pati.tier || 'free',
        subscriptionUntil: pati.activeUntil || null,
        location: currentLoc
          ? {
              city: currentLoc.city,
              district: currentLoc.district,
              latitude: currentLoc.latitude,
              longitude: currentLoc.longitude,
            }
          : null,
        createdAt: user.createdAt,
        lastSeenHint: events[0]?.at ?? user.updatedAt.toISOString(),
      },
      events: events.slice(0, 250),
    };
  }

  async updateUser(
    id: number,
    dto: {
      isActive?: boolean;
      role?: UserRole;
      emailVerified?: boolean;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    },
  ) {
    const user = await this.em.findOne(User, { where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.emailVerified !== undefined) user.emailVerified = dto.emailVerified;
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    await this.em.save(user);
    if (dto.avatar !== undefined) {
      let profile = await this.em.findOne(UserProfile, { where: { userId: id } });
      if (!profile) profile = this.em.create(UserProfile, { userId: id });
      profile.avatar = dto.avatar;
      await this.em.save(profile);
    }
    return this.getUser(id);
  }

  async overrideSubscription(
    userId: number,
    dto: { tier: string; activeUntil?: string | null; productId?: string | null },
  ) {
    const profile = await this.em.findOne(UserProfile, { where: { userId } });
    if (!profile) throw new NotFoundException('User profile not found');
    const prefs = { ...(profile.preferences ?? {}) } as Record<string, unknown>;
    const pati: PatiSubscriptionPrefs = {
      ...((prefs.patiSubscription as PatiSubscriptionPrefs) ?? {}),
      tier: dto.tier,
      activeUntil: dto.activeUntil ?? undefined,
      productId: dto.productId ?? null,
      syncedAt: new Date().toISOString(),
    };
    prefs.patiSubscription = pati;
    profile.preferences = prefs;
    await this.em.save(profile);
    return this.getUser(userId);
  }

  // ── Pets ───────────────────────────────────────────────────
  async listPets(q?: string, page = 1, limit = 20, id?: number) {
    const qb = this.em
      .createQueryBuilder(Pet, 'p')
      .leftJoinAndSelect('p.owner', 'owner')
      .leftJoinAndSelect('p.photos', 'photos')
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    applyFocusId(qb, 'p', id);
    if (q?.trim()) {
      qb.andWhere(
        '(p.name ILIKE :term OR p.breed ILIKE :term OR owner.email ILIKE :term OR owner.firstName ILIKE :term OR owner.lastName ILIKE :term)',
        { term: `%${q.trim()}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getPet(id: number) {
    const pet = await this.em.findOne(Pet, {
      where: { id },
      relations: { owner: true, photos: true },
    });
    if (!pet) throw new NotFoundException('Pet not found');
    return pet;
  }

  async updatePet(
    id: number,
    dto: {
      isActive?: boolean;
      isAdopted?: boolean;
      bio?: string;
      name?: string;
      breed?: string;
    },
  ) {
    const pet = await this.em.findOne(Pet, { where: { id } });
    if (!pet) throw new NotFoundException('Pet not found');
    if (dto.isActive !== undefined) pet.isActive = dto.isActive;
    if (dto.isAdopted !== undefined) pet.isAdopted = dto.isAdopted;
    if (dto.bio !== undefined) pet.bio = dto.bio;
    if (dto.name !== undefined) pet.name = dto.name;
    if (dto.breed !== undefined) pet.breed = dto.breed;
    await this.em.save(pet);
    return pet;
  }

  async deletePet(id: number) {
    const pet = await this.em.findOne(Pet, { where: { id } });
    if (!pet) throw new NotFoundException('Pet not found');
    await this.em.remove(pet);
    return { success: true };
  }

  async addPetPhoto(petId: number, file: Express.Multer.File, isMain = false) {
    const pet = await this.em.findOne(Pet, { where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet not found');
    const url = await this.uploads.uploadFile(file, 'pets');
    if (isMain) {
      await this.em.update(PetPhoto, { petId }, { isMain: false });
    }
    const count = await this.em.count(PetPhoto, { where: { petId } });
    const photo = this.em.create(PetPhoto, {
      petId,
      url,
      isMain: isMain || count === 0,
      order: count,
    });
    return this.em.save(photo);
  }

  async removePetPhoto(photoId: number) {
    const photo = await this.em.findOne(PetPhoto, { where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo not found');
    await this.em.remove(photo);
    return { success: true };
  }

  // ── Matches ────────────────────────────────────────────────
  async listMatches(q?: string, page = 1, limit = 20, id?: number) {
    const qb = this.em
      .createQueryBuilder(Match, 'm')
      .leftJoinAndSelect('m.pet1', 'pet1')
      .leftJoinAndSelect('m.pet2', 'pet2')
      .orderBy('m.matchedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    applyFocusId(qb, 'm', id);
    if (q?.trim()) {
      qb.andWhere('(pet1.name ILIKE :term OR pet2.name ILIKE :term)', {
        term: `%${q.trim()}%`,
      });
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async unmatch(id: number) {
    const match = await this.em.findOne(Match, { where: { id } });
    if (!match) throw new NotFoundException('Match not found');
    match.isActive = false;
    await this.em.save(match);
    return match;
  }

  // ── Support ────────────────────────────────────────────────
  async listTickets(status?: string, q?: string, page = 1, limit = 20, id?: number) {
    const qb = this.em
      .createQueryBuilder(SupportTicket, 't')
      .leftJoinAndSelect('t.user', 'user')
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    applyFocusId(qb, 't', id);
    if (!id && status) qb.andWhere('t.status = :status', { status });
    if (q?.trim()) {
      qb.andWhere(
        '(t.subject ILIKE :term OR t.message ILIKE :term OR user.email ILIKE :term OR user.firstName ILIKE :term)',
        { term: `%${q.trim()}%` },
      );
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async updateTicket(id: number, dto: { status?: string; adminNote?: string }) {
    const ticket = await this.em.findOne(SupportTicket, { where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (dto.status !== undefined) ticket.status = dto.status;
    if (dto.adminNote !== undefined) ticket.adminNote = dto.adminNote;
    await this.em.save(ticket);
    return ticket;
  }

  // ── i18n ───────────────────────────────────────────────────
  async listLocales() {
    return this.em.find(TranslationLocale, { order: { code: 'ASC' } });
  }

  async createLocale(dto: { code: string; name: string; isDefault?: boolean }) {
    const existing = await this.em.findOne(TranslationLocale, {
      where: { code: dto.code },
    });
    if (existing) throw new BadRequestException('Locale already exists');
    if (dto.isDefault) {
      await this.em.update(TranslationLocale, {}, { isDefault: false });
    }
    const locale = this.em.create(TranslationLocale, {
      code: dto.code,
      name: dto.name,
      isDefault: !!dto.isDefault,
      isActive: true,
    });
    return this.em.save(locale);
  }

  async updateLocale(
    id: number,
    dto: { name?: string; isActive?: boolean; isDefault?: boolean },
  ) {
    const locale = await this.em.findOne(TranslationLocale, { where: { id } });
    if (!locale) throw new NotFoundException('Locale not found');
    if (dto.name !== undefined) locale.name = dto.name;
    if (dto.isActive !== undefined) locale.isActive = dto.isActive;
    if (dto.isDefault) {
      await this.em.update(TranslationLocale, {}, { isDefault: false });
      locale.isDefault = true;
    }
    return this.em.save(locale);
  }

  async listEntries(localeId: number, q?: string, page = 1, limit = 20, id?: number) {
    const qb = this.em
      .createQueryBuilder(TranslationEntry, 'e')
      .orderBy('e.key', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    if (id) applyFocusId(qb, 'e', id);
    else qb.andWhere('e.localeId = :localeId', { localeId });
    if (q?.trim()) {
      qb.andWhere('(e.key ILIKE :term OR e.value ILIKE :term)', {
        term: `%${q.trim()}%`,
      });
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async upsertEntry(localeId: number, key: string, value: string) {
    const locale = await this.em.findOne(TranslationLocale, { where: { id: localeId } });
    if (!locale) throw new NotFoundException('Locale not found');
    let entry = await this.em.findOne(TranslationEntry, {
      where: { localeId, key },
    });
    if (entry) {
      entry.value = value;
    } else {
      entry = this.em.create(TranslationEntry, { localeId, key, value });
    }
    return this.em.save(entry);
  }

  async deleteEntry(id: number) {
    const entry = await this.em.findOne(TranslationEntry, { where: { id } });
    if (!entry) throw new NotFoundException('Entry not found');
    await this.em.remove(entry);
    return { success: true };
  }

  async importFlatEntries(localeId: number, flat: Record<string, string>) {
    const locale = await this.em.findOne(TranslationLocale, { where: { id: localeId } });
    if (!locale) throw new NotFoundException('Locale not found');
    let count = 0;
    for (const [key, value] of Object.entries(flat)) {
      await this.upsertEntry(localeId, key, value);
      count++;
    }
    return { imported: count };
  }

  async getNestedTranslations(code: string) {
    const locale = await this.em.findOne(TranslationLocale, {
      where: { code, isActive: true },
    });
    if (!locale) return null;
    const entries = await this.em.find(TranslationEntry, {
      where: { localeId: locale.id },
    });
    const nested: Record<string, unknown> = {};
    for (const e of entries) {
      setNested(nested, e.key, e.value);
    }
    return nested;
  }

  // ── Ads ────────────────────────────────────────────────────
  async listPlacements(q?: string, page = 1, limit = 20, id?: number) {
    const qb = this.em.createQueryBuilder(AdPlacement, 'p').orderBy('p.key', 'ASC');
    if (id) {
      const creative = await this.em.findOne(AdCreative, { where: { id } });
      qb.andWhere('p.id = :focusId', { focusId: creative?.placementId ?? id });
    }
    if (q?.trim()) {
      qb.andWhere('(p.key ILIKE :term OR p.name ILIKE :term)', {
        term: `%${q.trim()}%`,
      });
    }
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    if (items.length) {
      const creatives = await this.em.find(AdCreative, {
        where: { placementId: In(items.map((p) => p.id)) },
        order: { sortOrder: 'ASC' },
      });
      const byPlacement = new Map<number, AdCreative[]>();
      for (const creative of creatives) {
        const list = byPlacement.get(creative.placementId) ?? [];
        list.push(creative);
        byPlacement.set(creative.placementId, list);
      }
      for (const placement of items) {
        placement.creatives = byPlacement.get(placement.id) ?? [];
      }
    }
    return { items, total, page, limit };
  }

  async upsertPlacement(dto: {
    id?: number;
    key: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }) {
    let placement: AdPlacement | null = null;
    if (dto.id) {
      placement = await this.em.findOne(AdPlacement, { where: { id: dto.id } });
    }
    if (!placement) {
      placement = this.em.create(AdPlacement, {
        key: dto.key,
        name: dto.name,
        description: dto.description ?? null,
        isActive: dto.isActive ?? true,
      });
    } else {
      placement.key = dto.key;
      placement.name = dto.name;
      if (dto.description !== undefined) placement.description = dto.description;
      if (dto.isActive !== undefined) placement.isActive = dto.isActive;
    }
    return this.em.save(placement);
  }

  async upsertCreative(dto: {
    id?: number;
    placementId: number;
    title: string;
    body?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    const placement = await this.em.findOne(AdPlacement, {
      where: { id: dto.placementId },
    });
    if (!placement) throw new NotFoundException('Placement not found');

    let creative: AdCreative | null = null;
    if (dto.id) {
      creative = await this.em.findOne(AdCreative, { where: { id: dto.id } });
    }
    if (!creative) {
      creative = this.em.create(AdCreative, {
        placementId: dto.placementId,
        title: dto.title,
        body: dto.body ?? null,
        ctaLabel: dto.ctaLabel ?? null,
        ctaUrl: dto.ctaUrl ?? null,
        imageUrl: dto.imageUrl ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      });
    } else {
      Object.assign(creative, {
        placementId: dto.placementId,
        title: dto.title,
        body: dto.body ?? creative.body,
        ctaLabel: dto.ctaLabel ?? creative.ctaLabel,
        ctaUrl: dto.ctaUrl ?? creative.ctaUrl,
        imageUrl: dto.imageUrl ?? creative.imageUrl,
        sortOrder: dto.sortOrder ?? creative.sortOrder,
        isActive: dto.isActive ?? creative.isActive,
      });
    }
    return this.em.save(creative);
  }

  async deleteCreative(id: number) {
    const c = await this.em.findOne(AdCreative, { where: { id } });
    if (!c) throw new NotFoundException('Creative not found');
    await this.em.remove(c);
    return { success: true };
  }

  async getActiveAds(placementKey?: string) {
    const qb = this.em
      .createQueryBuilder(AdCreative, 'c')
      .innerJoinAndSelect('c.placement', 'p')
      .where('c.isActive = true')
      .andWhere('p.isActive = true')
      .orderBy('c.sortOrder', 'ASC');

    if (placementKey) {
      qb.andWhere('p.key = :key', { key: placementKey });
    }

    return qb.getMany();
  }

  // ── Plans ──────────────────────────────────────────────────
  async listPlans(activeOnly = false, q?: string, page?: number, limit?: number, id?: number) {
    const qb = this.em
      .createQueryBuilder(SubscriptionPlan, 'p')
      .orderBy('p.sortOrder', 'ASC');
    if (activeOnly) qb.andWhere('p.isActive = true');
    applyFocusId(qb, 'p', id);
    if (q?.trim()) {
      qb.andWhere(
        '(p.tier ILIKE :term OR p.name ILIKE :term OR p.productId ILIKE :term OR p.description ILIKE :term)',
        { term: `%${q.trim()}%` },
      );
    }
    if (page != null && limit != null) {
      const total = await qb.getCount();
      const items = await qb
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
      return { items, total, page, limit };
    }
    return qb.getMany();
  }

  async upsertPlan(dto: Partial<SubscriptionPlan> & { tier: string; name: string }) {
    let plan: SubscriptionPlan | null = null;
    if (dto.id) {
      plan = await this.em.findOne(SubscriptionPlan, { where: { id: dto.id } });
    }
    if (!plan) {
      plan = await this.em.findOne(SubscriptionPlan, { where: { tier: dto.tier } });
    }
    if (!plan) {
      plan = this.em.create(SubscriptionPlan, {
        tier: dto.tier,
        name: dto.name,
        description: dto.description ?? null,
        productId: dto.productId ?? null,
        priceLabel: dto.priceLabel ?? null,
        features: dto.features ?? null,
        superlikesWeeklyLimit: dto.superlikesWeeklyLimit ?? 0,
        removesAds: dto.removesAds ?? false,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      });
    } else {
      Object.assign(plan, {
        tier: dto.tier,
        name: dto.name,
        description: dto.description ?? plan.description,
        productId: dto.productId ?? plan.productId,
        priceLabel: dto.priceLabel ?? plan.priceLabel,
        features: dto.features ?? plan.features,
        superlikesWeeklyLimit:
          dto.superlikesWeeklyLimit ?? plan.superlikesWeeklyLimit,
        removesAds: dto.removesAds ?? plan.removesAds,
        sortOrder: dto.sortOrder ?? plan.sortOrder,
        isActive: dto.isActive ?? plan.isActive,
      });
    }
    return this.em.save(plan);
  }

  async deletePlan(id: number) {
    const plan = await this.em.findOne(SubscriptionPlan, { where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    await this.em.remove(plan);
    return { success: true };
  }

  async getGoldWeeklyLimit(): Promise<number> {
    const gold = await this.em.findOne(SubscriptionPlan, {
      where: { tier: 'gold', isActive: true },
    });
    return gold?.superlikesWeeklyLimit ?? GOLD_SUPER_LIKE_WEEKLY;
  }

  // ── Settings ───────────────────────────────────────────────
  async listSettings(q?: string, page = 1, limit = 20, id?: number) {
    const qb = this.em.createQueryBuilder(AppSetting, 's').orderBy('s.key', 'ASC');
    applyFocusId(qb, 's', id);
    if (q?.trim()) {
      qb.andWhere(
        '(s.key ILIKE :term OR s.value ILIKE :term OR s.description ILIKE :term)',
        { term: `%${q.trim()}%` },
      );
    }
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total, page, limit };
  }

  async upsertSetting(key: string, value: string, description?: string) {
    let setting = await this.em.findOne(AppSetting, { where: { key } });
    if (!setting) {
      setting = this.em.create(AppSetting, {
        key,
        value,
        description: description ?? null,
      });
    } else {
      setting.value = value;
      if (description !== undefined) setting.description = description;
    }
    return this.em.save(setting);
  }

  async deleteSetting(id: number) {
    const s = await this.em.findOne(AppSetting, { where: { id } });
    if (!s) throw new NotFoundException('Setting not found');
    await this.em.remove(s);
    return { success: true };
  }

  // ── Notifications broadcast ────────────────────────────────
  async broadcast(dto: { title: string; body: string; type?: string }) {
    const users = await this.em.find(User, {
      where: { isActive: true },
      select: { id: true },
    });
    const type = dto.type ?? 'broadcast';
    const rows = users.map((u) =>
      this.em.create(Notification, {
        userId: u.id,
        type,
        title: dto.title,
        body: dto.body,
        isRead: false,
      }),
    );
    // batch insert in chunks
    const chunk = 100;
    for (let i = 0; i < rows.length; i += chunk) {
      await this.em.save(rows.slice(i, i + chunk));
    }
    return { sent: users.length };
  }

  // ── Veterinarians ──────────────────────────────────────────
  async listVeterinarians(q?: string, page = 1, limit = 20, id?: number) {
    const qb = this.em
      .createQueryBuilder(Veterinarian, 'v')
      .leftJoinAndSelect('v.user', 'user')
      .leftJoinAndSelect('v.clinics', 'clinics')
      .orderBy('v.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    applyFocusId(qb, 'v', id);
    if (q?.trim()) {
      qb.andWhere(
        '(v.licenseNumber ILIKE :term OR v.specialization ILIKE :term OR v.bio ILIKE :term OR user.email ILIKE :term OR user.firstName ILIKE :term OR user.lastName ILIKE :term)',
        { term: `%${q.trim()}%` },
      );
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async updateVeterinarian(
    id: number,
    dto: {
      isActive?: boolean;
      isVerified?: boolean;
      bio?: string;
      specialization?: string;
      licenseNumber?: string;
      clinicName?: string;
      city?: string;
      phone?: string;
    },
  ) {
    const vet = await this.em.findOne(Veterinarian, {
      where: { id },
      relations: { clinics: true },
    });
    if (!vet) throw new NotFoundException('Veterinarian not found');
    if (dto.isActive !== undefined) vet.isActive = dto.isActive;
    if (dto.isVerified !== undefined) vet.isVerified = dto.isVerified;
    if (dto.bio !== undefined) vet.bio = dto.bio;
    if (dto.specialization !== undefined) vet.specialization = dto.specialization;
    if (dto.licenseNumber !== undefined) vet.licenseNumber = dto.licenseNumber;
    await this.em.save(vet);

    const clinic = vet.clinics?.[0];
    if (
      clinic &&
      (dto.clinicName !== undefined || dto.city !== undefined || dto.phone !== undefined)
    ) {
      if (dto.clinicName !== undefined) clinic.name = dto.clinicName;
      if (dto.city !== undefined) clinic.city = dto.city;
      if (dto.phone !== undefined) clinic.phone = dto.phone;
      await this.em.save(VeterinarianClinic, clinic);
    }
    return this.em.findOne(Veterinarian, {
      where: { id },
      relations: { user: true, clinics: true },
    });
  }

  async getVeterinarian(id: number) {
    const vet = await this.em.findOne(Veterinarian, {
      where: { id },
      relations: { user: true, clinics: true },
    });
    if (!vet) throw new NotFoundException('Veterinarian not found');
    return vet;
  }

  async deleteVeterinarian(id: number) {
    const vet = await this.em.findOne(Veterinarian, { where: { id } });
    if (!vet) throw new NotFoundException('Veterinarian not found');
    await this.em.remove(vet);
    return { success: true };
  }

  // ── Shelters ───────────────────────────────────────────────
  async listShelters(q?: string, page = 1, limit = 20, id?: number) {
    const qb = this.em
      .createQueryBuilder(Shelter, 's')
      .orderBy('s.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    applyFocusId(qb, 's', id);
    if (q?.trim()) {
      qb.andWhere(
        '(s.name ILIKE :term OR s.city ILIKE :term OR s.district ILIKE :term OR s.email ILIKE :term OR s.phone ILIKE :term)',
        { term: `%${q.trim()}%` },
      );
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async upsertShelter(dto: Partial<Shelter> & { name: string; userId: number }) {
    let shelter: Shelter | null = null;
    if (dto.id) {
      shelter = await this.em.findOne(Shelter, { where: { id: dto.id } });
    }
    if (!shelter) {
      shelter = this.em.create(Shelter, {
        userId: dto.userId,
        name: dto.name,
        address: dto.address ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        city: dto.city ?? null,
        district: dto.district ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        website: dto.website ?? null,
        isVerified: dto.isVerified ?? false,
        isActive: dto.isActive ?? true,
      });
    } else {
      Object.assign(shelter, {
        name: dto.name,
        address: dto.address ?? shelter.address,
        latitude: dto.latitude ?? shelter.latitude,
        longitude: dto.longitude ?? shelter.longitude,
        city: dto.city ?? shelter.city,
        district: dto.district ?? shelter.district,
        phone: dto.phone ?? shelter.phone,
        email: dto.email ?? shelter.email,
        website: dto.website ?? shelter.website,
        isVerified: dto.isVerified ?? shelter.isVerified,
        isActive: dto.isActive ?? shelter.isActive,
        userId: dto.userId ?? shelter.userId,
      });
    }
    return this.em.save(shelter);
  }

  async deleteShelter(id: number) {
    const s = await this.em.findOne(Shelter, { where: { id } });
    if (!s) throw new NotFoundException('Shelter not found');
    await this.em.remove(s);
    return { success: true };
  }

  // ── Temperaments ───────────────────────────────────────────
  async listTemperaments(q?: string, page = 1, limit = 20, id?: number) {
    const qb = this.em.createQueryBuilder(Temperament, 't').orderBy('t.name', 'ASC');
    applyFocusId(qb, 't', id);
    if (q?.trim()) qb.andWhere('t.name ILIKE :term', { term: `%${q.trim()}%` });
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total, page, limit };
  }

  async createTemperament(name: string) {
    const existing = await this.em.findOne(Temperament, { where: { name } });
    if (existing) throw new BadRequestException('Temperament already exists');
    return this.em.save(this.em.create(Temperament, { name }));
  }

  async updateTemperament(id: number, name: string) {
    const t = await this.em.findOne(Temperament, { where: { id } });
    if (!t) throw new NotFoundException('Temperament not found');
    const clash = await this.em.findOne(Temperament, { where: { name } });
    if (clash && clash.id !== id) {
      throw new BadRequestException('Temperament already exists');
    }
    t.name = name;
    return this.em.save(t);
  }

  async deleteTemperament(id: number) {
    const t = await this.em.findOne(Temperament, { where: { id } });
    if (!t) throw new NotFoundException('Temperament not found');
    await this.em.remove(t);
    return { success: true };
  }

  // ── CMS ────────────────────────────────────────────────────
  async listCmsPages(q?: string, page = 1, limit = 20, publishedOnly = false, id?: number) {
    const qb = this.em
      .createQueryBuilder(CmsPage, 'p')
      .orderBy('p.sortOrder', 'ASC')
      .addOrderBy('p.title', 'ASC');
    if (publishedOnly) qb.andWhere('p.isPublished = true');
    applyFocusId(qb, 'p', id);
    if (q?.trim()) {
      qb.andWhere(
        '(p.slug ILIKE :term OR p.title ILIKE :term OR p.excerpt ILIKE :term)',
        { term: `%${q.trim()}%` },
      );
    }
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total, page, limit };
  }

  async listPublishedPages() {
    return this.em.find(CmsPage, {
      where: { isPublished: true },
      order: { sortOrder: 'ASC', title: 'ASC' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        seoDescription: true,
        sortOrder: true,
        updatedAt: true,
      },
    });
  }

  async getCmsPage(id: number) {
    const page = await this.em.findOne(CmsPage, { where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async getPublishedPageBySlug(slug: string) {
    const page = await this.em.findOne(CmsPage, {
      where: { slug, isPublished: true },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async upsertCmsPage(dto: {
    id?: number;
    slug: string;
    title: string;
    excerpt?: string;
    body: string;
    seoDescription?: string;
    sortOrder?: number;
    isPublished?: boolean;
  }) {
    let page: CmsPage | null = null;
    if (dto.id) page = await this.em.findOne(CmsPage, { where: { id: dto.id } });
    if (!page) page = await this.em.findOne(CmsPage, { where: { slug: dto.slug } });
    if (!page) {
      page = this.em.create(CmsPage, {
        slug: dto.slug,
        title: dto.title,
        excerpt: dto.excerpt ?? null,
        body: dto.body,
        seoDescription: dto.seoDescription ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isPublished: dto.isPublished ?? true,
      });
    } else {
      page.slug = dto.slug;
      page.title = dto.title;
      if (dto.excerpt !== undefined) page.excerpt = dto.excerpt;
      page.body = dto.body;
      if (dto.seoDescription !== undefined) page.seoDescription = dto.seoDescription;
      if (dto.sortOrder !== undefined) page.sortOrder = dto.sortOrder;
      if (dto.isPublished !== undefined) page.isPublished = dto.isPublished;
    }
    return this.em.save(page);
  }

  async deleteCmsPage(id: number) {
    const page = await this.em.findOne(CmsPage, { where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    await this.em.remove(page);
    return { success: true };
  }

  async getWebConfig() {
    const keys = [
      'web.heroTitle',
      'web.heroSubtitle',
      'web.appStoreUrl',
      'web.playStoreUrl',
      'web.heroImage',
    ];
    const rows = await this.em.find(AppSetting, {
      where: keys.map((key) => ({ key })),
    });
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    return {
      heroTitle: map['web.heroTitle'] || 'PawMatch',
      heroSubtitle:
        map['web.heroSubtitle'] ||
        'Tüylü dostun için eşleşme. Sahiplen veya oyun arkadaşı bul — swipe ile.',
      appStoreUrl: map['web.appStoreUrl'] || '#',
      playStoreUrl: map['web.playStoreUrl'] || '#',
      heroImage: map['web.heroImage'] || '',
    };
  }

  assertStaff(user: User) {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
      throw new ForbiddenException('Admin access required');
    }
  }

  flattenObject = flattenObject;
}
