'use client';

import type {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { Children, isValidElement, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-xl text-sm text-(--muted)">{subtitle}</p> : null}
      </motion.div>
      {actions}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-(--border) bg-(--card) p-5 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-(--border) bg-(--card) p-5"
    >
      <div className="text-xs tracking-[0.16em] text-(--muted) uppercase">{label}</div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-(--muted)">{hint}</div> : null}
    </motion.div>
  );
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
}) {
  const styles =
    variant === 'primary'
      ? 'bg-[var(--brand)] text-[#f7f3f0] hover:bg-[var(--brand-light)] hover:text-[#f7f3f0]'
      : variant === 'danger'
        ? 'bg-[var(--danger)] text-[#f7f3f0] hover:brightness-110 hover:text-[#f7f3f0]'
        : 'border border-white/15 bg-transparent text-[#f7f3f0] hover:bg-white/8 hover:text-[#f7f3f0]';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium whitespace-nowrap transition duration-200 hover:-translate-y-px disabled:opacity-50 sm:h-11 sm:px-4 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

const control =
  'h-11 w-full rounded-lg border border-(--border) bg-black/25 px-3 text-sm text-[#f7f3f0] outline-none transition placeholder:text-(--muted) focus:border-(--brand-soft)';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return <input {...rest} className={`${control} ${className}`} />;
}

function selectOptions(children: ReactNode) {
  const options: { value: string; label: string }[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode }>(child)) return;
    if (child.type !== 'option') return;
    options.push({
      value: String(child.props.value ?? ''),
      label: String(child.props.children ?? ''),
    });
  });
  return options;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, value, onChange, disabled, name } = props;
  const options = selectOptions(children);
  const current = String(value ?? '');
  const selected = options.find((o) => o.value === current) ?? options[0];
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 180, maxHeight: 260 });

  function place() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 6;
    const below = window.innerHeight - r.bottom - gap;
    const above = r.top - gap;
    const openUp = below < 200 && above > below;
    const maxHeight = Math.max(120, Math.min(280, openUp ? above : below));
    setPos({
      top: openUp ? r.top - maxHeight - gap : r.bottom + gap,
      left: Math.min(r.left, window.innerWidth - Math.max(r.width, 180) - 8),
      width: Math.max(r.width, 180),
      maxHeight,
    });
  }

  useEffect(() => {
    if (!open) return;
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  function pick(next: string) {
    setOpen(false);
    onChange?.({
      target: { value: next, name: name ?? '' },
    } as ChangeEvent<HTMLSelectElement>);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${control} flex items-center justify-between gap-2 text-left ${className}`}
      >
        <span className="min-w-0 truncate">{selected?.label || 'Seçin'}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-(--muted) transition ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6.5 8 10.5 12 6.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                maxHeight: pos.maxHeight,
              }}
              className="fixed z-50 overflow-y-auto rounded-xl border border-[rgba(247,243,240,0.14)] bg-[#2a1b14] py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
            >
              {options.map((o) => {
                const active = o.value === current;
                return (
                  <button
                    key={o.value || o.label}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => pick(o.value)}
                    className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? 'bg-(--brand) font-medium text-[#f7f3f0]'
                        : 'text-[#f7f3f0] hover:bg-white/8'
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`min-h-24 w-full rounded-lg border border-(--border) bg-black/25 px-3 py-2.5 text-sm text-[#f7f3f0] outline-none placeholder:text-(--muted) focus:border-(--brand-soft) ${className}`}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5 text-sm">
      <span className="font-medium text-[#f7f3f0]">{label}</span>
      {hint ? <span className="text-xs leading-snug text-(--muted)">{hint}</span> : null}
      {children}
    </div>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-[#f7f3f0]">
      <span className="relative inline-flex h-5 w-5 shrink-0">
        <input
          type="checkbox"
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-5 w-5 rounded-md border border-(--border) bg-black/30 peer-focus-visible:ring-2 peer-focus-visible:ring-(--brand-soft) peer-checked:border-(--brand) peer-checked:bg-(--brand)" />
        <svg
          className="pointer-events-none absolute inset-0 m-auto hidden h-3.5 w-3.5 text-[#f7f3f0] peer-checked:block"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
      {label}
    </label>
  );
}

export function Radio({
  label,
  name,
  value,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-[#f7f3f0]">
      <span className="relative inline-flex h-5 w-5 shrink-0">
        <input
          type="radio"
          name={name}
          value={value}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
          checked={checked}
          onChange={() => onChange(value)}
        />
        <span className="h-5 w-5 rounded-full border border-(--border) bg-black/30 peer-checked:border-(--brand)" />
        <span className="pointer-events-none absolute inset-1.25 hidden rounded-full bg-(--brand) peer-checked:block" />
      </span>
      {label}
    </label>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-end gap-3">{children}</div>;
}

export function Pagination({
  page,
  pages,
  total,
  limit,
  onPage,
  onLimit,
}: {
  page: number;
  pages: number;
  total: number;
  limit?: number;
  onPage: (p: number) => void;
  onLimit?: (n: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * (limit ?? 20) + 1;
  const to = Math.min(page * (limit ?? 20), total);
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-(--muted)">
      <span>
        {from}–{to} / {total} kayıt
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {onLimit ? (
          <Select
            className="h-11 w-28"
            value={String(limit ?? 20)}
            onChange={(e) => onLimit(Number(e.target.value))}
          >
            <option value="10">10 / sayfa</option>
            <option value="20">20 / sayfa</option>
            <option value="50">50 / sayfa</option>
          </Select>
        ) : null}
        <Button variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Önceki
        </Button>
        <span className="grid h-11 place-items-center px-2">
          {page} / {Math.max(1, pages)}
        </span>
        <Button variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Sonraki
        </Button>
      </div>
    </div>
  );
}

export function rowClass(selected?: boolean) {
  return selected
    ? 'bg-[rgba(106,63,42,0.42)] shadow-[inset_3px_0_0_var(--brand-soft)]'
    : 'hover:bg-white/[0.04]';
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-(--border) bg-(--card)">
      <table className="w-full min-w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th className="border-b border-(--border) px-4 py-3 text-xs font-medium tracking-[0.12em] text-(--muted) uppercase">
      {children}
    </th>
  );
}

export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`border-b border-(--border) px-4 py-3 ${className}`}>{children}</td>;
}

export function EmptyState({ text }: { text: string }) {
  return <p className="px-4 py-10 text-center text-sm text-(--muted)">{text}</p>;
}

export function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-(--muted) select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition ${
          checked ? 'bg-(--brand)' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#f7f3f0] shadow transition-all ${
            checked ? 'left-4.5' : 'left-0.5'
          }`}
        />
      </button>
      <span>{label}</span>
    </label>
  );
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function Drawer({
  open,
  title,
  onClose,
  children,
  size = 'md',
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'xl';
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 grid place-items-end bg-black/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
      onClick={onClose}
    >
      <motion.aside
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-(--border) bg-(--surface-2) p-5 shadow-2xl sm:rounded-2xl sm:p-6 ${
          size === 'xl' ? 'max-w-3xl' : 'max-w-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button variant="ghost" className="h-9 px-3" onClick={onClose}>
            Kapat
          </Button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">{children}</div>
      </motion.aside>
    </div>
  );
}
