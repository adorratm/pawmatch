'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { usePagedList } from '@/hooks/usePagedList';
import { useDeepLinkId } from '@/hooks/useDeepLinkId';
import { useConfirm } from '@/components/ConfirmProvider';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/DataTable';
import { Button, Drawer, Field, Input, PageHeader, Td, Th, rowClass } from '@/components/ui';

type Temp = { id: number; name: string };

export default function TemperamentsPage() {
  const list = usePagedList<Temp>('/admin/temperaments');
  const confirm = useConfirm();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: 0, name: '' });

  function openEdit(t?: Temp) {
    setForm(t ? { id: t.id, name: t.name } : { id: 0, name: '' });
    setOpen(true);
  }

  useDeepLinkId((id) => {
    const t = list.items.find((x) => x.id === id);
    if (t) openEdit(t);
    return !!t;
  }, String(list.items.length));

  async function save() {
    if (form.id) {
      await api.patch(`/admin/temperaments/${form.id}`, { name: form.name });
    } else {
      await api.post('/admin/temperaments', { name: form.name });
    }
    toast('Kaydedildi');
    setOpen(false);
    list.load();
  }

  return (
    <div>
      <PageHeader
        title="Temperamentler"
        actions={<Button onClick={() => openEdit()}>Yeni temperament</Button>}
      />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Temperament adı…"
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
            <Th>Ad</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((t) => (
            <tr key={t.id} className={rowClass(list.focusId === t.id)}>
              <Td>{t.id}</Td>
              <Td>{t.name}</Td>
              <Td className="space-x-2 whitespace-nowrap">
                <Button variant="ghost" onClick={() => openEdit(t)}>
                  Düzenle
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Temperament silinsin mi?',
                      danger: true,
                      confirmLabel: 'Sil',
                    });
                    if (!ok) return;
                    await api.delete(`/admin/temperaments/${t.id}`);
                    toast('Silindi');
                    list.load();
                  }}
                >
                  Sil
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      <Drawer
        open={open}
        title={form.id ? 'Temperamenti düzenle' : 'Yeni temperament'}
        onClose={() => setOpen(false)}
      >
        <Field label="Ad">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Oyuncu"
          />
        </Field>
        <Button onClick={save}>Kaydet</Button>
      </Drawer>
    </div>
  );
}
