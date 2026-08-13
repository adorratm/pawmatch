import type { Metadata } from 'next';
import { Ubuntu } from 'next/font/google';
import { WebShell } from '@/components/WebShell';
import './globals.css';

const ubuntu = Ubuntu({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: 'PawMatch — Pati arkadaşını bul',
    template: '%s · PawMatch',
  },
  description:
    'Hayvan sahiplenmek veya oyun arkadaşı bulmak için PawMatch. Swipe et, eşleş, sohbet et.',
  keywords: ['pet', 'köpek', 'kedi', 'sahiplenme', 'eşleşme', 'PawMatch'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: site,
    siteName: 'PawMatch',
    title: 'PawMatch — Pati arkadaşını bul',
    description: 'Tüylü dostun için eşleşme. Sahiplen veya oyun arkadaşı bul.',
    images: [{ url: '/hero-dogs.jpg', width: 1200, height: 675, alt: 'PawMatch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PawMatch — Pati arkadaşını bul',
    description: 'Swipe et, eşleş, buluş.',
    images: ['/hero-dogs.jpg'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'PawMatch',
      url: site,
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PawMatch',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'iOS, Android',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={ubuntu.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <WebShell>{children}</WebShell>
      </body>
    </html>
  );
}
