import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupportTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsString()
  @MaxLength(8000)
  message: string;
}
