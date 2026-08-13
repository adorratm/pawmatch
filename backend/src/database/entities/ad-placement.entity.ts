import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AdCreative } from './ad-creative.entity';

@Entity('ad_placements')
export class AdPlacement {
  @PrimaryGeneratedColumn()
  id: number;

  /** Slot key: discover | chat | settings | etc. */
  @Column({ unique: true, length: 64 })
  key: string;

  @Column({ length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AdCreative, (creative) => creative.placement)
  creatives: AdCreative[];
}
