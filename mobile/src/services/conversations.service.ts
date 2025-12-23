import api from './api';

export const conversationsService = {
  async getConversations() {
    const response = await api.get('/conversations');
    return response.data;
  },

  async getConversation(id: number) {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  async sendMessage(conversationId: number, content: string) {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data;
  },

  async markAsRead(conversationId: number) {
    const response = await api.put(`/conversations/${conversationId}/read`);
    return response.data;
  },
};


