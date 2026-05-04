import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DislikePetDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dislikerPetId?: number;
}
