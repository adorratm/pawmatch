import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { VeterinarianClinic } from './veterinarian-clinic.entity';

@Entity('clinic_reviews')
@Index(['clinicId'])
export class ClinicReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clinicId: number;

  @Column()
  userId: number;

  @Column({ type: 'int' })
  overallRating: number;

  @Column({ type: 'int' })
  cleanlinessRating: number;

  @Column({ type: 'int' })
  serviceRating: number;

  @Column({ type: 'int' })
  valueRating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => VeterinarianClinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: VeterinarianClinic;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
