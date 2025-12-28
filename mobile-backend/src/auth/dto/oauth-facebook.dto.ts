import { IsString } from 'class-validator';

export class OAuthFacebookDto {
  @IsString()
  accessToken: string;
}

