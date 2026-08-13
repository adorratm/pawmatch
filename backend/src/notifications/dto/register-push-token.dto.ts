import { IsIn, IsString, MinLength } from 'class-validator';

export class RegisterPushTokenDto {
  @IsString()
  @MinLength(20)
  token: string;

  @IsString()
  @IsIn(['ios', 'android', 'unknown'])
  platform: string;
}
