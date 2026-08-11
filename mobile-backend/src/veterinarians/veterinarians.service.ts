import { Injectable, NotFoundException, ConflictException, OnModuleInit, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { VeterinarianClinic } from '../database/entities/veterinarian-clinic.entity';
import { Veterinarian } from '../database/entities/veterinarian.entity';
import { VeterinarianService as VetServiceEntity } from '../database/entities/veterinarian-service.entity';
import { ClinicReview } from '../database/entities/clinic-review.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { AppointmentSlot } from '../database/entities/appointment-slot.entity';
import { User } from '../database/entities/user.entity';
import { CreateClinicReviewDto } from './dto/create-clinic-review.dto';

@Injectable()
export class VeterinariansService implements OnModuleInit {
  private readonly logger = new Logger(VeterinariansService.name);

  constructor(
    private readonly entityManager: EntityManager,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureSampleClinics();
    } catch (error) {
      this.logger.warn(`Sample clinics could not be ensured: ${String(error)}`);
    }
  }

  /** Local/dev: create a few Istanbul clinics when the table is empty */
  private async ensureSampleClinics() {
    const existing = await this.entityManager.count(VeterinarianClinic);
    if (existing > 0) return;

    const users = await this.entityManager.find(User, { take: 1 });
    const user = users[0];
    if (!user) {
      this.logger.warn('No users found; skip sample clinic seed');
      return;
    }

    const samples = [
      {
        name: 'Paws & Claws Clinic',
        latitude: 41.0082,
        longitude: 28.9784,
        district: 'Fatih',
      },
      {
        name: 'Animal Care Center',
        latitude: 41.0122,
        longitude: 28.9824,
        district: 'Beyoğlu',
      },
      {
        name: 'Pet Health Clinic',
        latitude: 41.0042,
        longitude: 28.9744,
        district: 'Kadıköy',
      },
    ];

    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      const vet = await this.entityManager.save(
        this.entityManager.create(Veterinarian, {
          userId: user.id,
          licenseNumber: `DEMO-VET-${String(i + 1).padStart(3, '0')}`,
          specialization: 'General',
          experienceYears: 8 + i,
          bio: 'Modern ve donanımlı veteriner kliniği.',
          isVerified: true,
          isActive: true,
        }),
      );

      const clinic = await this.entityManager.save(
        this.entityManager.create(VeterinarianClinic, {
          veterinarianId: vet.id,
          name: sample.name,
          address: `${sample.district}, Istanbul`,
          latitude: sample.latitude,
          longitude: sample.longitude,
          city: 'Istanbul',
          district: sample.district,
          phone: `+90555100000${i}`,
          email: `demo${i + 1}@vet.com`,
          rating: 4.5,
          reviewCount: 12,
          isActive: true,
        }),
      );

      await this.entityManager.save([
        this.entityManager.create(VetServiceEntity, {
          clinicId: clinic.id,
          name: 'Genel Muayene',
          description: 'Rutin sağlık kontrolü',
          price: 500,
          duration: 30,
          isActive: true,
        }),
        this.entityManager.create(VetServiceEntity, {
          clinicId: clinic.id,
          name: 'Aşı',
          description: 'Koruyucu aşı uygulaması',
          price: 350,
          duration: 20,
          isActive: true,
        }),
      ]);
    }

    this.logger.log(`Seeded ${samples.length} sample veterinarian clinics`);
  }

  async findNearby(latitude: number, longitude: number, radius: number = 25) {
    await this.ensureSampleClinics();

    const clinics = await this.entityManager.find(VeterinarianClinic, {
      where: { isActive: true },
      relations: { veterinarian: true, services: true },
      take: 50,
    });

    const clinicsWithDistance = clinics
      .map((clinic) => {
        if (clinic.latitude == null || clinic.longitude == null) {
          return { ...clinic, distance: Number.POSITIVE_INFINITY };
        }
        const distance = this.calculateDistance(
          latitude,
          longitude,
          parseFloat(clinic.latitude.toString()),
          parseFloat(clinic.longitude.toString()),
        );
        return { ...clinic, distance };
      })
      .filter((clinic) => clinic.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

    // Dev / empty geo: still return active clinics so map/list are usable
    if (clinicsWithDistance.length === 0 && clinics.length > 0) {
      return {
        clinics: clinics.slice(0, 20).map((clinic) => ({
          ...clinic,
          distance: 0,
        })),
      };
    }

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
      relations: { veterinarian: true, services: true },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return clinic;
  }

  async getAppointments(userId: number) {
    return this.entityManager.find(Appointment, {
      where: { userId },
      relations: { clinic: true, pet: true, service: true },
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
      relations: { user: true },
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


