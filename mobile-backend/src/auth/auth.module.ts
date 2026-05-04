import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { OAuthAccount } from '../database/entities/oauth-account.entity';
import { UsersModule } from '../users/users.module';
import { TokenService } from './services/token.service';
import { UserAuthService } from './services/user-auth.service';
import { PasswordAuthService } from './services/password-auth.service';
import { OAuthAccountService } from './services/oauth-account.service';
import { GoogleOAuthService } from './services/google-oauth.service';
import { FacebookOAuthService } from './services/facebook-oauth.service';
import { AppleOAuthService } from './services/apple-oauth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // legacy passport strategies (currently not used by our controller endpoints, but keep for compatibility)
    GoogleStrategy,
    FacebookStrategy,
    // SOLID auth services
    TokenService,
    UserAuthService,
    PasswordAuthService,
    OAuthAccountService,
    GoogleOAuthService,
    FacebookOAuthService,
    AppleOAuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}


