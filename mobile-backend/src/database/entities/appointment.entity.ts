import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VeterinarianClinic } from './veterinarian-clinic.entity';
import { Pet } from './pet.entity';
import { User } from './user.entity';
import { VeterinarianService } from './veterinarian-service.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clinicId: number;

  @Column()
  petId: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  serviceId: number;

  @Column({ type: 'timestamp' })
  appointmentDate: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => VeterinarianClinic, (clinic) => clinic.appointments)
  @JoinColumn({ name: 'clinicId' })
  clinic: VeterinarianClinic;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => VeterinarianService)
  @JoinColumn({ name: 'serviceId' })
  service: VeterinarianService;
}

