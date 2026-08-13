'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { usePagedList } from '@/hooks/usePagedList';
import { useDeepLinkId } from '@/hooks/useDeepLinkId';
import { useConfirm } from '@/components/ConfirmProvider';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/DataTable';
import { ImageDropzone } from '@/components/ImageDropzone';
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

type Photo = { id: number; url: string; isMain?: boolean };

type Pet = {
  id: number;
  name: string;
  species: string;
  breed?: string;
  bio?: string | null;
  isActive: boolean;
  isAdopted: boolean;
  owner?: { email?: string; firstName?: string };
  photos?: Photo[];
};

export default function PetsPage() {
  const list = usePagedList<Pet>('/admin/pets');
  const confirm = useConfirm();
  const toast = useToast();
  const [editing, setEditing] = useState<Pet | null>(null);
  const [form, setForm] = useState({
    name: '',
    breed: '',
    bio: '',
    isActive: true,
    isAdopted: false,
  });

  async function openEdit(p: Pet) {
    const { data } = await api.get(`/admin/pets/${p.id}`);
    setEditing(data);
    setForm({
      name: data.name ?? '',
      breed: data.breed ?? '',
      bio: data.bio ?? '',
      isActive: data.isActive,
      isAdopted: data.isAdopted,
    });
  }

  useDeepLinkId(async (id) => {
    const { data } = await api.get(`/admin/pets/${id}`);
    openEdit(data);
  });

  async function save() {
    if (!editing) return;
    await api.patch(`/admin/pets/${editing.id}`, form);
    toast('Pet güncellendi');
    setEditing(null);
    list.load();
  }

  return (
    <div>
      <PageHeader title="Petler" subtitle="İlan moderasyonu" />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Ad, ırk, sahip…"
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
            <Th>Tür</Th>
            <Th>Sahip</Th>
            <Th>Durum</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((p) => (
            <tr key={p.id} className={rowClass(list.focusId === p.id)}>
              <Td>{p.id}</Td>
              <Td>{p.name}</Td>
              <Td>
                {p.species} {p.breed ? `· ${p.breed}` : ''}
              </Td>
              <Td>{p.owner?.email ?? p.owner?.firstName ?? '—'}</Td>
              <Td>{!p.isActive ? 'Gizli' : p.isAdopted ? 'Sahiplenildi' : 'Aktif'}</Td>
              <Td>
                <Actions>
                  <Button variant="ghost" onClick={() => openEdit(p)}>
                    Düzenle
                  </Button>
                  <Switch
                    label="Görünür"
                    checked={p.isActive}
                    onChange={async (v) => {
                      await api.patch(`/admin/pets/${p.id}`, { isActive: v });
                      toast(v ? 'Gösteriliyor' : 'Gizlendi');
                      list.load();
                    }}
                  />
                  <Button
                    variant="danger"
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Pet silinsin mi?',
                        description: 'Bu işlem geri alınamaz.',
                        danger: true,
                        confirmLabel: 'Sil',
                      });
                      if (!ok) return;
                      await api.delete(`/admin/pets/${p.id}`);
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

      {editing ? (
      <Drawer open title={`Pet · ${editing.name}`} onClose={() => setEditing(null)}>
        <Field label="Ad">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Boncuk"
          />
        </Field>
        <Field label="Irk">
          <Input
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
            placeholder="Tekir"
          />
        </Field>
        <Field label="Biyografi">
          <TextArea
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Kısa tanıtım"
          />
        </Field>
        <Field label="Fotoğraflar">
          <div className="flex flex-wrap gap-2">
            {(editing.photos ?? []).map((ph) => (
              <div key={ph.id} className="relative">
                <img src={ph.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                <button
                  type="button"
                  className="absolute -top-1 -right-1 rounded-full bg-(--danger) px-1.5 text-[10px] text-white"
                  onClick={async () => {
                    await api.delete(`/admin/pets/${editing.id}/photos/${ph.id}`);
                    const { data } = await api.get(`/admin/pets/${editing.id}`);
                    setEditing(data);
                    toast('Fotoğraf silindi');
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <ImageDropzone
            folder="pets"
            endpoint={`/admin/pets/${editing.id}/photos`}
            value=""
            onChange={async () => {
              const { data } = await api.get(`/admin/pets/${editing.id}`);
              setEditing(data);
              toast('Fotoğraf yüklendi');
            }}
          />
        </Field>
        <Checkbox
          label="Aktif (görünür)"
          checked={form.isActive}
          onChange={(v) => setForm({ ...form, isActive: v })}
        />
        <Checkbox
          label="Sahiplenildi"
          checked={form.isAdopted}
          onChange={(v) => setForm({ ...form, isAdopted: v })}
        />
        <Button onClick={save}>Kaydet</Button>
      </Drawer>
      ) : null}
    </div>
  );
}
