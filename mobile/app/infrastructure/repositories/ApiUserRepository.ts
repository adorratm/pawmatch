import { IUserRepository, LoginDto, RegisterDto } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import api from '@/infrastructure/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ApiUserRepository implements IUserRepository {
  async getCurrentUser(): Promise<User | null> {
    const response = await api.get('/auth/me');
    return response.data ? User.fromJSON(response.data) : null;
  }

  async updateProfile(profile: any): Promise<User> {
    const response = await api.patch('/users/profile', profile);
    return User.fromJSON(response.data);
  }

  async login(credentials: LoginDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await api.post('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response.data;
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    return {
      user: User.fromJSON(user),
      accessToken,
      refreshToken
    };
  }

  async register(data: RegisterDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await api.post('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data;
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    return {
      user: User.fromJSON(user),
      accessToken,
      refreshToken
    };
  }
}

export const userRepository = new ApiUserRepository();
