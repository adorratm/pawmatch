import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { TranslationLocale } from './translation-locale.entity';

@Entity('translation_entries')
@Unique(['localeId', 'key'])
@Index(['localeId'])
export class TranslationEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  localeId: number;

  /** Dot-path key, e.g. common.ok */
  @Column({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TranslationLocale, (locale) => locale.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'localeId' })
  locale: TranslationLocale;
}
