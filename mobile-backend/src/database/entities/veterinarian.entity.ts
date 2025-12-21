import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { VeterinarianClinic } from './veterinarian-clinic.entity';

@Entity('veterinarians')
export class Veterinarian {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  licenseNumber: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  experienceYears: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => VeterinarianClinic, (clinic) => clinic.veterinarian)
  clinics: VeterinarianClinic[];
}

