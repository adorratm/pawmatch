import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { Pet } from '../database/entities/pet.entity';
import { PetPhoto } from '../database/entities/pet-photo.entity';
import { Temperament } from '../database/entities/temperament.entity';
import { PetTemperament } from '../database/entities/pet-temperament.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    UploadsModule,
  ],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}


