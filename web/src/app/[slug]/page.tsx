import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CmsBody } from '@/components/CmsBody';
import { getPublishedPage, getPublishedPages } from '@/lib/public-api';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await getPublishedPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return { title: 'Sayfa bulunamadı' };
  return {
    title: page.title,
    description: page.seoDescription || page.excerpt || undefined,
  };
}

export default async function CmsSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  return (
    <article>
      <div className="border-b border-white/10 bg-[#241610]">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:px-12 md:py-20">
          <p className="text-xs tracking-[0.2em] text-[#a67c5d] uppercase">PawMatch</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl md:text-5xl">{page.title}</h1>
          {page.excerpt ? (
            <p className="mt-4 max-w-2xl text-base text-[#b9a89a] sm:text-lg">{page.excerpt}</p>
          ) : null}
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:px-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="max-w-3xl">
            <CmsBody body={page.body} />
            {slug === 'iletisim' ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 p-5">
                  <div className="text-xs tracking-widest text-[#a67c5d] uppercase">E-posta</div>
                  <a href="mailto:hello@pawmatch.com.tr" className="mt-2 block font-medium text-[#f7f3f0] hover:underline">
                    hello@pawmatch.com.tr
                  </a>
                </div>
                <div className="rounded-2xl border border-white/10 p-5">
                  <div className="text-xs tracking-widest text-[#a67c5d] uppercase">Adres</div>
                  <p className="mt-2 text-white/80">Levent, Beşiktaş / İstanbul</p>
                </div>
              </div>
            ) : null}
          </div>
          <aside className="h-fit rounded-2xl border border-white/10 p-5 text-sm text-[#b9a89a]">
            <div className="font-medium text-[#f7f3f0]">Diğer sayfalar</div>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/hakkimizda" className="hover:text-[#f7f3f0]">
                Hakkımızda
              </Link>
              <Link href="/iletisim" className="hover:text-[#f7f3f0]">
                İletişim
              </Link>
              <Link href="/gizlilik" className="hover:text-[#f7f3f0]">
                Gizlilik
              </Link>
              <Link href="/kullanim-kosullari" className="hover:text-[#f7f3f0]">
                Kullanım koşulları
              </Link>
              <Link href="/kvkk" className="hover:text-[#f7f3f0]">
                KVKK
              </Link>
            </nav>
          </aside>
        </div>
      </div>
    </article>
  );
}
