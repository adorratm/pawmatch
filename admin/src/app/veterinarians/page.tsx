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

type Vet = {
  id: number;
  licenseNumber: string;
  specialization?: string;
  bio?: string | null;
  isVerified: boolean;
  isActive: boolean;
  user?: { firstName?: string; lastName?: string; email?: string };
  clinics?: { name?: string; city?: string; phone?: string }[];
};

export default function VetsPage() {
  const list = usePagedList<Vet>('/admin/veterinarians');
  const confirm = useConfirm();
  const toast = useToast();
  const [editing, setEditing] = useState<Vet | null>(null);
  const [form, setForm] = useState({
    licenseNumber: '',
    specialization: '',
    bio: '',
    clinicName: '',
    city: '',
    phone: '',
    isVerified: false,
    isActive: true,
  });

  function fill(v: Vet) {
    const clinic = v.clinics?.[0];
    setEditing(v);
    setForm({
      licenseNumber: v.licenseNumber ?? '',
      specialization: v.specialization ?? '',
      bio: v.bio ?? '',
      clinicName: clinic?.name ?? '',
      city: clinic?.city ?? '',
      phone: clinic?.phone ?? '',
      isVerified: v.isVerified,
      isActive: v.isActive,
    });
  }

  useDeepLinkId(async (id) => {
    const { data } = await api.get(`/admin/veterinarians/${id}`);
    fill(data);
  });

  async function save() {
    if (!editing) return;
    await api.patch(`/admin/veterinarians/${editing.id}`, form);
    toast('Veteriner güncellendi');
    setEditing(null);
    list.load();
  }

  return (
    <div>
      <PageHeader title="Veterinerler" subtitle="Klinik, onay ve iletişim" />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Lisans, uzmanlık, e-posta…"
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
            <Th>Kişi</Th>
            <Th>Lisans</Th>
            <Th>Klinik</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((v) => (
            <tr key={v.id} className={rowClass(list.focusId === v.id)}>
              <Td>{v.id}</Td>
              <Td>
                {v.user?.firstName} {v.user?.lastName}
                <div className="text-xs text-(--muted)">{v.user?.email}</div>
              </Td>
              <Td>{v.licenseNumber}</Td>
              <Td>{v.clinics?.[0]?.name ?? '—'}</Td>
              <Td>
                <Actions>
                  <Button variant="ghost" onClick={() => fill(v)}>
                    Düzenle
                  </Button>
                  <Switch
                    label="Onaylı"
                    checked={v.isVerified}
                    onChange={async (on) => {
                      await api.patch(`/admin/veterinarians/${v.id}`, { isVerified: on });
                      list.load();
                    }}
                  />
                  <Switch
                    label="Aktif"
                    checked={v.isActive}
                    onChange={async (on) => {
                      await api.patch(`/admin/veterinarians/${v.id}`, { isActive: on });
                      list.load();
                    }}
                  />
                  <Button
                    variant="danger"
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Veteriner silinsin mi?',
                        danger: true,
                        confirmLabel: 'Sil',
                      });
                      if (!ok) return;
                      await api.delete(`/admin/veterinarians/${v.id}`);
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

      <Drawer
        open={!!editing}
        title={editing ? `Veteriner #${editing.id}` : ''}
        onClose={() => setEditing(null)}
      >
        <Field label="Lisans no">
          <Input
            value={form.licenseNumber}
            onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
          />
        </Field>
        <Field label="Uzmanlık">
          <Input
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            placeholder="Dahiliye"
          />
        </Field>
        <Field label="Klinik adı">
          <Input
            value={form.clinicName}
            onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
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
          />
        </Field>
        <Field label="Biyografi">
          <TextArea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
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
