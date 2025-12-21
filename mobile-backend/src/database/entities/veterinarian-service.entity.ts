import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VeterinarianClinic } from './veterinarian-clinic.entity';

@Entity('veterinarian_services')
export class VeterinarianService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clinicId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  duration: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => VeterinarianClinic, (clinic) => clinic.services)
  @JoinColumn({ name: 'clinicId' })
  clinic: VeterinarianClinic;
}

