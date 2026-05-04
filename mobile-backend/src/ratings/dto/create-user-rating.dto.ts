import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateUserRatingDto {
  @IsInt()
  rateeId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
