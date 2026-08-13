import type { MetadataRoute } from 'next';
import { getPublishedPages } from '@/lib/public-api';

const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getPublishedPages();
  return [
    { url: site, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...pages.map((p) => ({
      url: `${site}/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
