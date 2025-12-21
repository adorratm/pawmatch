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

@Entity('match_likes')
@Index(['likerPetId', 'likedPetId'])
export class MatchLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  likerPetId: number;

  @Column()
  likedPetId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'likerPetId' })
  likerPet: Pet;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'likedPetId' })
  likedPet: Pet;
}

