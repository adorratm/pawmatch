'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { usePagedList } from '@/hooks/usePagedList';
import { useDeepLinkId } from '@/hooks/useDeepLinkId';
import { useConfirm } from '@/components/ConfirmProvider';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/DataTable';
import { Button, Drawer, Field, Input, PageHeader, Td, TextArea, Th, rowClass } from '@/components/ui';
import { ImageDropzone } from '@/components/ImageDropzone';

type Setting = { id: number; key: string; value: string; description: string | null };

const emptyForm = { key: '', value: '', description: '' };

export default function SettingsPage() {
  const list = usePagedList<Setting>('/admin/settings');
  const confirm = useConfirm();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(s: Setting) {
    setForm({ key: s.key, value: s.value, description: s.description ?? '' });
    setOpen(true);
  }

  useDeepLinkId((id) => {
    const s = list.items.find((x) => x.id === id);
    if (s) openEdit(s);
    return !!s;
  }, String(list.items.length));

  async function save() {
    await api.post('/admin/settings', form);
    toast('Ayar kaydedildi');
    setOpen(false);
    list.load();
  }

  return (
    <div>
      <PageHeader
        title="Uygulama ayarları"
        subtitle="Feature flag, web kahraman metni ve config"
        actions={<Button onClick={openCreate}>Yeni ayar</Button>}
      />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Anahtar veya değer…"
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
            <Th>Anahtar</Th>
            <Th>Değer</Th>
            <Th>Açıklama</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((s) => (
            <tr key={s.id} className={rowClass(list.focusId === s.id)}>
              <Td className="font-mono text-xs">{s.key}</Td>
              <Td className="max-w-xs truncate">{s.value}</Td>
              <Td>{s.description ?? '—'}</Td>
              <Td className="space-x-2 whitespace-nowrap">
                <Button variant="ghost" onClick={() => openEdit(s)}>
                  Düzenle
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Ayar silinsin mi?',
                      danger: true,
                      confirmLabel: 'Sil',
                    });
                    if (!ok) return;
                    await api.delete(`/admin/settings/${s.id}`);
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

      <Drawer open={open} title={form.key ? 'Ayarı düzenle' : 'Yeni ayar'} onClose={() => setOpen(false)}>
        <Field label="Anahtar" hint="Örn. ads.enabled veya web.heroTitle">
          <Input
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            placeholder="web.heroTitle"
          />
        </Field>
        <Field label="Değer">
          <TextArea
            rows={3}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="true"
          />
        </Field>
        {/image|photo|avatar|logo|cover|hero/i.test(form.key) || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(form.value) || form.key === 'web.heroImage' ? (
          <Field label="Görsel yükle" hint="Değeri S3 URL’si olarak yazar">
            <ImageDropzone
              folder="settings"
              value={/^https?:\/\//.test(form.value) ? form.value : ''}
              onChange={(url) => setForm({ ...form, value: url })}
            />
          </Field>
        ) : null}
        <Field label="Açıklama">
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ne işe yarar"
          />
        </Field>
        <Button onClick={save}>Kaydet</Button>
      </Drawer>
    </div>
  );
}
