'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/ConfirmProvider';
import { useToast } from '@/components/ToastProvider';
import { Button, EmptyState, PageHeader, StatCard, Table, Td, Th } from '@/components/ui';

type QueueInfo = {
  name: string;
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  paused?: boolean;
};

type JobRow = {
  id: string;
  name: string;
  failedReason?: string;
  timestamp?: number;
};

export default function QueuesPage() {
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [failed, setFailed] = useState<Record<string, JobRow[]>>({});
  const [error, setError] = useState('');
  const confirm = useConfirm();
  const toast = useToast();

  const load = useCallback(() => {
    api
      .get('/admin/queues')
      .then((r) => {
        setQueues(r.data.queues ?? []);
        setFailed(r.data.failed ?? {});
        setError('');
      })
      .catch((e) => setError(e?.response?.data?.message || 'Kuyruklar okunamadı (Redis?)'));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Kuyruklar"
        subtitle="BullMQ işleri — 5 sn’de bir yenilenir"
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={async () => {
                await api.post('/admin/search/reindex');
                toast('Reindex kuyruğa alındı / çalıştı');
              }}
            >
              Search reindex
            </Button>
            <Button variant="ghost" onClick={load}>
              Yenile
            </Button>
          </div>
        }
      />
      {error ? <p className="mb-4 text-sm text-(--danger)">{error}</p> : null}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {queues.map((q) => (
          <StatCard
            key={q.name}
            label={q.name}
            value={q.waiting + q.active}
            hint={`bekleyen ${q.waiting} · aktif ${q.active} · failed ${q.failed} · bitti ${q.completed}`}
          />
        ))}
      </div>
      {queues.map((q) => (
        <div key={q.name} className="mb-8">
          <div className="mb-3 flex gap-2">
            <Button
              variant="ghost"
              onClick={async () => {
                await api.post(`/admin/queues/${q.name}/retry`);
                toast('Failed işler yeniden kuyruğa alındı');
                load();
              }}
            >
              Failed retry
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                const ok = await confirm({
                  title: `${q.name} temizlensin mi?`,
                  description: 'Completed ve failed işler silinir.',
                  danger: true,
                  confirmLabel: 'Temizle',
                });
                if (!ok) return;
                await api.post(`/admin/queues/${q.name}/clean`);
                toast('Temizlendi');
                load();
              }}
            >
              Temizle
            </Button>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Job</Th>
                <Th>Hata</Th>
              </tr>
            </thead>
            <tbody>
              {(failed[q.name] ?? []).map((j) => (
                <tr key={j.id}>
                  <Td>
                    {j.name} #{j.id}
                  </Td>
                  <Td className="max-w-xl truncate text-(--muted)">{j.failedReason ?? '—'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {(failed[q.name] ?? []).length === 0 ? (
            <EmptyState text="Failed iş yok" />
          ) : null}
        </div>
      ))}
      {queues.length === 0 && !error ? <EmptyState text="Kuyruk yok" /> : null}
    </div>
  );
}
