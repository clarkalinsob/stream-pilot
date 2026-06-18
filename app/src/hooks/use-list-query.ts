'use client';

import { useMemo } from 'react';
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
  const { page, setPage, limit } = usePagination(options.defaultLimit);
  const sortState = useTableSort({
    defaultSort: options.defaultSort,
    defaultOrder: options.defaultOrder,
  });
  const searchState = useTableSearch();
  const { sort, order } = sortState;
  const { search } = searchState;

  const queryParams = useMemo(
    (): ListQueryParams => ({
      page,
      limit,
      ...(search ? { search } : {}),
      ...(sort ? { sort, order } : {}),
    }),
    [page, limit, search, sort, order],
  );

  return {
    page,
    setPage,
    limit,
    ...sortState,
    ...searchState,
    queryParams,
  };
}
