import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

type AppleDecodedProfile = {
  providerId: string;
  email?: string;
  firstName: string;
  lastName: string;
  picture: null;
};

@Injectable()
export class AppleOAuthService {
  constructor(private readonly configService: ConfigService) {}

  decodeIdToken(idToken: string): AppleDecodedProfile {
    const tokenParts = idToken.split('.');
    if (tokenParts.length !== 3) {
      throw new UnauthorizedException('Invalid Apple token');
    }

    const payloadBase64Url = tokenParts[1];
    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadBase64 + '='.repeat((4 - (payloadBase64.length % 4)) % 4);

    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    const providerId = String(payload.sub || '');
    if (!providerId) {
      throw new UnauthorizedException('Invalid Apple token payload');
    }

    const email = payload.email ? String(payload.email) : undefined;

    // Name is not always present in id_token; keep it best-effort.
    const fullName = String(payload.name || payload.full_name || '');
    const nameParts = fullName.split(' ').filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      providerId,
      email,
      firstName,
      lastName,
      picture: null,
    };
  }

  async exchangeAuthorizationCode(authorizationCode: string): Promise<string> {
    const appleClientId = this.configService.get('APPLE_CLIENT_ID');
    const appleTeamId = this.configService.get('APPLE_TEAM_ID');
    const appleKeyId = this.configService.get('APPLE_KEY_ID');
    const applePrivateKey = this.configService.get('APPLE_PRIVATE_KEY');

    if (
      !appleClientId ||
      !appleTeamId ||
      !appleKeyId ||
      !applePrivateKey ||
      applePrivateKey === 'your_apple_private_key_here'
    ) {
      throw new UnauthorizedException('Apple OAuth not configured');
    }

    // Private key is commonly stored with escaped newlines in .env.
    const privateKey = String(applePrivateKey).replace(/\\n/g, '\n');

    const now = Math.floor(Date.now() / 1000);
    const clientSecret = jwt.sign(
      {
        iss: appleTeamId,
        iat: now,
        exp: now + 60 * 60,
        aud: 'https://appleid.apple.com',
        sub: appleClientId,
      },
      privateKey,
      {
        algorithm: 'ES256',
        keyid: appleKeyId,
      },
    );

    const form = new URLSearchParams();
    form.append('client_id', appleClientId);
    form.append('client_secret', clientSecret);
    form.append('code', authorizationCode);
    form.append('grant_type', 'authorization_code');

    const response = await axios.post('https://appleid.apple.com/auth/token', form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const idToken = response.data?.id_token;
    if (!idToken) {
      throw new UnauthorizedException('Apple token exchange failed');
    }

    return String(idToken);
  }
}

