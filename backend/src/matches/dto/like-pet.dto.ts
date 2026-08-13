import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class LikePetDto {
  @IsOptional()
  @IsBoolean()
  isSuperLike?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  likerPetId?: number;
}
