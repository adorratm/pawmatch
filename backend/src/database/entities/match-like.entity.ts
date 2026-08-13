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

@Entity('match_likes')
@Index(['likerPetId', 'likedPetId'])
@Index(['likerUserId', 'likedPetId'])
export class MatchLike {
  @PrimaryGeneratedColumn()
  id: number;

  /** Playmate likes — null for adoption (user-level) likes */
  @Column({ nullable: true })
  likerPetId: number | null;

  @Column()
  likedPetId: number;

  /** Always set for adoption likes; also set for playmate for easier queries */
  @Column({ nullable: true })
  likerUserId: number | null;

  @Column({ name: 'isSuperLike', default: false })
  isSuperLike: boolean;

  /** When owner accepts an adoption interest */
  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Pet, { nullable: true })
  @JoinColumn({ name: 'likerPetId' })
  likerPet: Pet | null;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'likedPetId' })
  likedPet: Pet;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'likerUserId' })
  likerUser: User | null;
}
