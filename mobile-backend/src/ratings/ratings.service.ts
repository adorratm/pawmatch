import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Rating } from '../database/entities/rating.entity';
import { User } from '../database/entities/user.entity';
import { CreateUserRatingDto } from './dto/create-user-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly entityManager: EntityManager) {}

  async createOrUpdateUserRating(raterId: number, dto: CreateUserRatingDto) {
    if (dto.rateeId === raterId) {
      throw new BadRequestException('Kendinizi değerlendiremezsiniz');
    }
    const ratee = await this.entityManager.findOne(User, {
      where: { id: dto.rateeId },
    });
    if (!ratee) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    let row = await this.entityManager.findOne(Rating, {
      where: { raterId, rateeId: dto.rateeId },
    });
    if (!row) {
      row = this.entityManager.create(Rating, {
        raterId,
        rateeId: dto.rateeId,
        rating: dto.rating,
        comment: dto.comment ?? null,
      });
    } else {
      row.rating = dto.rating;
      row.comment = dto.comment ?? null;
    }
    await this.entityManager.save(row);
    return {
      success: true,
      id: row.id,
      rating: row.rating,
      comment: row.comment,
    };
  }

  async listRatingsForUser(userId: number) {
    const list = await this.entityManager.find(Rating, {
      where: { rateeId: userId },
      relations: { rater: true },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return {
      ratings: list.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        rater: r.rater
          ? {
              id: r.rater.id,
              firstName: r.rater.firstName,
              lastName: r.rater.lastName,
            }
          : null,
      })),
    };
  }
}
