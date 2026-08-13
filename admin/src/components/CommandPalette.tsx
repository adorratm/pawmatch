'use client';

import { FormEvent, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

type Hit = {
  type: string;
  id: number | string;
  title: string;
  snippet?: string;
  href: string;
};

const NAV: Hit[] = [
  { type: 'menü', id: 'dashboard', title: 'Dashboard', href: '/' },
  { type: 'menü', id: 'users', title: 'Kullanıcılar', href: '/users' },
  { type: 'menü', id: 'pets', title: 'Petler', href: '/pets' },
  { type: 'menü', id: 'matches', title: 'Eşleşmeler', href: '/matches' },
  { type: 'menü', id: 'support', title: 'Destek', href: '/support' },
  { type: 'menü', id: 'i18n', title: 'Çeviriler (i18n)', href: '/i18n' },
  { type: 'menü', id: 'ads', title: 'Reklamlar', href: '/ads' },
  { type: 'menü', id: 'plans', title: 'Paketler', href: '/plans' },
  { type: 'menü', id: 'settings', title: 'Ayarlar', href: '/settings' },
  { type: 'menü', id: 'vets', title: 'Veterinerler', href: '/veterinarians' },
  { type: 'menü', id: 'shelters', title: 'Barınaklar', href: '/shelters' },
  { type: 'menü', id: 'temps', title: 'Temperamentler', href: '/temperaments' },
  { type: 'menü', id: 'cms', title: 'Site sayfaları', href: '/cms' },
  { type: 'menü', id: 'broadcast', title: 'Bildirim', href: '/broadcast' },
  { type: 'menü', id: 'queues', title: 'Kuyruklar', href: '/queues' },
];

const TYPE_HREF: Record<string, (id: string | number) => string> = {
  user: (id) => `/users?id=${id}`,
  pet: (id) => `/pets?id=${id}`,
  match: (id) => `/matches?id=${id}`,
  ticket: (id) => `/support?id=${id}`,
  shelter: (id) => `/shelters?id=${id}`,
  veterinarian: (id) => `/veterinarians?id=${id}`,
  i18n: (id) => `/i18n?id=${id}`,
  cms: (id) => `/cms?id=${id}`,
  plan: (id) => `/plans?id=${id}`,
  setting: (id) => `/settings?id=${id}`,
  temperament: (id) => `/temperaments?id=${id}`,
  ad: (id) => `/ads?id=${id}`,
};

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const term = q.trim().toLocaleLowerCase('tr');
    const navHits = term
      ? NAV.filter((n) => n.title.toLocaleLowerCase('tr').includes(term) || n.href.includes(term))
      : NAV;
    if (!term) {
      setHits(navHits);
      return;
    }
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const { data } = await api.get('/admin/search', { params: { q } });
        const records: Hit[] = data.items ?? [];
        setHits([...navHits, ...records]);
      } catch {
        setHits(navHits);
      } finally {
        setBusy(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, open]);

  if (!open) return null;

  function go(hit: Hit) {
    const href = hit.href || TYPE_HREF[hit.type]?.(hit.id) || '/';
    const next = new URL(href, window.location.origin);
    router.push(href);
    if (next.pathname === pathname) {
      const id = Number(next.searchParams.get('id') || hit.id);
      if (id) window.dispatchEvent(new CustomEvent('pawmatch:deeplink', { detail: { id } }));
    }
    onClose();
    setQ('');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (hits[0]) go(hits[0]);
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-(--border) bg-(--surface-2) shadow-2xl"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit}>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Sayfa veya kayıt ara… (Ctrl K)"
            className="w-full border-b border-(--border) bg-transparent px-4 py-4 text-base outline-none"
          />
        </form>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {busy ? <p className="px-3 py-4 text-sm text-(--muted)">Aranıyor…</p> : null}
          {!busy && q && hits.length === 0 ? (
            <p className="px-3 py-4 text-sm text-(--muted)">Sonuç yok</p>
          ) : null}
          {hits.map((h) => (
            <button
              key={`${h.type}-${h.id}`}
              type="button"
              onClick={() => go(h)}
              className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition hover:bg-white/8"
            >
              <span className="text-xs tracking-widest text-(--brand-soft) uppercase">{h.type}</span>
              <span className="font-medium">{h.title}</span>
              {h.snippet ? <span className="text-xs text-(--muted)">{h.snippet}</span> : null}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
