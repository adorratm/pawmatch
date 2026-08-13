import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VeterinarianClinic } from './veterinarian-clinic.entity';

@Entity('appointment_slots')
export class AppointmentSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clinicId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => VeterinarianClinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: VeterinarianClinic;
}


