import { User } from '@/domain/entities/User';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface IUserRepository {
  getCurrentUser(): Promise<User | null>;
  updateProfile(profile: any): Promise<User>;
  login(credentials: LoginDto): Promise<{ user: User; accessToken: string; refreshToken: string }>;
  register(data: RegisterDto): Promise<{ user: User; accessToken: string; refreshToken: string }>;
}
