import api from '@/infrastructure/api/api';

export const supportService = {
  async createTicket(message: string, subject?: string) {
    const { data } = await api.post('/support/tickets', { message, subject });
    return data;
  },
};
