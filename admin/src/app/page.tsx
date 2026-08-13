'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader, StatCard } from '@/components/ui';

type Stats = {
  users: number;
  pets: number;
  activeMatches: number;
  openTickets: number;
  estimatedGoldSubscribers: number;
};

type System = {
  cpu: { cores: number; load: number[] };
  memory: { totalMb: number; freeMb: number; usedPercent: number; rssMb: number };
  disk: { totalGb: number; freeGb: number; usedPercent: number } | null;
  queues?: { name: string; waiting: number; active: number; failed: number }[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [system, setSystem] = useState<System | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((r) => setStats(r.data))
      .catch((e) => setError(e?.response?.data?.message || 'Yüklenemedi'));
    api
      .get('/admin/system')
      .then((r) => setSystem(r.data))
      .catch(() => setSystem(null));
  }, []);

  const tiles = stats
    ? [
        { label: 'Kullanıcılar', value: stats.users },
        { label: 'Petler', value: stats.pets },
        { label: 'Aktif eşleşme', value: stats.activeMatches },
        { label: 'Açık destek', value: stats.openTickets },
        { label: 'Gold (tahmini)', value: stats.estimatedGoldSubscribers },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="PawMatch genel bakış ve sunucu sağlığı" />
      {error ? <p className="text-(--danger)">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => (
          <StatCard key={t.label} label={t.label} value={t.value} />
        ))}
      </div>
      {system ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="CPU"
            value={`${system.cpu.cores} çekirdek`}
            hint={system.cpu.load?.length ? `load ${system.cpu.load.map((n) => n.toFixed(2)).join(' / ')}` : undefined}
          />
          <StatCard
            label="RAM"
            value={`${system.memory.usedPercent}%`}
            hint={`${system.memory.freeMb} MB boş / ${system.memory.totalMb} MB · RSS ${system.memory.rssMb} MB`}
          />
          <StatCard
            label="Disk"
            value={system.disk ? `${system.disk.usedPercent}%` : '—'}
            hint={
              system.disk
                ? `${system.disk.freeGb} GB boş / ${system.disk.totalGb} GB`
                : 'Okunamadı'
            }
          />
          <StatCard
            label="Kuyruklar"
            value={
              system.queues
                ? system.queues.reduce((a, q) => a + q.waiting + q.active, 0)
                : '—'
            }
            hint={
              system.queues?.length
                ? system.queues.map((q) => `${q.name}: ${q.waiting} bekliyor`).join(' · ')
                : 'Redis kapalı'
            }
          />
        </div>
      ) : null}
    </div>
  );
}
