import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { PetPhoto } from './pet-photo.entity';
import { Temperament } from './temperament.entity';
import { PetTemperament } from './pet-temperament.entity';

export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  OTHER = 'other',
}

export enum PetGender {
  MALE = 'male',
  FEMALE = 'female',
}

/** Listing intent — only one at a time; null = not listed */
export enum PetPurpose {
  PLAYMATE = 'playmate',
  ADOPTION = 'adoption',
}

@Entity('pets')
@Index(['ownerId'])
@Index(['species'])
@Index(['purpose'])
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PetSpecies,
  })
  species: PetSpecies;

  @Column({ nullable: true })
  breed: string;

  @Column()
  age: number;

  @Column({
    type: 'enum',
    enum: PetGender,
  })
  gender: PetGender;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: false })
  isSpayed: boolean;

  @Column({ default: false })
  isVaccinated: boolean;

  @Column({ type: 'text', nullable: true })
  healthNotes: string;

  @Column({ default: true })
  isActive: boolean;

  /** True when rehomed — pet is locked from further listing/matching */
  @Column({ default: false })
  isAdopted: boolean;

  @Column({
    type: 'enum',
    enum: PetPurpose,
    nullable: true,
    default: null,
  })
  purpose: PetPurpose | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.pets)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => PetPhoto, (photo) => photo.pet)
  photos: PetPhoto[];

  @OneToMany(() => PetTemperament, (pt) => pt.pet)
  petTemperaments: PetTemperament[];

  @ManyToMany(() => Temperament, (temperament) => temperament.pets)
  @JoinTable({
    name: 'pet_temperaments',
    joinColumn: { name: 'petId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'temperamentId', referencedColumnName: 'id' },
  })
  temperaments: Temperament[];
}
