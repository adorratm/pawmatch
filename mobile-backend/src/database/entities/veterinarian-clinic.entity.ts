import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Veterinarian } from './veterinarian.entity';
import { VeterinarianService } from './veterinarian-service.entity';
import { Appointment } from './appointment.entity';

@Entity('veterinarian_clinics')
@Index(['latitude', 'longitude'])
export class VeterinarianClinic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  veterinarianId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Veterinarian, (vet) => vet.clinics)
  @JoinColumn({ name: 'veterinarianId' })
  veterinarian: Veterinarian;

  @OneToMany(() => VeterinarianService, (service) => service.clinic)
  services: VeterinarianService;

  @OneToMany(() => Appointment, (appointment) => appointment.clinic)
  appointments: Appointment[];
}

