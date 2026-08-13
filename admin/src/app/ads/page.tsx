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
  Button,
  Checkbox,
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

type Creative = {
  id: number;
  placementId: number;
  title: string;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive: boolean;
};

type Placement = {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  creatives?: Creative[];
};

const emptyPlacement = { id: 0, key: '', name: '', description: '', isActive: true };
const emptyCreative = {
  id: 0,
  placementId: 0,
  title: '',
  body: '',
  ctaLabel: '',
  ctaUrl: '',
  imageUrl: '',
  sortOrder: 0,
  isActive: true,
};

export default function AdsPage() {
  const list = usePagedList<Placement>('/admin/ads/placements');
  const confirm = useConfirm();
  const toast = useToast();
  const [placementOpen, setPlacementOpen] = useState(false);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const [placementForm, setPlacementForm] = useState(emptyPlacement);
  const [creativeForm, setCreativeForm] = useState(emptyCreative);

  function openPlacement(p?: Placement) {
    setPlacementForm(
      p
        ? {
            id: p.id,
            key: p.key,
            name: p.name,
            description: p.description ?? '',
            isActive: p.isActive,
          }
        : emptyPlacement,
    );
    setPlacementOpen(true);
  }

  function openCreative(c?: Creative, placementId?: number) {
    setCreativeForm(
      c
        ? {
            id: c.id,
            placementId: c.placementId,
            title: c.title,
            body: c.body ?? '',
            ctaLabel: c.ctaLabel ?? '',
            ctaUrl: c.ctaUrl ?? '',
            imageUrl: c.imageUrl ?? '',
            sortOrder: c.sortOrder ?? 0,
            isActive: c.isActive,
          }
        : { ...emptyCreative, placementId: placementId ?? list.items[0]?.id ?? 0 },
    );
    setCreativeOpen(true);
  }

  useDeepLinkId((id) => {
    const placement = list.items.find((p) => p.id === id);
    if (placement) {
      openPlacement(placement);
      return true;
    }
    for (const p of list.items) {
      const c = (p.creatives ?? []).find((x) => x.id === id);
      if (c) {
        openCreative(c);
        return true;
      }
    }
    return false;
  }, String(list.items.length));

  async function savePlacement() {
    await api.post('/admin/ads/placements', {
      ...(placementForm.id ? { id: placementForm.id } : {}),
      key: placementForm.key,
      name: placementForm.name,
      description: placementForm.description,
      isActive: placementForm.isActive,
    });
    toast('Alan kaydedildi');
    setPlacementOpen(false);
    list.load();
  }

  async function saveCreative() {
    await api.post('/admin/ads/creatives', {
      ...(creativeForm.id ? { id: creativeForm.id } : {}),
      placementId: Number(creativeForm.placementId),
      title: creativeForm.title,
      body: creativeForm.body,
      ctaLabel: creativeForm.ctaLabel,
      ctaUrl: creativeForm.ctaUrl,
      imageUrl: creativeForm.imageUrl || undefined,
      sortOrder: creativeForm.sortOrder,
      isActive: creativeForm.isActive,
    });
    toast('Reklam kaydedildi');
    setCreativeOpen(false);
    list.load();
  }

  const rows: { kind: 'creative' | 'empty'; p: Placement; c: Creative | null }[] = [];
  for (const p of list.items) {
    const creatives = p.creatives ?? [];
    if (creatives.length === 0) {
      rows.push({ kind: 'empty', p, c: null });
    } else {
      for (const c of creatives) rows.push({ kind: 'creative', p, c });
    }
  }

  return (
    <div>
      <PageHeader
        title="Reklamlar"
        subtitle="Yerleşim ve creative yönetimi"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => openPlacement()}>
              Yeni yerleşim
            </Button>
            <Button onClick={() => openCreative()}>Yeni reklam</Button>
          </div>
        }
      />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Yerleşim adı veya anahtar…"
        page={list.page}
        pages={list.pages}
        total={list.total}
        limit={list.limit}
        onPage={list.setPage}
        onLimit={list.setLimit}
        loading={list.loading}
        empty="Yerleşim yok"
      >
        <thead>
          <tr>
            <Th>Yerleşim</Th>
            <Th>Reklam</Th>
            <Th>CTA</Th>
            <Th>Aktif</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.c ? `c-${row.c.id}` : `p-${row.p.id}`}
              className={rowClass(list.focusId === row.p.id || list.focusId === row.c?.id)}
            >
              <Td>
                <div className="font-medium">{row.p.name}</div>
                <div className="font-mono text-xs text-(--muted)">{row.p.key}</div>
              </Td>
              <Td>{row.c?.title ?? '—'}</Td>
              <Td>{row.c?.ctaLabel ?? '—'}</Td>
              <Td>{(row.c ? row.c.isActive : row.p.isActive) ? 'Evet' : 'Hayır'}</Td>
              <Td className="space-x-2 whitespace-nowrap">
                <Button variant="ghost" onClick={() => openPlacement(row.p)}>
                  Yerleşim
                </Button>
                {row.c ? (
                  <>
                    <Button variant="ghost" onClick={() => openCreative(row.c!)}>
                      Düzenle
                    </Button>
                    <Button
                      variant="danger"
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'Reklam silinsin mi?',
                          danger: true,
                          confirmLabel: 'Sil',
                        });
                        if (!ok) return;
                        await api.delete(`/admin/ads/creatives/${row.c!.id}`);
                        toast('Silindi');
                        list.load();
                      }}
                    >
                      Sil
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" onClick={() => openCreative(undefined, row.p.id)}>
                    Reklam ekle
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      <Drawer
        open={placementOpen}
        title={placementForm.id ? 'Yerleşimi düzenle' : 'Yeni yerleşim'}
        onClose={() => setPlacementOpen(false)}
      >
        <Field label="Anahtar" hint="Örn. discover">
          <Input
            value={placementForm.key}
            onChange={(e) => setPlacementForm({ ...placementForm, key: e.target.value })}
            placeholder="discover"
          />
        </Field>
        <Field label="Ad">
          <Input
            value={placementForm.name}
            onChange={(e) => setPlacementForm({ ...placementForm, name: e.target.value })}
            placeholder="Keşfet banner"
          />
        </Field>
        <Field label="Açıklama">
          <Input
            value={placementForm.description}
            onChange={(e) => setPlacementForm({ ...placementForm, description: e.target.value })}
          />
        </Field>
        <Checkbox
          label="Aktif"
          checked={placementForm.isActive}
          onChange={(v) => setPlacementForm({ ...placementForm, isActive: v })}
        />
        <Button onClick={savePlacement}>Kaydet</Button>
      </Drawer>

      <Drawer
        open={creativeOpen}
        title={creativeForm.id ? 'Reklamı düzenle' : 'Yeni reklam'}
        onClose={() => setCreativeOpen(false)}
      >
        <Field label="Yerleşim">
          <Select
            value={String(creativeForm.placementId)}
            onChange={(e) =>
              setCreativeForm({ ...creativeForm, placementId: Number(e.target.value) })
            }
          >
            {list.items.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Başlık">
          <Input
            value={creativeForm.title}
            onChange={(e) => setCreativeForm({ ...creativeForm, title: e.target.value })}
            placeholder="Pati Gold ile reklamsız gez"
          />
        </Field>
        <Field label="Gövde">
          <TextArea
            rows={3}
            value={creativeForm.body}
            onChange={(e) => setCreativeForm({ ...creativeForm, body: e.target.value })}
          />
        </Field>
        <Field label="Buton metni">
          <Input
            value={creativeForm.ctaLabel}
            onChange={(e) => setCreativeForm({ ...creativeForm, ctaLabel: e.target.value })}
            placeholder="Gold ol"
          />
        </Field>
        <Field label="Buton bağlantısı">
          <Input
            value={creativeForm.ctaUrl}
            onChange={(e) => setCreativeForm({ ...creativeForm, ctaUrl: e.target.value })}
            placeholder="pawmatch://iap"
          />
        </Field>
        <Field label="Görsel" hint="Sürükle-bırak ile S3’e yüklenir">
          <ImageDropzone
            folder="ads"
            value={creativeForm.imageUrl}
            onChange={(url) => setCreativeForm({ ...creativeForm, imageUrl: url })}
          />
        </Field>
        <Checkbox
          label="Aktif"
          checked={creativeForm.isActive}
          onChange={(v) => setCreativeForm({ ...creativeForm, isActive: v })}
        />
        <Button onClick={saveCreative}>Kaydet</Button>
      </Drawer>
    </div>
  );
}
