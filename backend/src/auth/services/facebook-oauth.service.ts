import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FacebookOAuthService {
  constructor(private readonly configService: ConfigService) {}

  async getProfile(accessToken: string) {
    const facebookAppId = this.configService.get('FACEBOOK_APP_ID');
    if (!facebookAppId || facebookAppId === 'your_facebook_app_id_here') {
      throw new UnauthorizedException('Facebook OAuth not configured');
    }

    // Verify token and get user info
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
    );

    const { id, name, email } = response.data;
    if (!email) {
      throw new UnauthorizedException('Email not provided by Facebook');
    }

    const nameParts = String(name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      providerId: String(id),
      email,
      firstName,
      lastName,
      picture: null,
    };
  }
}

