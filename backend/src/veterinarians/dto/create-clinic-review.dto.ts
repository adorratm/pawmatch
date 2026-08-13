import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateClinicReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating: number;

  @IsInt()
  @Min(1)
  @Max(5)
  cleanlinessRating: number;

  @IsInt()
  @Min(1)
  @Max(5)
  serviceRating: number;

  @IsInt()
  @Min(1)
  @Max(5)
  valueRating: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
