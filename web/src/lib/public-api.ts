const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export type WebConfig = {
  heroTitle: string;
  heroSubtitle: string;
  appStoreUrl: string;
  playStoreUrl: string;
  heroImage?: string;
};

export type CmsPageSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  seoDescription: string | null;
  sortOrder: number;
  updatedAt: string;
};

export type CmsPage = CmsPageSummary & {
  body: string;
  isPublished: boolean;
};

const fallbackConfig: WebConfig = {
  heroTitle: 'PawMatch',
  heroSubtitle: 'Tüylü dostun için eşleşme. Sahiplen veya oyun arkadaşı bul — swipe ile.',
  appStoreUrl: '#',
  playStoreUrl: '#',
  heroImage: '',
};

export async function getWebConfig(): Promise<WebConfig> {
  try {
    const res = await fetch(`${API}/web/config`, { next: { revalidate: 60 } });
    if (!res.ok) return fallbackConfig;
    return { ...fallbackConfig, ...(await res.json()) };
  } catch {
    return fallbackConfig;
  }
}

export async function getPublishedPages(): Promise<CmsPageSummary[]> {
  try {
    const res = await fetch(`${API}/pages`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getPublishedPage(slug: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(`${API}/pages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
