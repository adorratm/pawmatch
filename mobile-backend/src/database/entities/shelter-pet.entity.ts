import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shelter } from './shelter.entity';
import { Pet } from './pet.entity';

@Entity('shelter_pets')
export class ShelterPet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shelterId: number;

  @Column()
  petId: number;

  @Column({ type: 'date', nullable: true })
  intakeDate: Date;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Shelter, (shelter) => shelter.shelterPets)
  @JoinColumn({ name: 'shelterId' })
  shelter: Shelter;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'petId' })
  pet: Pet;
}

