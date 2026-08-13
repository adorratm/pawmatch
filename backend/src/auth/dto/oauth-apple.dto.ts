import { IsString, IsOptional } from 'class-validator';

export class OAuthAppleDto {
  @IsString()
  idToken: string;

  @IsOptional()
  @IsString()
  authorizationCode?: string;
}

