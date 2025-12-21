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

@Entity('matches')
@Index(['pet1Id', 'pet2Id'])
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pet1Id: number;

  @Column()
  pet2Id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  matchedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet1Id' })
  pet1: Pet;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet2Id' })
  pet2: Pet;

  @OneToOne(() => Conversation, (conversation) => conversation.match)
  conversation: Conversation;
}

