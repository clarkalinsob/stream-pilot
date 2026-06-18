export type SortOrder = 'asc' | 'desc';

export type ListQueryParams = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
};

export function buildListQueryString({
  page = 1,
  limit = 10,
  sort,
  order,
}: ListQueryParams = {}): string {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

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
