import api from '@/infrastructure/api/api';

export type SubscriptionPlanDto = {
  id: number;
  tier: string;
  name: string;
  description: string | null;
  productId: string | null;
  priceLabel: string | null;
  features: string[] | null;
  superlikesWeeklyLimit: number;
  removesAds: boolean;
};

export const plansService = {
  async listActive(): Promise<SubscriptionPlanDto[]> {
    try {
      const { data } = await api.get<SubscriptionPlanDto[]>('/plans');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
