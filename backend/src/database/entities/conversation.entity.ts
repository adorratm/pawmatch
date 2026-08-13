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
import { User } from './user.entity';

@Entity('conversations')
@Index(['matchId'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  matchId: number;

  @Column({ nullable: true })
  pet1Id: number | null;

  @Column()
  pet2Id: number;

  @Column({ nullable: true })
  user1Id: number | null;

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

  @ManyToOne(() => Pet, { nullable: true })
  @JoinColumn({ name: 'pet1Id' })
  pet1: Pet | null;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet2Id' })
  pet2: Pet;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user1Id' })
  user1: User | null;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
