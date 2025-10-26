'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';

export function usePageParam(defaultPage = 1) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = useMemo(() => {
    const p = Number(searchParams.get('page') || defaultPage);
    return Number.isFinite(p) && p > 0 ? p : defaultPage;
  }, [searchParams, defaultPage]);

  const setPage = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set('page', String(next));
      router.replace(`${pathname}?${params.toString()}`);
      // optional: scroll to top
      if (typeof window !== 'undefined')
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router, pathname, searchParams]
  );

  return { page, setPage };
}
