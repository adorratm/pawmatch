import { Type } from 'class-transformer';
import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { PetSpecies, PetGender } from '../../database/entities/pet.entity';

export class CreatePetDto {
  @IsString()
  name: string;

  @IsEnum(PetSpecies)
  species: PetSpecies;

  @IsOptional()
  @IsString()
  breed?: string;

  @Type(() => Number)
  @IsNumber()
  age: number;

  @IsEnum(PetGender)
  gender: PetGender;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsBoolean()
  isSpayed?: boolean;

  @IsOptional()
  @IsBoolean()
  isVaccinated?: boolean;

  @IsOptional()
  @IsString()
  healthNotes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temperaments?: string[];
}


