import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

@Injectable()
export class GoogleOAuthService {
  private googleClient: OAuth2Client | null;
  private googleAudiences: string[];

  constructor(private readonly configService: ConfigService) {
    const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const googleClientIdsRaw = this.configService.get('GOOGLE_CLIENT_IDS');

    this.googleAudiences = String(googleClientIdsRaw || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    if (googleClientId && !this.googleAudiences.includes(googleClientId)) {
      this.googleAudiences.push(googleClientId);
    }

    if (googleClientId && googleClientId !== 'your_google_client_id_here') {
      this.googleClient = new OAuth2Client(googleClientId, googleClientSecret);
    } else {
      this.googleClient = null;
    }
  }

  async getProfile(idToken: string, preferredAudience?: string) {
    if (!this.googleClient) {
      throw new UnauthorizedException('Google OAuth not configured');
    }

    const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    const dynamicAudiences = preferredAudience ? [preferredAudience] : [];
    const mergedAudiences = [...dynamicAudiences, ...this.googleAudiences].filter(Boolean);
    const audience = mergedAudiences.length > 0 ? mergedAudiences : googleClientId;
    const ticket = await this.googleClient.verifyIdToken({
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
    if (!this.googleClient && !clientId) {
      throw new UnauthorizedException('Google OAuth not configured');
    }

    const configuredClientId = this.configService.get('GOOGLE_CLIENT_ID');
    const configuredClientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const effectiveClientId = clientId || configuredClientId;
    const effectiveClientSecret = effectiveClientId === configuredClientId ? configuredClientSecret : undefined;
    const exchangeClient = new OAuth2Client(effectiveClientId, effectiveClientSecret);

    const tokenRequests: any[] = [];
    const baseRequest: any = { code: authorizationCode };
    if (codeVerifier) baseRequest.codeVerifier = codeVerifier;

    // 1) First try with redirect_uri (strict OAuth flow)
    if (redirectUri) {
      tokenRequests.push({ ...baseRequest, redirect_uri: redirectUri });
    }
    // 2) Fallback for installed-app flows where redirect_uri may be omitted
    tokenRequests.push({ ...baseRequest });

    let lastError: any;
    let tokens: any | undefined;
    for (const req of tokenRequests) {
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

