import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from './pet.entity';
import { Temperament } from './temperament.entity';

@Entity('pet_temperaments')
export class PetTemperament {
  @PrimaryColumn()
  petId: number;

  @PrimaryColumn()
  temperamentId: number;

  @ManyToOne(() => Pet, (pet) => pet.petTemperaments)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @ManyToOne(() => Temperament)
  @JoinColumn({ name: 'temperamentId' })
  temperament: Temperament;
}


