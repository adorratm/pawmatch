import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OAuthGoogleDto } from './dto/oauth-google.dto';
import { OAuthFacebookDto } from './dto/oauth-facebook.dto';
import { OAuthAppleDto } from './dto/oauth-apple.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('oauth/google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() oauthDto: OAuthGoogleDto) {
    return this.authService.googleLogin(oauthDto);
  }

  @Post('oauth/facebook')
  @HttpCode(HttpStatus.OK)
  async facebookLogin(@Body() oauthDto: OAuthFacebookDto) {
    return this.authService.facebookLogin(oauthDto);
  }

  @Post('oauth/apple')
  @HttpCode(HttpStatus.OK)
  async appleLogin(@Body() oauthDto: OAuthAppleDto) {
    return this.authService.appleLogin(oauthDto);
  }
}


