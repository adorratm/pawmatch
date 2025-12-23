import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from './pet.entity';

@Entity('match_dislikes')
export class MatchDislike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dislikerPetId: number;

  @Column()
  dislikedPetId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'dislikerPetId' })
  dislikerPet: Pet;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'dislikedPetId' })
  dislikedPet: Pet;
}


