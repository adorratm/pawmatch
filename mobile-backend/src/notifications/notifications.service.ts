import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
import { PushNotificationService } from './push-notification.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async create(createNotificationDto: {
    userId: number;
    type: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }) {
    const notification = this.entityManager.create(Notification, createNotificationDto);
    const saved = await this.entityManager.save(notification);

    await this.pushNotificationService.sendExpoToUser(
      createNotificationDto.userId,
      {
        title: createNotificationDto.title,
        body: createNotificationDto.body,
        data: {
          ...(createNotificationDto.data ?? {}),
          notificationId: saved.id,
          type: createNotificationDto.type,
        },
      },
      { notificationType: createNotificationDto.type },
    );

    return saved;
  }

  async getUserNotifications(userId: number) {
    return this.entityManager.find(Notification, {
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(notificationId: number, userId: number) {
    await this.entityManager.update(
      Notification,
      { id: notificationId, userId },
      { isRead: true },
    );
    return { success: true };
  }
}
