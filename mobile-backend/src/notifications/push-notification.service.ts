import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import axios from 'axios';
import { User } from '../database/entities/user.entity';
import { UserPushToken } from '../database/entities/user-push-token.entity';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private readonly entityManager: EntityManager) {}

  async registerToken(userId: number, token: string, platform: string): Promise<void> {
    const existingByToken = await this.entityManager.findOne(UserPushToken, {
      where: { token },
    });
    if (existingByToken && existingByToken.userId !== userId) {
      await this.entityManager.remove(existingByToken);
    }
    const mine = await this.entityManager.findOne(UserPushToken, {
      where: { userId, token },
    });
    if (mine) {
      mine.platform = platform;
      await this.entityManager.save(mine);
      return;
    }
    await this.entityManager.save(
      this.entityManager.create(UserPushToken, { userId, token, platform }),
    );
  }

  async removeToken(userId: number, token: string): Promise<void> {
    await this.entityManager.delete(UserPushToken, { userId, token });
  }

  async removeAllTokensForUser(userId: number): Promise<void> {
    await this.entityManager.delete(UserPushToken, { userId });
  }

  private async userAllowsPush(userId: number): Promise<boolean> {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: ['profile'],
    });
    const prefs = user?.profile?.preferences as Record<string, unknown> | undefined;
    const notifications = prefs?.notifications as Record<string, unknown> | undefined;
    const channels = notifications?.channels as Record<string, unknown> | undefined;
    if (channels && typeof channels.push === 'boolean') {
      return channels.push;
    }
    return true;
  }

  /** Mobil `NotificationPreferencesScreen1` ile uyumlu tür tercihleri */
  private async userAllowsNotificationType(userId: number, type: string): Promise<boolean> {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: ['profile'],
    });
    const types = (user?.profile?.preferences as Record<string, unknown> | undefined)?.notifications as
      | { types?: Record<string, boolean> }
      | undefined;
    const t = types?.types;
    if (!t || typeof t !== 'object') {
      if (type === 'like') return false;
      return true;
    }
    if (type === 'like') return t.likes === true;
    if (type === 'match') return t.newMatches !== false;
    if (type === 'message') return t.messages !== false;
    if (type === 'appointment') return t.appointments !== false;
    return true;
  }

  /**
   * Kayıtlı Expo push tokenlarına bildirim gönderir (Expo Push API).
   * @see https://docs.expo.dev/push-notifications/sending-notifications/
   */
  async sendExpoToUser(
    userId: number,
    payload: { title: string; body: string; data?: Record<string, unknown> },
    opts?: { notificationType?: string },
  ): Promise<void> {
    const allowed = await this.userAllowsPush(userId);
    if (!allowed) {
      return;
    }
    const nType = opts?.notificationType ?? 'generic';
    if (!(await this.userAllowsNotificationType(userId, nType))) {
      return;
    }
    const rows = await this.entityManager.find(UserPushToken, { where: { userId } });
    if (!rows.length) {
      return;
    }

    const messages = rows.map((row) => ({
      to: row.token,
      sound: 'default' as const,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    }));

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    };
    const accessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const res = await axios.post(EXPO_PUSH_URL, messages, { headers, timeout: 15000 });
      const errors = (res.data as { errors?: unknown })?.errors;
      if (errors) {
        this.logger.warn(`Expo push response errors: ${JSON.stringify(errors)}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Expo push send failed: ${msg}`);
    }
  }
}
