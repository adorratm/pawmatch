'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useDebouncedValue } from './useDebouncedValue';

type Paged<T> = { items: T[]; total: number; page: number; limit: number };

export function usePagedList<T>(path: string, extra: Record<string, unknown> = {}) {
  const searchParams = useSearchParams();
  const urlId = Number(searchParams.get('id') || 0);
  const [q, setQState] = useState('');
  const [focusId, setFocusId] = useState(0);
  const dq = useDebouncedValue(q, 300);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const extraKey = JSON.stringify({
    ...extra,
    ...(focusId ? { id: focusId } : {}),
  });

  useEffect(() => {
    setFocusId(urlId);
  }, [urlId]);

  useEffect(() => {
    const onCustom = (e: Event) => {
      const nid = Number((e as CustomEvent).detail?.id || 0);
      if (nid) setFocusId(nid);
    };
    window.addEventListener('pawmatch:deeplink', onCustom);
    return () => window.removeEventListener('pawmatch:deeplink', onCustom);
  }, [path]);

  const load = useCallback(async () => {
    if (!path) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const extraObj = JSON.parse(extraKey) as Record<string, unknown>;
      const { data } = await api.get(path, {
        params: {
          q: extraObj.id ? undefined : dq || undefined,
          page,
          limit,
          ...extraObj,
        },
      });
      if (Array.isArray(data)) {
        setItems(data as T[]);
        setTotal(data.length);
      } else {
        const paged = data as Paged<T>;
        setItems(paged.items ?? []);
        setTotal(paged.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [path, dq, page, limit, extraKey]);

  useEffect(() => {
    setPage(1);
  }, [dq, extraKey, path]);

  useEffect(() => {
    load();
  }, [load]);

  const setQ = useCallback((v: string) => {
    setFocusId(0);
    setQState(v);
  }, []);

  const pages = Math.max(1, Math.ceil(total / limit) || 1);

  return {
    q,
    setQ,
    page,
    setPage,
    pages,
    items,
    total,
    loading,
    load,
    limit,
    setLimit,
    focusId,
  };
}
