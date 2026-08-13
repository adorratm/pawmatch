'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type ConfirmOpts = {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
};

type ConfirmState = ConfirmOpts & {
  resolve: (ok: boolean) => void;
};

type ConfirmCtx = {
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
};

const Ctx = createContext<ConfirmCtx | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((opts: ConfirmOpts) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  const close = (ok: boolean) => {
    state?.resolve(ok);
    setState(null);
  };

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <AnimatePresence>
        {state ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => close(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md rounded-2xl border border-(--border) bg-(--surface-2) p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold tracking-tight">{state.title}</h2>
              {state.description ? (
                <p className="mt-2 text-sm leading-relaxed text-(--muted)">{state.description}</p>
              ) : null}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-(--border) px-4 py-2 text-sm hover:bg-white/5"
                  onClick={() => close(false)}
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    state.danger
                      ? 'bg-(--danger) hover:brightness-110'
                      : 'bg-(--brand) hover:bg-(--brand-light)'
                  }`}
                  onClick={() => close(true)}
                >
                  {state.confirmLabel ?? 'Onayla'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
