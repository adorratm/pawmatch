import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { UserLocation } from '../database/entities/user-location.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(UserLocation)
    private userLocationRepository: Repository<UserLocation>,
    private uploadsService: UploadsService,
  ) {}

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'locations'],
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
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

    await this.userRepository.save(user);

    if (!user.profile) {
      user.profile = this.userProfileRepository.create({ userId });
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

    await this.userProfileRepository.save(user.profile);

    return this.findById(userId);
  }

  async updateLocation(userId: number, updateLocationDto: UpdateLocationDto) {
    // Mark all existing locations as not current
    await this.userLocationRepository.update(
      { userId },
      { isCurrent: false },
    );

    // Create new current location
    const location = this.userLocationRepository.create({
      userId,
      ...updateLocationDto,
      isCurrent: true,
    });

    await this.userLocationRepository.save(location);

    return location;
  }

  async uploadAvatar(userId: number, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profile) {
      user.profile = this.userProfileRepository.create({ userId });
    }

    const avatarUrl = await this.uploadsService.uploadFile(file);
    user.profile.avatar = avatarUrl;
    await this.userProfileRepository.save(user.profile);

    return { avatar: avatarUrl };
  }
}

