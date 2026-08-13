'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import { api } from '@/lib/api';

export function ImageDropzone({
  value,
  onChange,
  folder = 'admin',
  endpoint,
  hint = 'JPEG, PNG, WebP veya GIF · en fazla 8 MB',
}: {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  endpoint?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Yalnızca görsel dosyaları');
        return;
      }
      setError('');
      setBusy(true);
      try {
        const body = new FormData();
        body.append('file', file);
        const url = endpoint || `/admin/uploads?folder=${encodeURIComponent(folder)}`;
        const { data } = await api.post(url, body);
        const next = data?.url as string | undefined;
        if (!next) throw new Error('URL dönmedi');
        onChange(next);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Yükleme başarısız. S3 ayarlarını kontrol edin.';
        setError(typeof msg === 'string' ? msg : 'Yükleme başarısız');
      } finally {
        setBusy(false);
      }
    },
    [endpoint, folder, onChange],
  );

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`cursor-pointer rounded-xl border border-dashed px-4 py-6 text-center transition ${
          over
            ? 'border-(--brand-soft) bg-[rgba(106,63,42,0.28)]'
            : 'border-(--border) bg-white/3 hover:bg-white/6'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void upload(file);
          }}
        />
        {value ? (
          <img
            src={value}
            alt=""
            className="mx-auto mb-3 max-h-40 rounded-lg object-contain"
          />
        ) : null}
        <p className="text-sm text-(--ink)">
          {busy ? 'Yükleniyor…' : value ? 'Değiştirmek için bırakın veya tıklayın' : 'Görseli sürükleyin veya tıklayın'}
        </p>
        <p className="mt-1 text-xs text-(--muted)">{hint}</p>
      </div>
      {value ? (
        <button
          type="button"
          className="text-xs text-(--muted) underline-offset-2 hover:text-(--ink) hover:underline"
          onClick={() => onChange('')}
        >
          Görseli kaldır
        </button>
      ) : null}
      {error ? <p className="text-xs text-(--danger)">{error}</p> : null}
    </div>
  );
}
