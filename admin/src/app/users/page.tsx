'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { usePagedList } from '@/hooks/usePagedList';
import { useDeepLinkId } from '@/hooks/useDeepLinkId';
import { useConfirm } from '@/components/ConfirmProvider';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/DataTable';
import { ImageDropzone } from '@/components/ImageDropzone';
import { UserActivity, type UserActivityPayload } from '@/components/UserActivity';
import {
  Actions,
  Button,
  Checkbox,
  Drawer,
  Field,
  Input,
  PageHeader,
  Select,
  Switch,
  Td,
  Th,
  rowClass,
} from '@/components/ui';

type UserRow = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified?: boolean;
  profile?: { avatar?: string | null };
};

const emptyForm = {
  firstName: '',
  lastName: '',
  role: 'user',
  isActive: true,
  emailVerified: false,
  avatar: '',
};

export default function UsersPage() {
  const list = usePagedList<UserRow>('/admin/users');
  const confirm = useConfirm();
  const toast = useToast();
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tab, setTab] = useState<'edit' | 'activity'>('edit');
  const [activity, setActivity] = useState<UserActivityPayload | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);

  async function loadActivity(id: number) {
    setActivityLoading(true);
    try {
      const { data } = await api.get(`/admin/users/${id}/activity`);
      setActivity(data);
    } catch {
      setActivity(null);
      toast('İşlemler yüklenemedi');
    } finally {
      setActivityLoading(false);
    }
  }

  async function openById(id: number, nextTab: 'edit' | 'activity' = 'edit') {
    const { data } = await api.get(`/admin/users/${id}`);
    setEditing(data);
    setTab(nextTab);
    setForm({
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      role: data.role,
      isActive: data.isActive,
      emailVerified: !!data.emailVerified,
      avatar: data.profile?.avatar ?? '',
    });
    void loadActivity(id);
  }

  async function openEdit(u: UserRow) {
    await openById(u.id, 'edit');
  }

  useDeepLinkId((id) => openById(id, 'activity'));

  async function save() {
    if (!editing) return;
    await api.patch(`/admin/users/${editing.id}`, form);
    toast('Kullanıcı güncellendi');
    setEditing(null);
    list.load();
  }

  async function overrideGold(id: number) {
    const ok = await confirm({
      title: 'Gold verilsin mi?',
      description: 'Bu kullanıcıya 1 aylık Pati Gold tanımlanacak.',
      confirmLabel: 'Gold ver',
    });
    if (!ok) return;
    const until = new Date();
    until.setMonth(until.getMonth() + 1);
    await api.post(`/admin/users/${id}/subscription`, {
      tier: 'gold',
      activeUntil: until.toISOString(),
      productId: 'admin_override',
    });
    toast('Gold tanımlandı');
  }

  return (
    <div>
      <PageHeader title="Kullanıcılar" subtitle="Rol, aktiflik, abonelik ve mobil işlem geçmişi" />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="E-posta, ad, telefon…"
        searchHint="Ad, soyad veya e-posta ile süz"
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
            <Th>E-posta</Th>
            <Th>Rol</Th>
            <Th>Durum</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((u) => (
            <tr key={u.id} className={rowClass(list.focusId === u.id)}>
              <Td>{u.id}</Td>
              <Td>
                {u.firstName} {u.lastName}
              </Td>
              <Td>{u.email}</Td>
              <Td>{u.role}</Td>
              <Td>{u.isActive ? 'Aktif' : 'Pasif'}</Td>
              <Td>
                <Actions>
                  <Button variant="ghost" onClick={() => openEdit(u)}>
                    Düzenle
                  </Button>
                  <Button variant="ghost" onClick={() => openById(u.id, 'activity')}>
                    İşlemler
                  </Button>
                  <Switch
                    label="Aktif"
                    checked={u.isActive}
                    onChange={async (v) => {
                      await api.patch(`/admin/users/${u.id}`, { isActive: v });
                      list.load();
                    }}
                  />
                  <Button variant="ghost" onClick={() => overrideGold(u.id)}>
                    1 aylık Gold ver
                  </Button>
                </Actions>
              </Td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      {editing ? (
        <Drawer
          open
          size="xl"
          title={`Kullanıcı #${editing.id} · ${editing.firstName} ${editing.lastName}`}
          onClose={() => setEditing(null)}
        >
          <div className="flex gap-2">
            <Button variant={tab === 'edit' ? 'primary' : 'ghost'} onClick={() => setTab('edit')}>
              Düzenle
            </Button>
            <Button variant={tab === 'activity' ? 'primary' : 'ghost'} onClick={() => setTab('activity')}>
              Mobil işlemler
            </Button>
          </div>
          {tab === 'edit' ? (
            <>
              <Field label="Ad">
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Ayşe"
                />
              </Field>
              <Field label="Avatar">
                <ImageDropzone
                  folder="avatars"
                  value={form.avatar}
                  onChange={(url) => setForm({ ...form, avatar: url })}
                />
              </Field>
              <Field label="Soyad">
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Yılmaz"
                />
              </Field>
              <Field label="Rol">
                <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="user">Kullanıcı</option>
                  <option value="moderator">Moderatör</option>
                  <option value="admin">Yönetici</option>
                </Select>
              </Field>
              <Checkbox
                label="E-posta doğrulanmış"
                checked={form.emailVerified}
                onChange={(v) => setForm({ ...form, emailVerified: v })}
              />
              <Checkbox
                label="Hesap aktif"
                checked={form.isActive}
                onChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Button onClick={save}>Kaydet</Button>
            </>
          ) : (
            <UserActivity data={activity} loading={activityLoading} />
          )}
        </Drawer>
      ) : null}
    </div>
  );
}
