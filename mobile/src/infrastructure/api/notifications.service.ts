import api from '@/infrastructure/api/api';

export type AppNotification = {
  id: number;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
};

export const notificationsService = {
  async list(): Promise<{ items: AppNotification[]; unreadCount: number }> {
    const response = await api.get('/notifications');
    const data = response.data;
    if (Array.isArray(data)) {
      return {
        items: data,
        unreadCount: data.filter((n: AppNotification) => !n.isRead).length,
      };
    }
    return {
      items: data.items ?? [],
      unreadCount: data.unreadCount ?? 0,
    };
  },

  async unreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data?.unreadCount ?? 0;
  },

  async markAsRead(id: number) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  async deleteOne(id: number) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  async deleteAll() {
    const response = await api.delete('/notifications');
    return response.data;
  },
};
