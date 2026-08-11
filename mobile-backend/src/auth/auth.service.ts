import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { OAuthProvider } from '../database/entities/oauth-account.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthGoogleDto } from './dto/oauth-google.dto';
import { OAuthFacebookDto } from './dto/oauth-facebook.dto';
import { OAuthAppleDto } from './dto/oauth-apple.dto';
import { TokenService } from './services/token.service';
import { UserAuthService } from './services/user-auth.service';
import { PasswordAuthService } from './services/password-auth.service';
import { OAuthAccountService } from './services/oauth-account.service';
import { GoogleOAuthService } from './services/google-oauth.service';
import { FacebookOAuthService } from './services/facebook-oauth.service';
import { AppleOAuthService } from './services/apple-oauth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly tokenService: TokenService,
    private readonly userAuthService: UserAuthService,
    private readonly passwordAuthService: PasswordAuthService,
    private readonly oauthAccountService: OAuthAccountService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly facebookOAuthService: FacebookOAuthService,
    private readonly appleOAuthService: AppleOAuthService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone } = registerDto;

    return this.entityManager.transaction(async (manager) => {
      // Check if user exists (phone optional — undefined where TypeORM'de hata verir)
      const existingUser = await manager.findOne(User, {
        where: phone ? [{ email }, { phone }] : [{ email }],
      });

      if (existingUser) {
        throw new ConflictException('User with this email or phone already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = manager.create(User, {
        email,
        password: hashedPassword,
        phone,
        firstName,
        lastName,
      });

      const savedUser = await manager.save(user);

      // Create user profile
      const profile = manager.create(UserProfile, {
        userId: savedUser.id,
      });
      await manager.save(profile);

      // Generate tokens
      const tokens = this.tokenService.generateTokens(savedUser);

      return {
        ...tokens,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
        },
      };
    });
  }

  async login(loginDto: LoginDto) {
    return this.passwordAuthService.login(loginDto.email, loginDto.password);
  }

  async validateUser(userId: number): Promise<User> {
    return this.userAuthService.validateUser(userId);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload: any = this.tokenService.verifyRefreshToken(refreshToken);

      const user = await this.validateUser(payload.sub);
      return this.tokenService.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async googleLogin(oauthDto: OAuthGoogleDto) {
    try {
      if (!oauthDto.idToken && !oauthDto.accessToken && !oauthDto.authorizationCode) {
        throw new UnauthorizedException('Google token missing');
      }

      const profile = oauthDto.idToken
        ? await this.googleOAuthService.getProfile(oauthDto.idToken, oauthDto.clientId)
        : oauthDto.accessToken
          ? await this.googleOAuthService.getProfileByAccessToken(String(oauthDto.accessToken))
          : await this.googleOAuthService.getProfileByAuthorizationCode(
              String(oauthDto.authorizationCode),
              oauthDto.redirectUri,
              oauthDto.codeVerifier,
              oauthDto.clientId,
            );

      return await this.oauthAccountService.findOrCreateOAuthUser(
        OAuthProvider.GOOGLE,
        profile.providerId,
        profile.email,
        profile.firstName,
        profile.lastName,
        profile.picture,
      );
    } catch (error) {
      const message =
        (error as any)?.response?.data?.error_description ||
        (error as any)?.response?.data?.error ||
        (error as any)?.message ||
        'Google authentication failed';
      console.error('Google OAuth error details:', {
        message,
        hasIdToken: !!oauthDto.idToken,
        hasAccessToken: !!oauthDto.accessToken,
        hasAuthorizationCode: !!oauthDto.authorizationCode,
        redirectUri: oauthDto.redirectUri,
        hasCodeVerifier: !!oauthDto.codeVerifier,
        clientId: oauthDto.clientId,
        rawError: (error as any)?.response?.data || (error as any)?.message || error,
      });
      throw new UnauthorizedException(`Google authentication failed: ${message}`);
    }
  }

  async facebookLogin(oauthDto: OAuthFacebookDto) {
    try {
      const profile = await this.facebookOAuthService.getProfile(oauthDto.accessToken);

      return await this.oauthAccountService.findOrCreateOAuthUser(
        OAuthProvider.FACEBOOK,
        profile.providerId,
        profile.email,
        profile.firstName,
        profile.lastName,
        profile.picture,
      );
    } catch (error) {
      throw new UnauthorizedException('Facebook authentication failed');
    }
  }

  async appleLogin(oauthDto: OAuthAppleDto) {
    try {
      const decoded = this.appleOAuthService.decodeIdToken(oauthDto.idToken);

      // First sign-in usually includes email; later sign-ins might not.
      if (decoded.email) {
        return await this.oauthAccountService.findOrCreateOAuthUser(
          OAuthProvider.APPLE,
          decoded.providerId,
          decoded.email,
          decoded.firstName,
          decoded.lastName,
          decoded.picture,
        );
      }

      // If email is missing, try to login by oauth_account first.
      const existingUser = await this.oauthAccountService.findUserByOAuthAccount(
        OAuthProvider.APPLE,
        decoded.providerId,
      );

      if (existingUser) {
        const tokens = this.tokenService.generateTokens(existingUser);
        return {
          ...tokens,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            profile: existingUser.profile,
          },
        };
      }

      // If we still don't have an account, exchange authorizationCode to get an email.
      if (!oauthDto.authorizationCode) {
        throw new UnauthorizedException('Email not provided by Apple');
      }

      const exchangedIdToken = await this.appleOAuthService.exchangeAuthorizationCode(oauthDto.authorizationCode);
      const exchangedProfile = this.appleOAuthService.decodeIdToken(exchangedIdToken);

      if (!exchangedProfile.email) {
        throw new UnauthorizedException('Email not provided by Apple');
      }

      return await this.oauthAccountService.findOrCreateOAuthUser(
        OAuthProvider.APPLE,
        exchangedProfile.providerId,
        exchangedProfile.email,
        exchangedProfile.firstName,
        exchangedProfile.lastName,
        exchangedProfile.picture,
      );
    } catch (error) {
      throw new UnauthorizedException('Apple authentication failed');
    }
  }
}


