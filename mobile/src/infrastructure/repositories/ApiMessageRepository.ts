import { IMessageRepository } from '@/domain/repositories/IMessageRepository';
import { Message } from '@/domain/entities/Message';
import api from '@/infrastructure/api/api';

export class ApiMessageRepository implements IMessageRepository {
  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await api.get(`/conversations/${conversationId}`);
    const raw = response.data?.messages ?? [];
    return raw.map((json: any) =>
      Message.fromJSON({ ...json, conversationId }),
    );
  }

  async sendMessage(conversationId: number, content: string): Promise<Message> {
    const response = await api.post(`/conversations/${conversationId}/messages`, { content });
    return Message.fromJSON(response.data);
  }

  async markAsRead(conversationId: number): Promise<void> {
    await api.put(`/conversations/${conversationId}/read`);
  }
}

export const messageRepository = new ApiMessageRepository();
