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
    const clinics = await this.clinicRepository.find({
      where: { isActive: true },
      relations: ['veterinarian', 'services'],
      take: 50,
    });

    // Calculate distance for each clinic
    const clinicsWithDistance = clinics
      .map((clinic) => {
        if (!clinic.latitude || !clinic.longitude) return null;
        const distance = this.calculateDistance(
          latitude,
          longitude,
          parseFloat(clinic.latitude.toString()),
          parseFloat(clinic.longitude.toString()),
        );
        return { ...clinic, distance };
      })
      .filter((clinic) => clinic !== null && clinic.distance <= radius)
      .sort((a, b) => (a?.distance || 0) - (b?.distance || 0))
      .slice(0, 20);

    return { clinics: clinicsWithDistance };
  }

  // Haversine formula to calculate distance
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
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


