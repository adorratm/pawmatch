import api from '@/infrastructure/api/api';

export type AdCreative = {
  id: number;
  title: string;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  imageUrl: string | null;
  placement?: { key: string };
};

export const adsService = {
  async getActive(placement?: string): Promise<AdCreative[]> {
    try {
      const { data } = await api.get<AdCreative[]>('/ads/active', {
        params: placement ? { placement } : undefined,
      });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
