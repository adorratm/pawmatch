import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TranslationEntry } from './translation-entry.entity';

@Entity('translation_locales')
export class TranslationLocale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 16 })
  code: string;

  @Column({ length: 64 })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TranslationEntry, (entry) => entry.locale)
  entries: TranslationEntry[];
}
