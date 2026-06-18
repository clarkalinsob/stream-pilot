'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { SortOrder } from '@/lib/list-query';

type UseTableSortOptions = {
  defaultSort?: string;
  defaultOrder?: SortOrder;
};

export function useTableSort(options: UseTableSortOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = searchParams.get('sort') ?? undefined;
  const order = (searchParams.get('order') as SortOrder | null) ?? 'asc';

  const updateSearchParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete('page');
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const setSort = useCallback(
    (column: string) => {
      updateSearchParams((params) => {
        const currentSort = params.get('sort') ?? undefined;
        const currentOrder = (params.get('order') as SortOrder | null) ?? 'asc';

        if (currentSort === column && currentOrder === 'asc') {
          params.set('sort', column);
          params.set('order', 'desc');
          return;
        }

        if (currentSort === column && currentOrder === 'desc') {
          params.delete('sort');
          params.delete('order');
          return;
        }

        params.set('sort', column);
        params.set('order', 'asc');
      });
    },
    [updateSearchParams],
  );

  const clearSort = useCallback(() => {
    updateSearchParams((params) => {
      params.delete('sort');
      params.delete('order');
    });
  }, [updateSearchParams]);

  return {
    sort,
    order,
    defaultSort: options.defaultSort,
    defaultOrder: options.defaultOrder ?? 'asc',
    setSort,
    clearSort,
    sortParams: sort ? ({ sort, order } as const) : {},
  };
}
