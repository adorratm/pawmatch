import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { OAuthAccount, OAuthProvider } from '../database/entities/oauth-account.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthGoogleDto } from './dto/oauth-google.dto';
import { OAuthFacebookDto } from './dto/oauth-facebook.dto';
import { OAuthAppleDto } from './dto/oauth-apple.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(OAuthAccount)
    private oauthAccountRepository: Repository<OAuthAccount>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    if (googleClientId && googleClientId !== 'your_google_client_id_here') {
      this.googleClient = new OAuth2Client(googleClientId);
    }
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      phone,
      firstName,
      lastName,
    });

    const savedUser = await this.userRepository.save(user);

    // Create user profile
    const profile = this.userProfileRepository.create({
      userId: savedUser.id,
    });
    await this.userProfileRepository.save(profile);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      ...tokens,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profile: user.profile,
      },
    };
  }

  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.validateUser(payload.sub);
      return await this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async googleLogin(oauthDto: OAuthGoogleDto) {
    try {
      if (!this.googleClient) {
        throw new UnauthorizedException('Google OAuth not configured');
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: oauthDto.idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return await this.findOrCreateOAuthUser(
        OAuthProvider.GOOGLE,
        payload.sub,
        payload.email,
        payload.given_name || '',
        payload.family_name || '',
        payload.picture,
      );
    } catch (error) {
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async facebookLogin(oauthDto: OAuthFacebookDto) {
    try {
      const facebookAppId = this.configService.get('FACEBOOK_APP_ID');
      if (!facebookAppId || facebookAppId === 'your_facebook_app_id_here') {
        throw new UnauthorizedException('Facebook OAuth not configured');
      }

      // Verify token and get user info
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${oauthDto.accessToken}`,
      );

      const { id, name, email } = response.data;
      if (!email) {
        throw new UnauthorizedException('Email not provided by Facebook');
      }

      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return await this.findOrCreateOAuthUser(
        OAuthProvider.FACEBOOK,
        id,
        email,
        firstName,
        lastName,
        null,
      );
    } catch (error) {
      throw new UnauthorizedException('Facebook authentication failed');
    }
  }

  async appleLogin(oauthDto: OAuthAppleDto) {
    try {
      // Apple token verification is complex and requires JWT verification
      // For now, we'll decode the token (in production, verify with Apple's public keys)
      const tokenParts = oauthDto.idToken.split('.');
      if (tokenParts.length !== 3) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Invalid Apple token payload');
      }

      // Apple provides email in token, name might be in user info
      const nameParts = (payload.name || '').split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return await this.findOrCreateOAuthUser(
        OAuthProvider.APPLE,
        payload.sub,
        payload.email,
        firstName,
        lastName,
        null,
      );
    } catch (error) {
      throw new UnauthorizedException('Apple authentication failed');
    }
  }

  private async findOrCreateOAuthUser(
    provider: OAuthProvider,
    providerId: string,
    email: string,
    firstName: string,
    lastName: string,
    picture: string | null,
  ) {
    // Check if OAuth account exists
    let oauthAccount = await this.oauthAccountRepository.findOne({
      where: { provider, providerId },
      relations: ['user', 'user.profile'],
    });

    let user: User;

    if (oauthAccount) {
      user = oauthAccount.user;
    } else {
      // Check if user with email exists
      user = await this.userRepository.findOne({
        where: { email },
        relations: ['profile'],
      });

      if (!user) {
        // Create new user
        user = this.userRepository.create({
          email,
          firstName,
          lastName,
          isActive: true,
        });
        user = await this.userRepository.save(user);

        // Create profile
        const profile = this.userProfileRepository.create({
          userId: user.id,
          avatar: picture,
        });
        await this.userProfileRepository.save(profile);
        user.profile = profile;
      }

      // Create OAuth account
      oauthAccount = this.oauthAccountRepository.create({
        userId: user.id,
        provider,
        providerId,
      });
      await this.oauthAccountRepository.save(oauthAccount);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profile: user.profile,
      },
    };
  }
}


