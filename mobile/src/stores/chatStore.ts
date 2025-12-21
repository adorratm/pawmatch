import { create } from 'zustand';
import { conversationsService } from '../services/conversations.service';

interface Message {
  id: number;
  content: string;
  senderId: number;
  sentAt: string;
  isRead: boolean;
}

interface Conversation {
  id: number;
  pet: {
    id: number;
    name: string;
    photos?: any[];
  };
  lastMessage?: {
    content: string;
    sentAt: string;
  };
  unreadCount: number;
}

interface ChatState {
  conversations: Conversation[];
  messages: Record<number, Message[]>;
  loading: boolean;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  addMessage: (conversationId: number, message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  loading: false,

  loadConversations: async () => {
    set({ loading: true });
    try {
      const data = await conversationsService.getConversations();
      set({ conversations: data.conversations || [], loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  loadMessages: async (conversationId: number) => {
    try {
      const data = await conversationsService.getConversation(conversationId);
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: data.messages || [],
        },
      }));
    } catch (error) {
      throw error;
    }
  },

  sendMessage: async (conversationId: number, content: string) => {
    try {
      const message = await conversationsService.sendMessage(conversationId, content);
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [...(state.messages[conversationId] || []), message],
        },
      }));
    } catch (error) {
      throw error;
    }
  },

  addMessage: (conversationId: number, message: Message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    }));
  },
}));

