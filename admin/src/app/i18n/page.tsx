'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { usePagedList } from '@/hooks/usePagedList';
import { useDeepLinkId } from '@/hooks/useDeepLinkId';
import { useConfirm } from '@/components/ConfirmProvider';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/DataTable';
import {
  Button,
  Drawer,
  Field,
  Input,
  PageHeader,
  Select,
  Td,
  TextArea,
  Th,
  rowClass,
} from '@/components/ui';

type Locale = { id: number; code: string; name: string; isActive: boolean; isDefault: boolean };
type Entry = { id: number; key: string; value: string };

export default function I18nPage() {
  const [locales, setLocales] = useState<Locale[]>([]);
  const [localeId, setLocaleId] = useState<number | null>(null);
  const list = usePagedList<Entry>(
    localeId ? `/admin/i18n/locales/${localeId}/entries` : '',
  );
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ key: '', value: '' });
  const confirm = useConfirm();
  const toast = useToast();

  async function loadLocales() {
    const { data } = await api.get('/admin/i18n/locales');
    setLocales(data);
    if (!localeId && data[0]) setLocaleId(data[0].id);
  }

  useEffect(() => {
    loadLocales();
  }, []);

  function openEdit(e?: Entry) {
    setForm(e ? { key: e.key, value: e.value } : { key: '', value: '' });
    setOpen(true);
  }

  useDeepLinkId((id) => {
    const e = list.items.find((x) => x.id === id);
    if (e) openEdit(e);
    return !!e;
  }, String(list.items.length));

  async function save() {
    if (!localeId) return;
    await api.post(`/admin/i18n/locales/${localeId}/entries`, form);
    toast('Çeviri kaydedildi');
    setOpen(false);
    list.load();
  }

  return (
    <div>
      <PageHeader
        title="i18n"
        subtitle="Çeviri anahtarları ve diller"
        actions={<Button onClick={() => openEdit()}>Yeni çeviri</Button>}
      />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Anahtar veya metin ara…"
        page={list.page}
        pages={list.pages}
        total={list.total}
        limit={list.limit}
        onPage={list.setPage}
        onLimit={list.setLimit}
        loading={list.loading}
        toolbar={
          <>
            <Field label="Dil">
              <Select
                className="w-52"
                value={localeId ?? ''}
                onChange={(e) => setLocaleId(Number(e.target.value))}
              >
                {locales.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} — {l.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Yeni dil kodu">
              <Input
                className="w-28"
                placeholder="en"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </Field>
            <Field label="Dil adı">
              <Input
                className="w-40"
                placeholder="English"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Field>
            <Button
              variant="ghost"
              onClick={async () => {
                await api.post('/admin/i18n/locales', { code: newCode, name: newName });
                setNewCode('');
                setNewName('');
                toast('Dil eklendi');
                loadLocales();
              }}
            >
              Dil ekle
            </Button>
          </>
        }
      >
        <thead>
          <tr>
            <Th>Anahtar</Th>
            <Th>Değer</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((e) => (
            <tr key={e.id} className={rowClass(list.focusId === e.id)}>
              <Td className="font-mono text-xs">{e.key}</Td>
              <Td>{e.value}</Td>
              <Td className="space-x-2 whitespace-nowrap">
                <Button variant="ghost" onClick={() => openEdit(e)}>
                  Düzenle
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Çeviri silinsin mi?',
                      danger: true,
                      confirmLabel: 'Sil',
                    });
                    if (!ok) return;
                    await api.delete(`/admin/i18n/entries/${e.id}`);
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

      <Drawer open={open} title={form.key ? 'Çeviriyi düzenle' : 'Yeni çeviri'} onClose={() => setOpen(false)}>
        <Field label="Çeviri anahtarı" hint="Örn. common.ok">
          <Input
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            placeholder="common.ok"
          />
        </Field>
        <Field label="Değer">
          <TextArea
            rows={4}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="Tamam"
          />
        </Field>
        <Button onClick={save}>Kaydet</Button>
      </Drawer>
    </div>
  );
}
