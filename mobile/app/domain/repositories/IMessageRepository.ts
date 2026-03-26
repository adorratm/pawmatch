import { Message } from '@/domain/entities/Message';

export interface IMessageRepository {
  getMessages(conversationId: number): Promise<Message[]>;
  sendMessage(conversationId: number, content: string): Promise<Message>;
  markAsRead(conversationId: number): Promise<void>;
}
