'use client';

import { useEffect, useRef } from 'react';

export function useDeepLinkId(
  handler: (id: number) => boolean | void | Promise<boolean | void>,
  extraKey = '',
) {
  const fn = useRef(handler);
  fn.current = handler;
  const done = useRef(0);

  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get('id') || 0);
    if (!id || done.current === id) return;
    void Promise.resolve(fn.current(id)).then((ok) => {
      if (ok !== false) done.current = id;
    });
  }, [extraKey]);

  useEffect(() => {
    const onCustom = (e: Event) => {
      const id = Number((e as CustomEvent).detail?.id || 0);
      done.current = 0;
      if (id) {
        void Promise.resolve(fn.current(id)).then((ok) => {
          if (ok !== false) done.current = id;
        });
      }
    };
    window.addEventListener('pawmatch:deeplink', onCustom);
    return () => window.removeEventListener('pawmatch:deeplink', onCustom);
  }, []);
}
