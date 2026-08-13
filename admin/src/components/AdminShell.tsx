'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, type ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { CommandPalette } from '@/components/CommandPalette';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/users', label: 'Kullanıcılar' },
  { href: '/pets', label: 'Petler' },
  { href: '/matches', label: 'Eşleşmeler' },
  { href: '/support', label: 'Destek' },
  { href: '/i18n', label: 'i18n' },
  { href: '/ads', label: 'Reklamlar' },
  { href: '/plans', label: 'Paketler' },
  { href: '/settings', label: 'Ayarlar' },
  { href: '/veterinarians', label: 'Veterinerler' },
  { href: '/shelters', label: 'Barınaklar' },
  { href: '/temperaments', label: 'Temperamentler' },
  { href: '/cms', label: 'Site sayfaları' },
  { href: '/broadcast', label: 'Bildirim' },
  { href: '/queues', label: 'Kuyruklar' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [loading, user, pathname, router]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center text-(--muted)">Yükleniyor…</div>
    );
  }

  const nav = (
    <>
      <div className="border-b border-(--border) px-5 py-6">
        <div className="text-xl font-bold tracking-tight">PawMatch</div>
        <div className="mt-1 text-[11px] tracking-[0.18em] text-(--muted) uppercase">Yönetim</div>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? 'bg-(--brand) font-medium text-[#f7f3f0]'
                  : 'text-(--muted) hover:bg-white/6 hover:text-(--ink)'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto shrink-0 border-t border-(--border) p-4 text-sm">
        <div className="truncate font-medium">
          {user.firstName} {user.lastName}
        </div>
        <div className="truncate text-xs text-(--muted)">{user.role}</div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace('/login');
          }}
          className="mt-3 w-full rounded-lg border border-(--border) px-3 py-2 text-left text-sm text-[#f7f3f0] transition hover:bg-white/6"
        >
          Çıkış
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-(--border) bg-(--surface-2) md:flex">
        {nav}
      </aside>
      {navOpen ? (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setNavOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="relative flex h-full w-64 flex-col bg-(--surface-2) shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {nav}
          </aside>
        </div>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-(--border) px-4 py-3 sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-[#f7f3f0] md:hidden"
              onClick={() => setNavOpen(true)}
            >
              Menü
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-[#f7f3f0] transition hover:bg-white/8"
            >
              Ara… <span className="ml-2 hidden text-xs text-(--muted) sm:inline">Ctrl K</span>
            </button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <Suspense fallback={<p className="text-sm text-(--muted)">Yükleniyor…</p>}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
