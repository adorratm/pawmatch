import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    const items = await this.entityManager.find(Notification, {
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    const unreadCount = await this.entityManager.count(Notification, {
      where: { userId, isRead: false },
    });
    return { items, unreadCount };
  }

  async getUnreadCount(userId: number) {
    const unreadCount = await this.entityManager.count(Notification, {
      where: { userId, isRead: false },
    });
    return { unreadCount };
  }

  async markAsRead(notificationId: number, userId: number) {
    const n = await this.entityManager.findOne(Notification, {
      where: { id: notificationId },
    });
    if (!n) throw new NotFoundException('Bildirim bulunamadı');
    if (n.userId !== userId) throw new ForbiddenException();
    n.isRead = true;
    await this.entityManager.save(n);
    return { success: true };
  }

  async markAllAsRead(userId: number) {
    await this.entityManager.update(
      Notification,
      { userId, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }

  async deleteNotification(notificationId: number, userId: number) {
    const n = await this.entityManager.findOne(Notification, {
      where: { id: notificationId },
    });
    if (!n) throw new NotFoundException('Bildirim bulunamadı');
    if (n.userId !== userId) throw new ForbiddenException();
    await this.entityManager.remove(n);
    return { success: true };
  }

  async deleteAll(userId: number) {
    await this.entityManager.delete(Notification, { userId });
    return { success: true };
  }
}
