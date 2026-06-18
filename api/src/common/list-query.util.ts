export type SortOrder = 'asc' | 'desc';

export function resolveOrderBy<T extends string>(
  sort: T | undefined,
  order: SortOrder | undefined,
  allowed: readonly T[],
  defaultOrderBy: Array<Record<string, unknown>>,
  custom?: (
    sort: T,
    order: SortOrder,
  ) => Array<Record<string, unknown>> | undefined,
): Array<Record<string, unknown>> {
  if (sort && allowed.includes(sort)) {
    const direction = order ?? 'asc';
    const customOrder = custom?.(sort, direction);
    if (customOrder) {
      return customOrder;
    }
    return [{ [sort]: direction }];
  }

  return defaultOrderBy;
}

export function buildTextSearchFilter(
  search: string | undefined,
  fields: readonly string[],
): { OR: Array<Record<string, { contains: string; mode: 'insensitive' }>> } | undefined {
  const term = search?.trim();
  if (!term) {
    return undefined;
  }

  return {
    OR: fields.map((field) => ({
      [field]: { contains: term, mode: 'insensitive' as const },
    })),
  };
}
