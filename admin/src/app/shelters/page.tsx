'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { usePagedList } from '@/hooks/usePagedList';
import { useDeepLinkId } from '@/hooks/useDeepLinkId';
import { useConfirm } from '@/components/ConfirmProvider';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/DataTable';
import {
  Actions,
  Button,
  Checkbox,
  Drawer,
  Field,
  Input,
  PageHeader,
  Switch,
  Td,
  TextArea,
  Th,
  rowClass,
} from '@/components/ui';

type Shelter = {
  id: number;
  name: string;
  city?: string;
  phone?: string;
  address?: string | null;
  isVerified: boolean;
  isActive: boolean;
  userId: number;
};

const emptyForm = {
  id: 0,
  name: '',
  userId: 1,
  city: '',
  phone: '',
  address: '',
  isVerified: false,
  isActive: true,
};

export default function SheltersPage() {
  const list = usePagedList<Shelter>('/admin/shelters');
  const confirm = useConfirm();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function openEdit(s?: Shelter) {
    setForm(
      s
        ? {
            id: s.id,
            name: s.name,
            userId: s.userId,
            city: s.city ?? '',
            phone: s.phone ?? '',
            address: s.address ?? '',
            isVerified: s.isVerified,
            isActive: s.isActive,
          }
        : emptyForm,
    );
    setOpen(true);
  }

  useDeepLinkId((id) => {
    const s = list.items.find((x) => x.id === id);
    if (s) openEdit(s);
    return !!s;
  }, String(list.items.length));

  async function save() {
    await api.post('/admin/shelters', {
      ...(form.id ? { id: form.id } : {}),
      name: form.name,
      userId: Number(form.userId),
      city: form.city,
      phone: form.phone,
      address: form.address,
      isVerified: form.isVerified,
      isActive: form.isActive,
    });
    toast('Barınak kaydedildi');
    setOpen(false);
    list.load();
  }

  return (
    <div>
      <PageHeader
        title="Barınaklar"
        actions={<Button onClick={() => openEdit()}>Yeni barınak</Button>}
      />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Ad, şehir, e-posta…"
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
            <Th>Şehir</Th>
            <Th>Doğrulama</Th>
            <Th>Aktif</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((s) => (
            <tr key={s.id} className={rowClass(list.focusId === s.id)}>
              <Td>{s.id}</Td>
              <Td>{s.name}</Td>
              <Td>{s.city ?? '—'}</Td>
              <Td>{s.isVerified ? 'Evet' : 'Hayır'}</Td>
              <Td>{s.isActive ? 'Evet' : 'Hayır'}</Td>
              <Td>
                <Actions>
                  <Button variant="ghost" onClick={() => openEdit(s)}>
                    Düzenle
                  </Button>
                  <Switch
                    label="Onaylı"
                    checked={s.isVerified}
                    onChange={async (v) => {
                      await api.post('/admin/shelters', {
                        id: s.id,
                        userId: s.userId,
                        name: s.name,
                        isVerified: v,
                        isActive: s.isActive,
                      });
                      list.load();
                    }}
                  />
                  <Switch
                    label="Aktif"
                    checked={s.isActive}
                    onChange={async (v) => {
                      await api.post('/admin/shelters', {
                        id: s.id,
                        userId: s.userId,
                        name: s.name,
                        isVerified: s.isVerified,
                        isActive: v,
                      });
                      list.load();
                    }}
                  />
                  <Button
                    variant="danger"
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Barınak silinsin mi?',
                        danger: true,
                        confirmLabel: 'Sil',
                      });
                      if (!ok) return;
                      await api.delete(`/admin/shelters/${s.id}`);
                      toast('Silindi');
                      list.load();
                    }}
                  >
                    Sil
                  </Button>
                </Actions>
              </Td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      <Drawer open={open} title={form.id ? 'Barınağı düzenle' : 'Yeni barınak'} onClose={() => setOpen(false)}>
        <Field label="Ad">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Pati Evi"
          />
        </Field>
        <Field label="Sahip kullanıcı ID">
          <Input
            type="number"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
            placeholder="1"
          />
        </Field>
        <Field label="Şehir">
          <Input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="İstanbul"
          />
        </Field>
        <Field label="Telefon">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+90…"
          />
        </Field>
        <Field label="Adres">
          <TextArea
            rows={3}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Field>
        <Checkbox
          label="Onaylı"
          checked={form.isVerified}
          onChange={(v) => setForm({ ...form, isVerified: v })}
        />
        <Checkbox
          label="Aktif"
          checked={form.isActive}
          onChange={(v) => setForm({ ...form, isActive: v })}
        />
        <Button onClick={save}>Kaydet</Button>
      </Drawer>
    </div>
  );
}
