import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pet } from './pet.entity';
import { User } from './user.entity';

@Entity('match_dislikes')
@Index(['dislikerPetId', 'dislikedPetId'])
@Index(['dislikerUserId', 'dislikedPetId'])
export class MatchDislike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  dislikerPetId: number | null;

  @Column()
  dislikedPetId: number;

  @Column({ nullable: true })
  dislikerUserId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Pet, { nullable: true })
  @JoinColumn({ name: 'dislikerPetId' })
  dislikerPet: Pet | null;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'dislikedPetId' })
  dislikedPet: Pet;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'dislikerUserId' })
  dislikerUser: User | null;
}
