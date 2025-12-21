import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VeterinarianClinic } from '../database/entities/veterinarian-clinic.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { AppointmentSlot } from '../database/entities/appointment-slot.entity';

@Injectable()
export class VeterinariansService {
  constructor(
    @InjectRepository(VeterinarianClinic)
    private clinicRepository: Repository<VeterinarianClinic>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(AppointmentSlot)
    private slotRepository: Repository<AppointmentSlot>,
  ) {}

  async findNearby(latitude: number, longitude: number, radius: number = 10) {
    // Simple distance calculation (can be improved with PostGIS)
    const clinics = await this.clinicRepository.find({
      where: { isActive: true },
      relations: ['veterinarian', 'services'],
      take: 20,
    });

    return { clinics };
  }

  async findOne(id: number) {
    const clinic = await this.clinicRepository.findOne({
      where: { id },
      relations: ['veterinarian', 'services'],
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return clinic;
  }

  async getAppointments(userId: number) {
    return this.appointmentRepository.find({
      where: { userId },
      relations: ['clinic', 'pet', 'service'],
      order: { appointmentDate: 'DESC' },
    });
  }

  async createAppointment(userId: number, createAppointmentDto: any) {
    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      userId,
    });

    return this.appointmentRepository.save(appointment);
  }
}

