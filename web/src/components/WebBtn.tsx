import type { ReactNode } from 'react';

const base =
  'inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5';

export function WebBtn({
  href,
  variant = 'light',
  children,
}: {
  href: string;
  variant?: 'light' | 'ghost';
  children: ReactNode;
}) {
  const styles =
    variant === 'light'
      ? 'bg-[#f7f3f0] text-[#6a3f2a] hover:bg-white hover:text-[#4d2c1d] hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]'
      : 'border border-white/40 bg-transparent text-[#f7f3f0] hover:border-white/80 hover:bg-white/10 hover:text-white';
  return (
    <a href={href} className={`${base} ${styles}`}>
      {children}
    </a>
  );
}
