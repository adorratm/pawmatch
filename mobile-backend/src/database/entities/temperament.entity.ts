import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Pet } from './pet.entity';
import { PetTemperament } from './pet-temperament.entity';

@Entity('temperaments')
export class Temperament {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Pet, (pet) => pet.temperaments)
  pets: Pet[];

  @ManyToMany(() => PetTemperament, (pt) => pt.temperament)
  petTemperaments: PetTemperament[];
}

