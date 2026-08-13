import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Credentials, OAuth2Client } from 'google-auth-library';
import axios from 'axios';

@Injectable()
export class GoogleOAuthService {
  constructor(private readonly configService: ConfigService) {
  }

  private resolveAudiences(preferredAudience?: string) {
    return this.configService.get('GOOGLE_CLIENT_ID');
  }

  private createClient(clientId?: string) {
    const secret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const effectiveId = clientId || this.configService.get('GOOGLE_CLIENT_ID');
    if (!effectiveId) {
      throw new UnauthorizedException(
        'Google OAuth not configured. Set GOOGLE_CLIENT_ID/SECRET in backend/.env (same Web client as EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).',
      );
    }
    return {
      client: new OAuth2Client(effectiveId, secret),
      clientId: effectiveId,
    };
  }

  async getProfile(idToken: string, preferredAudience?: string) {
    const { client } = this.createClient(preferredAudience);
    const audience = this.configService.get('GOOGLE_CLIENT_ID');
    if (!audience) {
      throw new UnauthorizedException(
        'Google OAuth not configured. Set GOOGLE_CLIENT_ID in backend/.env.',
      );
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return {
      providerId: payload.sub || '',
      email: payload.email,
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      picture: payload.picture || null,
    };
  }

  async getProfileByAccessToken(accessToken: string) {
    const response = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = response.data || {};
    if (!data.sub || !data.email) {
      throw new UnauthorizedException('Invalid Google access token');
    }

    return {
      providerId: String(data.sub),
      email: String(data.email),
      firstName: String(data.given_name || ''),
      lastName: String(data.family_name || ''),
      picture: data.picture ? String(data.picture) : null,
    };
  }

  async getProfileByAuthorizationCode(
    authorizationCode: string,
    redirectUri?: string,
    codeVerifier?: string,
    clientId?: string,
  ) {
    const { client: exchangeClient, clientId: effectiveClientId } = this.createClient(clientId);

    const attempts: Array<{
      code: string;
      codeVerifier?: string;
      redirect_uri?: string;
    }> = [];

    const base = {
      code: authorizationCode,
      ...(codeVerifier ? { codeVerifier } : {}),
    };

    if (redirectUri) {
      attempts.push({ ...base, redirect_uri: redirectUri });
    }
    attempts.push({ ...base });

    let lastError: unknown;
    let tokens: Credentials | undefined;
    for (const req of attempts) {
      try {
        const result = await exchangeClient.getToken(req);
        tokens = result.tokens;
        if (tokens) break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!tokens) {
      throw lastError || new UnauthorizedException('Google code exchange failed');
    }

    if (tokens.id_token) {
      return this.getProfile(tokens.id_token, effectiveClientId);
    }

    if (tokens.access_token) {
      return this.getProfileByAccessToken(tokens.access_token);
    }

    throw new UnauthorizedException('Google code exchange failed');
  }
}
