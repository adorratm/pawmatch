import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { UserLocation } from '../database/entities/user-location.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UploadsService } from '../uploads/uploads.service';

function mergePreferenceObjects(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...existing };
  for (const key of Object.keys(incoming)) {
    const inc = incoming[key];
    const ex = existing[key];
    if (
      inc !== null &&
      typeof inc === 'object' &&
      !Array.isArray(inc) &&
      ex !== null &&
      typeof ex === 'object' &&
      !Array.isArray(ex)
    ) {
      out[key] = mergePreferenceObjects(
        ex as Record<string, unknown>,
        inc as Record<string, unknown>,
      );
    } else {
      out[key] = inc;
    }
  }
  return out;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly uploadsService: UploadsService,
  ) {}

  async findById(id: number) {
    const user = await this.entityManager.findOne(User, {
      where: { id },
      relations: { profile: true, locations: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentLocation = user.locations?.find((loc) => loc.isCurrent);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profile: user.profile,
      location: currentLocation,
    };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    return this.entityManager.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        relations: { profile: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (updateProfileDto.firstName) {
        user.firstName = updateProfileDto.firstName;
      }
      if (updateProfileDto.lastName) {
        user.lastName = updateProfileDto.lastName;
      }

      await manager.save(user);

      if (!user.profile) {
        user.profile = manager.create(UserProfile, { userId });
      }

      if (updateProfileDto.bio !== undefined) {
        user.profile.bio = updateProfileDto.bio;
      }
      if (updateProfileDto.avatar !== undefined) {
        user.profile.avatar = updateProfileDto.avatar;
      }
      if (updateProfileDto.dateOfBirth !== undefined) {
        user.profile.dateOfBirth = new Date(updateProfileDto.dateOfBirth);
      }
      if (updateProfileDto.gender !== undefined) {
        user.profile.gender = updateProfileDto.gender;
      }
      if (updateProfileDto.preferences !== undefined) {
        const prev = (user.profile.preferences || {}) as Record<string, unknown>;
        user.profile.preferences = mergePreferenceObjects(
          prev,
          updateProfileDto.preferences as Record<string, unknown>,
        );
      }

      await manager.save(user.profile);

      return this.findById(userId);
    });
  }

  async updateLocation(userId: number, updateLocationDto: UpdateLocationDto) {
    return this.entityManager.transaction(async (manager) => {
      // Mark all existing locations as not current
      await manager.update(
        UserLocation,
        { userId },
        { isCurrent: false },
      );

      // Create new current location
      const location = manager.create(UserLocation, {
        userId,
        ...updateLocationDto,
        isCurrent: true,
      });

      return manager.save(location);
    });
  }

  async uploadAvatar(userId: number, file: Express.Multer.File) {
    return this.entityManager.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        relations: { profile: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.profile) {
        user.profile = manager.create(UserProfile, { userId });
      }

      const avatarUrl = await this.uploadsService.uploadFile(file);
      user.profile.avatar = avatarUrl;
      await manager.save(user.profile);

      return { avatar: avatarUrl };
    });
  }
}

