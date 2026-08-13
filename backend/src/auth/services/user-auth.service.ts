import { EntityManager } from 'typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class UserAuthService {
  constructor(private readonly entityManager: EntityManager) {}

  async validateUser(userId: number): Promise<User> {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: { profile: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}

