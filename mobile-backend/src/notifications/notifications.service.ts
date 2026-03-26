import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly entityManager: EntityManager,
  ) {}

  async create(createNotificationDto: {
    userId: number;
    type: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }) {
    const notification = this.entityManager.create(Notification, createNotificationDto);
    return this.entityManager.save(notification);
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


