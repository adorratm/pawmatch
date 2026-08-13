'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { Button, Field, Input } from '@/components/ui';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@pawmatch.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  if (loading || user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      router.replace('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (err as Error)?.message ||
        'Giriş başarısız';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_20%_0%,rgba(166,124,93,0.25),transparent_50%),linear-gradient(160deg,#1a100c_0%,#2c1a12_55%,#3d2418_100%)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-(--border) bg-(--card) p-8 backdrop-blur-md"
      >
        <div className="mb-8">
          <div className="text-3xl font-bold tracking-tight">PawMatch</div>
          <p className="mt-2 text-sm tracking-wide text-(--muted)">Yönetim paneline giriş</p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="E-posta">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pawmatch.local"
              required
            />
          </Field>
          <Field label="Şifre">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </Field>
          {error ? <p className="text-sm text-(--danger)">{error}</p> : null}
          <Button type="submit" disabled={busy} className="mt-3">
            {busy ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
