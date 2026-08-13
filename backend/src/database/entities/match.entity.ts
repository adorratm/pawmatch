import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pet } from './pet.entity';
import { Conversation } from './conversation.entity';
import { User } from './user.entity';

@Entity('matches')
@Index(['pet1Id', 'pet2Id'])
@Index(['user1Id', 'pet2Id'])
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  /** Playmate: liker's pet. Adoption: null */
  @Column({ nullable: true })
  pet1Id: number | null;

  @Column()
  pet2Id: number;

  /** Adoption: adopter user id. Playmate: optional owner of pet1 */
  @Column({ nullable: true })
  user1Id: number | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  matchedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Pet, { nullable: true })
  @JoinColumn({ name: 'pet1Id' })
  pet1: Pet | null;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet2Id' })
  pet2: Pet;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user1Id' })
  user1: User | null;

  @OneToOne(() => Conversation, (conversation) => conversation.match)
  conversation: Conversation;
}
