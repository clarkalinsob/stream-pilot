export type SortOrder = 'asc' | 'desc';

export type ListQueryParams = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
  search?: string;
};

export function resolveListQuery(
  params: ListQueryParams = {},
  defaults: ListQueryParams = { page: 1, limit: 10 },
): Required<Pick<ListQueryParams, 'page' | 'limit'>> &
  Pick<ListQueryParams, 'sort' | 'order' | 'search'> {
  const query: Required<Pick<ListQueryParams, 'page' | 'limit'>> &
    Pick<ListQueryParams, 'sort' | 'order' | 'search'> = {
    page: params.page ?? defaults.page ?? 1,
    limit: params.limit ?? defaults.limit ?? 10,
  };

  const search = params.search?.trim();
  if (search) {
    query.search = search;
  }

  if (params.sort) {
    query.sort = params.sort;
    query.order = params.order ?? 'asc';
  }

  return query;
}

export function listQueryKey(params: ListQueryParams): string {
  return JSON.stringify(resolveListQuery(params));
}

export function buildListQueryString({
  page = 1,
  limit = 10,
  sort,
  order,
  search,
}: ListQueryParams = {}): string {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search?.trim()) {
    params.set('search', search.trim());
  }

  if (sort) {
    params.set('sort', sort);
    if (order) {
      params.set('order', order);
    }
  }

  return params.toString();
}

export function getEffectiveSort({
  sort,
  order = 'asc',
  defaultSort,
  defaultOrder = 'asc',
}: {
  sort?: string;
  order?: SortOrder;
  defaultSort?: string;
  defaultOrder?: SortOrder;
}) {
  return {
    sort: sort ?? defaultSort,
    order: sort ? order : defaultOrder,
  };
}
