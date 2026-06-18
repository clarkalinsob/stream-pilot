'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { usePagination } from '@/hooks/use-pagination';
import { useTableSearch } from '@/hooks/use-table-search';
import { useTableSort } from '@/hooks/use-table-sort';
import type { ListQueryParams, SortOrder } from '@/lib/list-query';

type UseListQueryOptions = {
  defaultLimit?: number;
  defaultSort?: string;
  defaultOrder?: SortOrder;
};

export function useListQuery(options: UseListQueryOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, setPage, limit } = usePagination(options.defaultLimit);
  const sortState = useTableSort({
    defaultSort: options.defaultSort,
    defaultOrder: options.defaultOrder,
  });
  const searchState = useTableSearch();
  const { sort, order } = sortState;
  const { search, setInputValue } = searchState;

  const queryParams = useMemo(
    (): ListQueryParams => ({
      page,
      limit,
      ...(search ? { search } : {}),
      ...(sort ? { sort, order } : {}),
    }),
    [page, limit, search, sort, order],
  );

  const freshQueryParams = useMemo(
    (): ListQueryParams => ({
      page: 1,
      limit,
    }),
    [limit],
  );

  const resetFilters = useCallback(() => {
    setInputValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('sort');
    params.delete('order');
    params.delete('page');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams, setInputValue]);

  return {
    page,
    setPage,
    limit,
    ...sortState,
    ...searchState,
    queryParams,
    freshQueryParams,
    resetFilters,
  };
}
