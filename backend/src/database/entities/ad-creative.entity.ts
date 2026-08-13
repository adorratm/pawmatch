import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AdPlacement } from './ad-placement.entity';

@Entity('ad_creatives')
@Index(['placementId'])
export class AdCreative {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  placementId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Column({ length: 128, nullable: true })
  ctaLabel: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  ctaUrl: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  imageUrl: string | null;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => AdPlacement, (placement) => placement.creatives, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'placementId' })
  placement: AdPlacement;
}
