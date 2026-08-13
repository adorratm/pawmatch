'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { usePagedList } from '@/hooks/usePagedList';
import { useDeepLinkId } from '@/hooks/useDeepLinkId';
import { useConfirm } from '@/components/ConfirmProvider';
import { useToast } from '@/components/ToastProvider';
import { DataTable } from '@/components/DataTable';
import {
  Button,
  Checkbox,
  Drawer,
  Field,
  Input,
  PageHeader,
  Td,
  TextArea,
  Th,
  rowClass,
} from '@/components/ui';

type Plan = {
  id: number;
  tier: string;
  name: string;
  description: string | null;
  productId: string | null;
  priceLabel: string | null;
  features?: string[] | null;
  superlikesWeeklyLimit: number;
  removesAds: boolean;
  sortOrder?: number;
  isActive: boolean;
};

const emptyForm = {
  id: 0,
  tier: 'gold',
  name: '',
  description: '',
  productId: '',
  priceLabel: '',
  features: '',
  superlikesWeeklyLimit: 3,
  removesAds: true,
  sortOrder: 0,
  isActive: true,
};

export default function PlansPage() {
  const list = usePagedList<Plan>('/admin/plans');
  const confirm = useConfirm();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p: Plan) {
    setForm({
      id: p.id,
      tier: p.tier,
      name: p.name,
      description: p.description ?? '',
      productId: p.productId ?? '',
      priceLabel: p.priceLabel ?? '',
      features: (p.features ?? []).join(', '),
      superlikesWeeklyLimit: p.superlikesWeeklyLimit,
      removesAds: p.removesAds,
      sortOrder: p.sortOrder ?? 0,
      isActive: p.isActive,
    });
    setOpen(true);
  }

  useDeepLinkId((id) => {
    const p = list.items.find((x) => x.id === id);
    if (p) openEdit(p);
    return !!p;
  }, String(list.items.length));

  async function save() {
    await api.post('/admin/plans', {
      ...(form.id ? { id: form.id } : {}),
      tier: form.tier,
      name: form.name,
      description: form.description,
      productId: form.productId || null,
      priceLabel: form.priceLabel,
      features: form.features
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      superlikesWeeklyLimit: form.superlikesWeeklyLimit,
      removesAds: form.removesAds,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    });
    toast('Paket kaydedildi');
    setOpen(false);
    list.load();
  }

  return (
    <div>
      <PageHeader
        title="Abonelik paketleri"
        actions={<Button onClick={openCreate}>Yeni paket</Button>}
      />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Paket adı, kod veya ürün…"
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
            <Th>Kod</Th>
            <Th>Ad</Th>
            <Th>Mağaza ürünü</Th>
            <Th>Süper beğeni</Th>
            <Th>Reklamsız</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((p) => (
            <tr key={p.id} className={rowClass(list.focusId === p.id)}>
              <Td>{p.tier}</Td>
              <Td>{p.name}</Td>
              <Td>{p.productId ?? '—'}</Td>
              <Td>{p.superlikesWeeklyLimit}</Td>
              <Td>{p.removesAds ? 'Evet' : 'Hayır'}</Td>
              <Td className="space-x-2 whitespace-nowrap">
                <Button variant="ghost" onClick={() => openEdit(p)}>
                  Düzenle
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Paket silinsin mi?',
                      danger: true,
                      confirmLabel: 'Sil',
                    });
                    if (!ok) return;
                    await api.delete(`/admin/plans/${p.id}`);
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

      <Drawer open={open} title={form.id ? 'Paketi düzenle' : 'Yeni paket'} onClose={() => setOpen(false)}>
        <Field label="Paket kodu" hint="Örn. gold, free">
          <Input
            value={form.tier}
            onChange={(e) => setForm({ ...form, tier: e.target.value })}
            placeholder="gold"
          />
        </Field>
        <Field label="Ad">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Pati Gold"
          />
        </Field>
        <Field label="Açıklama">
          <TextArea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Reklamsız deneyim"
          />
        </Field>
        <Field label="Mağaza ürün kodu">
          <Input
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            placeholder="pati_gold_monthly"
          />
        </Field>
        <Field label="Fiyat etiketi">
          <Input
            value={form.priceLabel}
            onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
            placeholder="Aylık"
          />
        </Field>
        <Field label="Özellikler" hint="Virgülle ayırın">
          <Input
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            placeholder="Reklamsız, Süper beğeni"
          />
        </Field>
        <Field label="Haftalık süper beğeni">
          <Input
            type="number"
            value={form.superlikesWeeklyLimit}
            onChange={(e) => setForm({ ...form, superlikesWeeklyLimit: Number(e.target.value) })}
          />
        </Field>
        <Field label="Sıra">
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
        </Field>
        <Checkbox
          label="Reklamları kaldırır"
          checked={form.removesAds}
          onChange={(v) => setForm({ ...form, removesAds: v })}
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
