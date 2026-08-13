'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { usePagedList } from '@/hooks/usePagedList';
import { useDeepLinkId } from '@/hooks/useDeepLinkId';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/DataTable';
import {
  Button,
  Drawer,
  Field,
  PageHeader,
  Select,
  Td,
  TextArea,
  Th,
  rowClass,
} from '@/components/ui';

type Ticket = {
  id: number;
  subject: string | null;
  message: string;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  user?: { email?: string; firstName?: string };
};

export default function SupportPage() {
  const [status, setStatus] = useState('');
  const list = usePagedList<Ticket>('/admin/support/tickets', {
    status: status || undefined,
  });
  const toast = useToast();
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ status: 'open', adminNote: '' });

  function openEdit(t: Ticket) {
    setEditing(t);
    setForm({ status: t.status, adminNote: t.adminNote ?? '' });
  }

  useDeepLinkId((id) => {
    const t = list.items.find((x) => x.id === id);
    if (t) openEdit(t);
    return !!t;
  }, String(list.items.length));

  async function save() {
    if (!editing) return;
    await api.patch(`/admin/support/tickets/${editing.id}`, form);
    toast('Ticket güncellendi');
    setEditing(null);
    list.load();
  }

  return (
    <div>
      <PageHeader title="Destek ticketları" subtitle="Kullanıcı talepleri" />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Konu, mesaj, e-posta…"
        page={list.page}
        pages={list.pages}
        total={list.total}
        limit={list.limit}
        onPage={list.setPage}
        onLimit={list.setLimit}
        loading={list.loading}
        toolbar={
          <Field label="Durum">
            <Select className="w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tümü</option>
              <option value="open">Açık</option>
              <option value="in_progress">İşlemde</option>
              <option value="closed">Kapalı</option>
            </Select>
          </Field>
        }
      >
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Kullanıcı</Th>
            <Th>Konu</Th>
            <Th>Mesaj</Th>
            <Th>Durum</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((t) => (
            <tr key={t.id} className={rowClass(list.focusId === t.id)}>
              <Td>{t.id}</Td>
              <Td>{t.user?.email ?? t.user?.firstName ?? '—'}</Td>
              <Td>{t.subject ?? '—'}</Td>
              <Td className="max-w-xs truncate">{t.message}</Td>
              <Td>{t.status}</Td>
              <Td>
                <Button variant="ghost" onClick={() => openEdit(t)}>
                  Düzenle
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      <Drawer
        open={!!editing}
        title={editing ? `Ticket #${editing.id}` : ''}
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <p className="text-sm text-(--muted) whitespace-pre-wrap">{editing.message}</p>
        ) : null}
        <Field label="Durum">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="open">Açık</option>
            <option value="in_progress">İşlemde</option>
            <option value="closed">Kapalı</option>
          </Select>
        </Field>
        <Field label="Yanıt notu" hint="İç not; kullanıcıya görünmez">
          <TextArea
            rows={4}
            value={form.adminNote}
            onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
            placeholder="Alınan aksiyon veya yanıt özeti"
          />
        </Field>
        <Button onClick={save}>Kaydet</Button>
      </Drawer>
    </div>
  );
}
