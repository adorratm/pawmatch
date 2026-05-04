import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { VeterinarianClinic } from '../database/entities/veterinarian-clinic.entity';
import { ClinicReview } from '../database/entities/clinic-review.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { AppointmentSlot } from '../database/entities/appointment-slot.entity';
import { CreateClinicReviewDto } from './dto/create-clinic-review.dto';

@Injectable()
export class VeterinariansService {
  constructor(
    private readonly entityManager: EntityManager,
  ) {}

  async findNearby(latitude: number, longitude: number, radius: number = 10) {
    const clinics = await this.entityManager.find(VeterinarianClinic, {
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
    const clinic = await this.entityManager.findOne(VeterinarianClinic, {
      where: { id },
      relations: ['veterinarian', 'services'],
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return clinic;
  }

  async getAppointments(userId: number) {
    return this.entityManager.find(Appointment, {
      where: { userId },
      relations: ['clinic', 'pet', 'service'],
      order: { appointmentDate: 'DESC' },
    });
  }

  async createAppointment(userId: number, createAppointmentDto: any) {
    const appointment = this.entityManager.create(Appointment, {
      ...createAppointmentDto,
      userId,
    });

    return this.entityManager.save(appointment);
  }

  async listClinicReviews(clinicId: number) {
    const clinic = await this.entityManager.findOne(VeterinarianClinic, {
      where: { id: clinicId },
    });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    const reviews = await this.entityManager.find(ClinicReview, {
      where: { clinicId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        overallRating: r.overallRating,
        cleanlinessRating: r.cleanlinessRating,
        serviceRating: r.serviceRating,
        valueRating: r.valueRating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: r.user
          ? { id: r.user.id, firstName: r.user.firstName, lastName: r.user.lastName }
          : null,
      })),
    };
  }

  async createClinicReview(clinicId: number, userId: number, dto: CreateClinicReviewDto) {
    const clinic = await this.entityManager.findOne(VeterinarianClinic, {
      where: { id: clinicId },
    });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    const existing = await this.entityManager.findOne(ClinicReview, {
      where: { clinicId, userId },
    });
    if (existing) {
      throw new ConflictException('Bu klinik için zaten değerlendirme gönderdiniz');
    }
    const review = this.entityManager.create(ClinicReview, {
      clinicId,
      userId,
      overallRating: dto.overallRating,
      cleanlinessRating: dto.cleanlinessRating,
      serviceRating: dto.serviceRating,
      valueRating: dto.valueRating,
      comment: dto.comment ?? null,
    });
    await this.entityManager.save(review);
    await this.refreshClinicRatingAggregate(clinicId);
    return { success: true, id: review.id };
  }

  private async refreshClinicRatingAggregate(clinicId: number) {
    const raw = await this.entityManager
      .createQueryBuilder(ClinicReview, 'r')
      .select('AVG(r.overallRating)', 'avg')
      .addSelect('COUNT(r.id)', 'cnt')
      .where('r.clinicId = :clinicId', { clinicId })
      .getRawOne<{ avg: string; cnt: string }>();
    const avg = raw?.avg != null ? parseFloat(raw.avg) : 0;
    const cnt = raw?.cnt != null ? parseInt(raw.cnt, 10) : 0;
    await this.entityManager.update(
      VeterinarianClinic,
      { id: clinicId },
      { rating: Math.round(avg * 10) / 10, reviewCount: cnt },
    );
  }
}


