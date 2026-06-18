'use client';

import { useMemo } from 'react';
import { usePagination } from '@/hooks/use-pagination';
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
  const { sort, order } = sortState;

  const queryParams = useMemo(
    (): ListQueryParams => ({
      page,
      limit,
      ...(sort ? { sort, order } : {}),
    }),
    [page, limit, sort, order],
  );

  return {
    page,
    setPage,
    limit,
    ...sortState,
    queryParams,
  };
}
