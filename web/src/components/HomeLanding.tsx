'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { WebConfig } from '@/lib/public-api';
import { WebBtn } from '@/components/WebBtn';

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.35 },
};

function Cover({
  src,
  alt,
  className,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src.startsWith('http')) {
    return (
      <img src={src} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className ?? ''}`} />
    );
  }
  return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={className} />;
}

const STEPS = [
  {
    n: '01',
    t: 'Petini ekle',
    d: 'Fotoğraf, ırk, yaş ve temperament seç. İlanını sahiplenme veya oyun arkadaşı olarak yayınla.',
  },
  {
    n: '02',
    t: 'Yakını keşfet',
    d: 'Konumuna göre kartları kaydır. Filtrele, süper beğen, geç — Tinder değil, pati eşleşmesi.',
  },
  {
    n: '03',
    t: 'Karşılıklı beğen',
    d: 'İki taraf da beğenince eşleşme oluşur. Sohbet açılır, buluşma planlanır.',
  },
  {
    n: '04',
    t: 'Güvenle buluş',
    d: 'Barınak onayları, veteriner randevusu ve uygulama içi destek yanındadır.',
  },
];

const FEATURES = [
  { t: 'Konuma göre keşif', d: 'Yarıçapını ayarla; parkta, mahallede veya şehirde pati ara.' },
  { t: 'Anlık sohbet', d: 'Eşleşince mesajlaş. Fotoğraf ve konum paylaşımı kontrollü.' },
  { t: 'Sahiplenme ilanları', d: 'Barınak ve bireysel sahiplendirme kartları aynı akışta.' },
  { t: 'Oyun arkadaşı', d: 'Enerjisi tutan köpekleri bul, yürüyüş veya park randevusu ayarla.' },
  { t: 'Veteriner ağı', d: 'Yakındaki klinikleri gör, randevu slotlarını incele.' },
  { t: 'Güvenlik katmanı', d: 'Raporla, engelle, onaylı barınak rozeti. Moderasyon panelden yönetilir.' },
];

const AUDIENCE = [
  { t: 'Pet sahipleri', d: 'Köpeğin için park arkadaşı, kedin için sakin bir yuva eşi.' },
  { t: 'Sahiplenmek isteyenler', d: 'Barınak ilanlarını kaydır, tanış, yuvalandır.' },
  { t: 'Barınaklar', d: 'İlanları yayınla, başvuruları sohbetle yönet, görünürlüğünü artır.' },
];

const FAQ = [
  {
    q: 'PawMatch ücretsiz mi?',
    a: 'Keşfet, eşleşme ve sohbet ücretsizdir. Pati Gold reklamları kaldırır, kimlerin beğendiğini gösterir ve haftalık süper beğeni verir.',
  },
  {
    q: 'Konumumu herkes görür mü?',
    a: 'Hayır. Keşif için yaklaşık konum kullanılır; tam adres paylaşılmaz. İstersen keşfi kapatabilirsin.',
  },
  {
    q: 'Barınak değilim, sahiplendirme yayınlar mıyım?',
    a: 'Bireysel ilan da açılır. Doğru bilgi ve aşı/kısırlaştırma notları güveni artırır.',
  },
  {
    q: 'Hangi şehirlerde var?',
    a: 'Uygulama Türkiye genelinde çalışır. Yoğunluk büyükşehirlerde daha yüksektir; her yeni profil ağı güçlendirir.',
  },
];

export function HomeLanding({ config }: { config: WebConfig }) {
  const heroSrc = config.heroImage || '/hero-dogs.jpg';
  return (
    <div>
      <section className="relative flex min-h-[88vh] flex-col overflow-hidden">
        <Cover src={heroSrc} alt="Birlikte koşan patiler" priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(26,16,12,0.92)_0%,rgba(26,16,12,0.58)_52%,rgba(106,63,42,0.42)_100%)]" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pb-20 pt-14 sm:px-6 md:px-12">
          <motion.p {...fade} className="text-xs tracking-[0.28em] text-[#a67c5d] uppercase">
            Pati eşleşmesi
          </motion.p>
          <motion.h1
            {...fade}
            className="mt-4 max-w-3xl text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-8xl"
          >
            {config.heroTitle}
          </motion.h1>
          <motion.p {...fade} className="mt-6 max-w-lg text-base text-white/80 sm:text-lg md:text-xl">
            {config.heroSubtitle}
          </motion.p>
          <div id="indir" className="mt-10 flex flex-wrap gap-3">
            <WebBtn href={config.appStoreUrl || '#'}>App Store</WebBtn>
            <WebBtn href={config.playStoreUrl || '#'} variant="ghost">
              Google Play
            </WebBtn>
          </div>
          <p className="mt-5 text-xs text-white/50">iOS ve Android · Ücretsiz hesap · Pati Gold isteğe bağlı</p>
        </div>
      </section>

      <section className="border-b border-white/10 px-4 py-10 sm:px-6 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
          {[
            { n: 'Swipe', l: 'Keşfet ve filtrele' },
            { n: 'Eşleş', l: 'Karşılıklı beğeni' },
            { n: 'Sohbet', l: 'Buluşmaya giden yol' },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 px-5 py-4">
              <div className="text-2xl font-bold">{s.n}</div>
              <div className="mt-1 text-sm text-[#b9a89a]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 md:px-12 md:py-24">
        <motion.div {...fade} className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold md:text-5xl">Nasıl çalışır?</h2>
          <p className="mt-4 max-w-2xl text-[#b9a89a]">
            Dört adımda pati arkadaşın veya yeni yuva. Kartları kaydırırsın; uygulama gerisini
            eşleşme ve sohbetle bağlar.
          </p>
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
                className="rounded-2xl border border-white/10 bg-white/4 p-6"
              >
                <div className="text-xs tracking-[0.2em] text-[#a67c5d]">{step.n}</div>
                <div className="mt-3 text-xl font-bold">{step.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-[#b9a89a]">{step.d}</p>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </section>

      <section className="border-t border-white/10 px-4 py-20 sm:px-6 md:px-12 md:py-24">
        <motion.div {...fade} className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold md:text-5xl">Uygulamada neler var?</h2>
          <p className="mt-4 max-w-2xl text-[#b9a89a]">
            Eşleşmenin ötesinde barınak, veteriner ve güvenlik. Hepsi aynı kahve-krem arayüzde.
          </p>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((item, i) => (
              <motion.li
                key={item.t}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="rounded-2xl border border-white/10 px-5 py-6"
              >
                <div className="text-lg font-bold">{item.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-[#b9a89a]">{item.d}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </section>

      <section className="px-4 py-20 sm:px-6 md:px-12">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <motion.div {...fade} className="relative min-h-72 overflow-hidden rounded-3xl">
            <Cover src={heroSrc} alt="Pati dostları" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-[#1a100c]/35" />
          </motion.div>
          <motion.div {...fade}>
            <h2 className="text-3xl font-bold md:text-4xl">Kimler için?</h2>
            <ul className="mt-8 space-y-5">
              {AUDIENCE.map((a) => (
                <li key={a.t} className="border-b border-white/10 pb-5 last:border-0">
                  <div className="font-bold">{a.t}</div>
                  <p className="mt-1 text-sm text-[#b9a89a]">{a.d}</p>
                </li>
              ))}
            </ul>
            <Link
              href="/hakkimizda"
              className="mt-6 inline-block text-sm text-[#a67c5d] underline-offset-4 hover:text-[#f7f3f0] hover:underline"
            >
              Hikâyemizi oku →
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#6a3f2a] px-4 py-20 sm:px-6 md:px-12 md:py-24">
        <motion.div {...fade} className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.22em] text-white/55 uppercase">Abonelik</p>
          <h2 className="mt-3 text-3xl font-bold md:text-5xl">Pati Gold</h2>
          <p className="mt-4 max-w-xl text-white/80">
            Reklamsız keşif, seni beğenenleri görme ve her hafta süper beğeni. Ücretsiz plan
            her zaman durur; Gold tempo isterenler içindir.
          </p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {['Reklamsız deneyim', 'Kimler beğendi', 'Haftalık süper beğeni'].map((x) => (
              <li key={x} className="rounded-xl border border-white/15 bg-black/10 px-4 py-4 text-sm">
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <WebBtn href="#indir">Uygulamada keşfet</WebBtn>
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-20 sm:px-6 md:px-12 md:py-24">
        <motion.div {...fade} className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold md:text-5xl">Sık sorulanlar</h2>
          <dl className="mt-10 grid gap-6 md:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 p-6">
                <dt className="font-bold">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[#b9a89a]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </section>

      <section className="border-t border-white/10 px-4 py-16 sm:px-6 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Patin için kaydırmaya hazır mısın?</h2>
            <p className="mt-2 text-sm text-[#b9a89a]">Ücretsiz hesap. Mağazadan indir, profilini aç.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <WebBtn href={config.appStoreUrl || '#indir'}>App Store</WebBtn>
            <WebBtn href={config.playStoreUrl || '#indir'} variant="ghost">
              Google Play
            </WebBtn>
          </div>
        </div>
      </section>
    </div>
  );
}
