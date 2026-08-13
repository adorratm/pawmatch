'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { usePagedList } from '@/hooks/usePagedList';
import { useDeepLinkId } from '@/hooks/useDeepLinkId';
import { useConfirm } from '@/components/ConfirmProvider';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/DataTable';
import { Button, Drawer, PageHeader, Td, Th, rowClass } from '@/components/ui';

type Match = {
  id: number;
  isActive: boolean;
  matchedAt: string;
  pet1?: { name?: string } | null;
  pet2?: { name?: string };
};

export default function MatchesPage() {
  const list = usePagedList<Match>('/admin/matches');
  const confirm = useConfirm();
  const toast = useToast();
  const [selected, setSelected] = useState<Match | null>(null);

  useDeepLinkId((id) => {
    const m = list.items.find((x) => x.id === id);
    if (m) setSelected(m);
    return !!m;
  }, String(list.items.length));

  return (
    <div>
      <PageHeader title="Eşleşmeler" subtitle="Karşılıklı beğeniler" />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Pet adı…"
        page={list.page}
        pages={list.pages}
        total={list.total}
        limit={list.limit}
        onPage={list.setPage}
        onLimit={list.setLimit}
        loading={list.loading}
      >
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Pet 1</Th>
            <Th>Pet 2</Th>
            <Th>Tarih</Th>
            <Th>Durum</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((m) => (
            <tr key={m.id} className={rowClass(list.focusId === m.id)}>
              <Td>{m.id}</Td>
              <Td>{m.pet1?.name ?? '—'}</Td>
              <Td>{m.pet2?.name ?? '—'}</Td>
              <Td>{new Date(m.matchedAt).toLocaleString('tr-TR')}</Td>
              <Td>{m.isActive ? 'Aktif' : 'Kapalı'}</Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => setSelected(m)}>
                    Detay
                  </Button>
                  {m.isActive ? (
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'Eşleşme kapatılsın mı?',
                          description: 'Eşleşme kapatıldıktan sonra sohbet aktif kalmayabilir.',
                          danger: true,
                          confirmLabel: 'Eşleşmeyi kapat',
                        });
                        if (!ok) return;
                        await api.post(`/admin/matches/${m.id}/unmatch`);
                        toast('Eşleşme kapatıldı');
                        list.load();
                      }}
                    >
                      Eşleşmeyi kapat
                    </Button>
                  ) : null}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      <Drawer
        open={!!selected}
        title={selected ? `Eşleşme #${selected.id}` : ''}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <>
            <p>
              {selected.pet1?.name ?? '—'} × {selected.pet2?.name ?? '—'}
            </p>
            <p className="text-sm text-(--muted)">
              {new Date(selected.matchedAt).toLocaleString('tr-TR')} ·{' '}
              {selected.isActive ? 'Aktif' : 'Kapalı'}
            </p>
          </>
        ) : null}
      </Drawer>
    </div>
  );
}
