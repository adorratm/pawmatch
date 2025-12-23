import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Match } from './match.entity';
import { Pet } from './pet.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Index(['matchId'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  matchId: number;

  @Column()
  pet1Id: number;

  @Column()
  pet2Id: number;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Match, (match) => match.conversation)
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet1Id' })
  pet1: Pet;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet2Id' })
  pet2: Pet;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}


