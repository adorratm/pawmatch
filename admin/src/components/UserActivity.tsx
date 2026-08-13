'use client';

import { useMemo, useState } from 'react';

export type UserActivityPayload = {
  summary: {
    likesSent: number;
    superLikesSent: number;
    likesReceived: number;
    passes: number;
    matches: number;
    matchesClosed: number;
    messages: number;
    favorites: number;
    pets: number;
    tickets: number;
    appointments: number;
    gold: boolean;
    subscriptionTier: string;
    subscriptionUntil: string | null;
    location: {
      city?: string | null;
      district?: string | null;
      latitude: number;
      longitude: number;
    } | null;
    createdAt: string;
    lastSeenHint: string;
  };
  events: { id: string; type: string; at: string; title: string; detail?: string }[];
};

const FILTERS: { id: string; label: string; types: string[] | null }[] = [
  { id: 'all', label: 'Tümü', types: null },
  { id: 'discover', label: 'Keşif', types: ['like', 'superlike', 'dislike', 'like_received', 'like_accepted', 'match', 'unmatch', 'favorite'] },
  { id: 'chat', label: 'Sohbet', types: ['message', 'match', 'unmatch'] },
  { id: 'pets', label: 'Pet', types: ['pet'] },
  { id: 'support', label: 'Destek', types: ['ticket', 'appointment', 'clinic_review'] },
  { id: 'account', label: 'Hesap', types: ['signup', 'location', 'oauth', 'subscription', 'rating', 'rating_received'] },
];

const TYPE_DOT: Record<string, string> = {
  like: 'bg-emerald-400',
  superlike: 'bg-amber-300',
  like_received: 'bg-emerald-600',
  like_accepted: 'bg-teal-400',
  dislike: 'bg-white/35',
  match: 'bg-pink-400',
  unmatch: 'bg-rose-500',
  message: 'bg-sky-400',
  favorite: 'bg-yellow-500',
  pet: 'bg-[#a67c5d]',
  ticket: 'bg-orange-400',
  appointment: 'bg-violet-400',
  location: 'bg-cyan-500',
  rating: 'bg-lime-400',
  rating_received: 'bg-lime-600',
  clinic_review: 'bg-indigo-400',
  oauth: 'bg-blue-500',
  subscription: 'bg-[#c4a484]',
  signup: 'bg-(--brand-soft)',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('tr-TR');
}

export function UserActivity({ data, loading }: { data: UserActivityPayload | null; loading: boolean }) {
  const [filter, setFilter] = useState('all');
  const events = useMemo(() => {
    if (!data) return [];
    const f = FILTERS.find((x) => x.id === filter);
    if (!f?.types) return data.events;
    return data.events.filter((e) => f.types!.includes(e.type));
  }, [data, filter]);

  if (loading) return <p className="text-sm text-(--muted)">İşlemler yükleniyor…</p>;
  if (!data) return <p className="text-sm text-(--muted)">Aktivite alınamadı.</p>;

  const s = data.summary;
  const loc = s.location
    ? [s.location.district, s.location.city].filter(Boolean).join(', ')
    : '—';

  const stats = [
    ['Beğeni', s.likesSent],
    ['Süper', s.superLikesSent],
    ['Gelen beğeni', s.likesReceived],
    ['Pass', s.passes],
    ['Eşleşme', s.matches],
    ['Mesaj', s.messages],
    ['Favori', s.favorites],
    ['Pet', s.pets],
    ['Ticket', s.tickets],
    ['Randevu', s.appointments],
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-xl border border-(--border) bg-white/3 px-3 py-2">
            <div className="text-[10px] tracking-widest text-(--muted) uppercase">{label}</div>
            <div className="mt-1 text-lg font-bold">{n}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1 text-xs text-(--muted)">
        <p>
          Abonelik: <span className="text-(--ink)">{s.gold ? 'Pati Gold' : s.subscriptionTier}</span>
          {s.subscriptionUntil ? ` · bitiş ${fmt(s.subscriptionUntil)}` : ''}
        </p>
        <p>
          Konum: <span className="text-(--ink)">{loc}</span>
        </p>
        <p>
          Kayıt: {fmt(s.createdAt)} · son işlem: {fmt(s.lastSeenHint)}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              filter === f.id
                ? 'bg-(--brand) text-[#f7f3f0]'
                : 'border border-(--border) text-(--muted) hover:text-(--ink)'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ol className="space-y-3 border-l border-(--border) pl-4">
        {events.length === 0 ? (
          <li className="text-sm text-(--muted)">Bu filtrede kayıt yok.</li>
        ) : (
          events.map((e) => (
            <li key={e.id} className="relative">
              <span
                className={`absolute -left-5.25 top-1.5 h-2.5 w-2.5 rounded-full ${TYPE_DOT[e.type] || 'bg-(--muted)'}`}
              />
              <div className="text-sm font-medium">{e.title}</div>
              {e.detail ? <div className="text-xs text-(--muted)">{e.detail}</div> : null}
              <div className="mt-0.5 text-[11px] text-(--muted)">{fmt(e.at)}</div>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
