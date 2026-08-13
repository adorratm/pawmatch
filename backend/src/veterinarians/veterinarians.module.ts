import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeterinariansService } from './veterinarians.service';
import { VeterinariansController } from './veterinarians.controller';
import { Veterinarian } from '../database/entities/veterinarian.entity';
import { VeterinarianClinic } from '../database/entities/veterinarian-clinic.entity';
import { VeterinarianService } from '../database/entities/veterinarian-service.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { AppointmentSlot } from '../database/entities/appointment-slot.entity';
import { Pet } from '../database/entities/pet.entity';

@Module({
  imports: [],
  controllers: [VeterinariansController],
  providers: [VeterinariansService],
})
export class VeterinariansModule {}


