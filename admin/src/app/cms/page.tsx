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
  Td,
  TextArea,
  Th,
  rowClass,
} from '@/components/ui';

type CmsPage = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  seoDescription: string | null;
  sortOrder: number;
  isPublished: boolean;
};

const emptyForm = {
  id: 0,
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  seoDescription: '',
  sortOrder: 0,
  isPublished: true,
};

export default function CmsPagesPage() {
  const list = usePagedList<CmsPage>('/admin/cms/pages');
  const confirm = useConfirm();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function openEdit(p?: CmsPage) {
    setForm(
      p
        ? {
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt ?? '',
            body: p.body,
            seoDescription: p.seoDescription ?? '',
            sortOrder: p.sortOrder,
            isPublished: p.isPublished,
          }
        : emptyForm,
    );
    setOpen(true);
  }

  useDeepLinkId(async (id) => {
    const { data } = await api.get(`/admin/cms/pages/${id}`);
    openEdit(data);
  });

  async function save() {
    await api.post('/admin/cms/pages', {
      ...(form.id ? { id: form.id } : {}),
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      body: form.body,
      seoDescription: form.seoDescription,
      sortOrder: form.sortOrder,
      isPublished: form.isPublished,
    });
    toast('Sayfa kaydedildi');
    setOpen(false);
    list.load();
  }

  return (
    <div>
      <PageHeader
        title="Site sayfaları"
        subtitle="Hakkımızda, iletişim ve yasal metinler"
        actions={<Button onClick={() => openEdit()}>Yeni sayfa</Button>}
      />
      <DataTable
        q={list.q}
        onQ={list.setQ}
        searchPlaceholder="Başlık veya slug…"
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
            <Th>Slug</Th>
            <Th>Başlık</Th>
            <Th>Sıra</Th>
            <Th>Yayın</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {list.items.map((p) => (
            <tr key={p.id} className={rowClass(list.focusId === p.id)}>
              <Td className="font-mono text-xs">{p.slug}</Td>
              <Td>{p.title}</Td>
              <Td>{p.sortOrder}</Td>
              <Td>{p.isPublished ? 'Yayında' : 'Taslak'}</Td>
              <Td className="space-x-2 whitespace-nowrap">
                <Button variant="ghost" onClick={() => openEdit(p)}>
                  Düzenle
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Sayfa silinsin mi?',
                      danger: true,
                      confirmLabel: 'Sil',
                    });
                    if (!ok) return;
                    await api.delete(`/admin/cms/pages/${p.id}`);
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

      <Drawer open={open} title={form.id ? 'Sayfayı düzenle' : 'Yeni sayfa'} onClose={() => setOpen(false)}>
        <Field label="Slug" hint="URL parçası, örn. hakkimizda">
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="hakkimizda"
          />
        </Field>
        <Field label="Başlık">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Hakkımızda"
          />
        </Field>
        <Field label="Özet">
          <Input
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
        </Field>
        <Field label="SEO açıklaması">
          <Input
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          />
        </Field>
        <Field label="Gövde">
          <TextArea
            rows={10}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Sayfa metni"
          />
        </Field>
        <Field label="Gövdeye görsel ekle" hint="Yüklenen görsel markdown olarak metne eklenir">
          <ImageDropzone
            folder="cms"
            onChange={(url) => {
              const snippet = `\n\n![görsel](${url})\n`;
              setForm((f) => ({ ...f, body: `${f.body}${snippet}` }));
            }}
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
          label="Yayında"
          checked={form.isPublished}
          onChange={(v) => setForm({ ...form, isPublished: v })}
        />
        <Button onClick={save}>Kaydet</Button>
      </Drawer>
    </div>
  );
}
