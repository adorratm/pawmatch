import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  /** free | gold | ... */
  @Column({ unique: true, length: 64 })
  tier: string;

  @Column({ length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  productId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  priceLabel: string | null;

  @Column({ type: 'simple-json', nullable: true })
  features: string[] | null;

  @Column({ default: 0 })
  superlikesWeeklyLimit: number;

  @Column({ default: false })
  removesAds: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
