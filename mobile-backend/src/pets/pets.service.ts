import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Pet } from '../database/entities/pet.entity';
import { PetPhoto } from '../database/entities/pet-photo.entity';
import { Temperament } from '../database/entities/temperament.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(PetPhoto)
    private petPhotoRepository: Repository<PetPhoto>,
    @InjectRepository(Temperament)
    private temperamentRepository: Repository<Temperament>,
    private uploadsService: UploadsService,
  ) {}

  async create(ownerId: number, createPetDto: CreatePetDto) {
    const { temperaments: temperamentNames, ...petData } = createPetDto;
    
    const pet = this.petRepository.create({
      ...petData,
      ownerId,
    });

    const savedPet = await this.petRepository.save(pet);

    // Handle temperaments
    if (temperamentNames && temperamentNames.length > 0) {
      const temperaments = await this.temperamentRepository.find({
        where: { name: In(temperamentNames) },
      });

      savedPet.temperaments = temperaments;
      await this.petRepository.save(savedPet);
    }

    return this.findOne(savedPet.id);
  }

  async findOne(id: number) {
    const pet = await this.petRepository.findOne({
      where: { id },
      relations: ['owner', 'photos', 'temperaments'],
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    return pet;
  }

  async findByOwner(ownerId: number) {
    return this.petRepository.find({
      where: { ownerId, isActive: true },
      relations: ['photos', 'temperaments'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, ownerId: number, updatePetDto: UpdatePetDto) {
    const pet = await this.petRepository.findOne({
      where: { id },
      relations: ['temperaments'],
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own pets');
    }

    Object.assign(pet, updatePetDto);

    if (updatePetDto.temperaments) {
      const temperaments = await this.temperamentRepository.find({
        where: { name: In(updatePetDto.temperaments) },
      });
      pet.temperaments = temperaments;
    }

    await this.petRepository.save(pet);

    return this.findOne(id);
  }

  async remove(id: number, ownerId: number) {
    const pet = await this.petRepository.findOne({
      where: { id },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own pets');
    }

    await this.petRepository.remove(pet);
  }

  async addPhoto(petId: number, ownerId: number, file: Express.Multer.File, isMain?: boolean) {
    const pet = await this.petRepository.findOne({
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
      await this.petPhotoRepository.update(
        { petId },
        { isMain: false },
      );
    }

    const photo = this.petPhotoRepository.create({
      petId,
      url,
      isMain: isMain || false,
      order: 0,
    });

    return this.petPhotoRepository.save(photo);
  }

  async removePhoto(photoId: number, ownerId: number) {
    const photo = await this.petPhotoRepository.findOne({
      where: { id: photoId },
      relations: ['pet'],
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.pet.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete photos from your own pets');
    }

    await this.petPhotoRepository.remove(photo);
  }
}

