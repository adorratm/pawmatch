import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from './pet.entity';

@Entity('pet_photos')
export class PetPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  petId: number;

  @Column()
  url: string;

  @Column({ default: false })
  isMain: boolean;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Pet, (pet) => pet.photos)
  @JoinColumn({ name: 'petId' })
  pet: Pet;
}


