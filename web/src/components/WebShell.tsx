'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const LINKS = [
  { href: '/', label: 'Ana sayfa' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/iletisim', label: 'İletişim' },
];

const LEGAL = [
  { href: '/gizlilik', label: 'Gizlilik' },
  { href: '/kullanim-kosullari', label: 'Kullanım koşulları' },
  { href: '/kvkk', label: 'KVKK' },
  { href: '/cerez-politikasi', label: 'Çerez politikası' },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden>
      {open ? (
        <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      ) : (
        <>
          <path d="M3.5 5.5h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M3.5 10h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M3.5 14.5h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function NavLinks({
  pathname,
  onClick,
  className = '',
}: {
  pathname: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <>
      {LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={`${className} transition hover:text-[#f7f3f0] ${
            pathname === item.href ? 'text-[#f7f3f0]' : 'text-white/70'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function WebShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [legalOpen, setLegalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLegalOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!legalOpen) return;
    const close = () => setLegalOpen(false);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [legalOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-[#1a100c] text-[#f7f3f0]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#1a100c]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-12">
          <Link href="/" className="text-lg font-bold tracking-tight">
            PawMatch
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <NavLinks pathname={pathname} />
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-white/70 transition hover:text-[#f7f3f0]"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setLegalOpen((v) => !v)}
                aria-expanded={legalOpen}
              >
                Yasal
                <svg
                  className={`h-3.5 w-3.5 transition ${legalOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path d="M4 6.5 8 10.5 12 6.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
              {legalOpen ? (
                <div
                  className="absolute right-0 z-30 mt-2 min-w-52 overflow-hidden rounded-xl border border-white/12 bg-[#2a1b14] py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {LEGAL.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setLegalOpen(false)}
                      className={`block px-4 py-2.5 text-sm transition ${
                        pathname === item.href
                          ? 'bg-[#6a3f2a] font-medium text-[#f7f3f0]'
                          : 'text-[#f7f3f0] hover:bg-white/8'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <Link
              href="/#indir"
              className="rounded-md bg-[#f7f3f0] px-4 py-2 text-sm font-medium text-[#6a3f2a] transition hover:bg-white hover:text-[#4d2c1d]"
            >
              Uygulamayı indir
            </Link>
          </nav>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm text-[#f7f3f0] transition hover:bg-white/8 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
          >
            <MenuIcon open={menuOpen} />
            Menü
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.button
            key="menu-overlay"
            type="button"
            aria-label="Menüyü kapat"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {menuOpen ? (
          <motion.aside
            key="menu-drawer"
            id="site-menu"
            className="fixed inset-y-0 right-0 z-50 flex h-dvh w-[min(100%,22rem)] flex-col border-l border-white/10 bg-[#241610] shadow-[-24px_0_64px_rgba(0,0,0,0.45)] md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-sm tracking-[0.16em] text-[#a67c5d] uppercase">Menü</span>
              <button
                type="button"
                className="rounded-md border border-white/15 p-2 text-[#f7f3f0] transition hover:bg-white/8"
                onClick={() => setMenuOpen(false)}
                aria-label="Kapat"
              >
                <MenuIcon open />
              </button>
            </div>
            <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4">
              {LINKS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-base transition ${
                      active
                        ? 'bg-[#6a3f2a] font-medium text-[#f7f3f0]'
                        : 'text-white/75 hover:bg-white/8 hover:text-[#f7f3f0]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <p className="mt-5 px-4 text-[11px] tracking-[0.16em] text-[#a67c5d] uppercase">Yasal</p>
              {LEGAL.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm transition ${
                      active
                        ? 'bg-[#6a3f2a] font-medium text-[#f7f3f0]'
                        : 'text-white/65 hover:bg-white/8 hover:text-[#f7f3f0]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-white/10 p-4">
              <Link
                href="/#indir"
                onClick={() => setMenuOpen(false)}
                className="block rounded-md bg-[#f7f3f0] px-4 py-3 text-center text-sm font-medium text-[#6a3f2a] transition hover:bg-white hover:text-[#4d2c1d]"
              >
                Uygulamayı indir
              </Link>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-white/45 sm:px-6 md:flex-row md:flex-wrap md:items-center md:justify-between md:px-12">
          <span className="font-bold text-white/80">PawMatch</span>
          <nav className="flex flex-wrap gap-4">
            <Link href="/hakkimizda" className="hover:text-[#f7f3f0]">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="hover:text-[#f7f3f0]">
              İletişim
            </Link>
            <Link href="/gizlilik" className="hover:text-[#f7f3f0]">
              Gizlilik
            </Link>
            <Link href="/kullanim-kosullari" className="hover:text-[#f7f3f0]">
              Koşullar
            </Link>
            <Link href="/kvkk" className="hover:text-[#f7f3f0]">
              KVKK
            </Link>
          </nav>
          <span>© {new Date().getFullYear()} PawMatch</span>
        </div>
      </footer>
    </div>
  );
}
