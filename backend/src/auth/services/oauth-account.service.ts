import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TokenService } from './token.service';
import { OAuthAccount, OAuthProvider } from '../../database/entities/oauth-account.entity';
import { User } from '../../database/entities/user.entity';
import { UserProfile } from '../../database/entities/user-profile.entity';

@Injectable()
export class OAuthAccountService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly tokenService: TokenService,
  ) {}

  async findOrCreateOAuthUser(
    provider: OAuthProvider,
    providerId: string,
    email: string,
    firstName: string,
    lastName: string,
    picture: string | null,
  ) {
    return this.entityManager.transaction(async (manager) => {
      let oauthAccount = await manager.findOne(OAuthAccount, {
        where: { provider, providerId },
        relations: { user: { profile: true } },
      });

      let user: User;

      if (oauthAccount) {
        user = oauthAccount.user;
      } else {
        // Check if user with email exists
        user = await manager.findOne(User, {
          where: { email },
          relations: { profile: true },
        });

        if (!user) {
          user = manager.create(User, {
            email,
            firstName,
            lastName,
            isActive: true,
          });
          user = await manager.save(user);
        }

        // Ensure profile exists (UserProfile has nullable columns, so minimal creation is enough)
        let profile = user.profile;
        if (!profile) {
          profile = manager.create(UserProfile, {
            userId: user.id,
            avatar: picture,
          });
          profile = await manager.save(profile);
          user.profile = profile;
        }

        // Create OAuth account
        oauthAccount = manager.create(OAuthAccount, {
          userId: user.id,
          provider,
          providerId,
        });
        await manager.save(oauthAccount);
      }

      // Generate tokens
      const tokens = this.tokenService.generateTokens(user);

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
    });
  }

  async findUserByOAuthAccount(provider: OAuthProvider, providerId: string): Promise<User | null> {
    const oauthAccount = await this.entityManager.findOne(OAuthAccount, {
      where: { provider, providerId },
      relations: { user: { profile: true } },
    });

    return oauthAccount?.user ?? null;
  }
}

