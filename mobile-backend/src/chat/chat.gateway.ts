import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConversationsService } from '../conversations/conversations.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private conversationsService: ConversationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const userId = payload.sub;
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      console.log(`User ${userId} connected`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Verify user has access to conversation
      await this.conversationsService.getConversation(data.conversationId, userId);
      
      // Join conversation room
      client.join(`conversation:${data.conversationId}`);
      
      return { success: true, conversationId: data.conversationId };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @MessageBody() data: { conversationId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.conversationsService.sendMessage(
        data.conversationId,
        userId,
        { content: data.content },
      );

      // Get conversation to find other user
      const conversation = await this.conversationsService.getConversation(
        data.conversationId,
        userId,
      );

      // Emit to conversation room (both users)
      this.server.to(`conversation:${data.conversationId}`).emit('message:new', {
        ...message,
        conversationId: data.conversationId,
      });

      return message;
    } catch (error: any) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;
    
    client.to(`conversation:${data.conversationId}`).emit('typing:start', {
      conversationId: data.conversationId,
      userId,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;
    
    client.to(`conversation:${data.conversationId}`).emit('typing:stop', {
      conversationId: data.conversationId,
      userId,
    });
  }
}


