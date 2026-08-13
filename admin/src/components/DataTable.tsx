'use client';

import type { ReactNode } from 'react';
import { EmptyState, Field, Input, Pagination, Table, Toolbar } from '@/components/ui';

export function DataTable({
  q,
  onQ,
  searchPlaceholder,
  searchHint,
  page,
  pages,
  total,
  limit,
  onPage,
  onLimit,
  loading,
  empty = 'Kayıt yok',
  toolbar,
  children,
}: {
  q: string;
  onQ: (v: string) => void;
  searchPlaceholder: string;
  searchHint?: string;
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
  onLimit: (n: number) => void;
  loading?: boolean;
  empty?: string;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <Toolbar>
        <Field label="Ara" hint={searchHint}>
          <Input
            className="w-full min-w-0 sm:max-w-md"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => onQ(e.target.value)}
          />
        </Field>
        {toolbar}
      </Toolbar>
      <Table>{children}</Table>
      {loading ? <p className="px-4 py-6 text-sm text-(--muted)">Yükleniyor…</p> : null}
      {!loading && total === 0 ? <EmptyState text={empty} /> : null}
      <Pagination
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        onPage={onPage}
        onLimit={onLimit}
      />
    </div>
  );
}
