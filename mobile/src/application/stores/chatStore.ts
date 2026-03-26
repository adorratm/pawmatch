import { create } from 'zustand';
import { Message } from '@/domain/entities/Message';
import { Match } from '@/domain/entities/Match';
import { matchRepository } from '@/infrastructure/repositories/ApiMatchRepository';
import { messageRepository } from '@/infrastructure/repositories/ApiMessageRepository';

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
  matches: Match[];
  messages: Record<number, Message[]>;
  loading: boolean;
  loadMatches: () => Promise<void>;
  loadMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  addMessage: (conversationId: number, message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  matches: [],
  messages: {},
  loading: false,

  loadMatches: async () => {
    set({ loading: true });
    try {
      const matches = await matchRepository.getMatches();
      set({ matches, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  loadMessages: async (conversationId: number) => {
    try {
      const messages = await messageRepository.getMessages(conversationId);
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages,
        },
      }));
    } catch (error) {
      throw error;
    }
  },

  sendMessage: async (conversationId: number, content: string) => {
    try {
      const message = await messageRepository.sendMessage(conversationId, content);
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
