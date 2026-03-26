import io, { Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/presentation/styles/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChatStore } from '@/application/stores/chatStore';

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return;

    if (this.socket?.connected) {
      return; // Already connected
    }

    this.socket = io(SOCKET_URL + '/chat', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('message:new', (message: any) => {
      useChatStore.getState().addMessage(message.conversationId, message);
    });

    this.socket.on('match:new', (data: any) => {
      // Handle new match notification
      console.log('New match:', data);
    });

    this.socket.on('typing:start', (data: any) => {
      // Handle typing indicator
      console.log('User typing:', data);
    });

    this.socket.on('typing:stop', (data: any) => {
      // Handle typing stop
      console.log('User stopped typing:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('conversation:join', { conversationId });
    }
  }

  leaveConversation(conversationId: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('conversation:leave', { conversationId });
    }
  }

  sendMessage(conversationId: number, content: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message:send', { conversationId, content });
    }
  }

  startTyping(conversationId: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing:start', { conversationId });
    }
  }

  stopTyping(conversationId: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing:stop', { conversationId });
    }
  }
}

export const socketService = new SocketService();


