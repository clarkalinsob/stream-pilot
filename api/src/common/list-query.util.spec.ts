import { resolveOrderBy, buildTextSearchFilter } from './list-query.util';

describe('resolveOrderBy', () => {
  const allowed = ['name', 'role'] as const;
  const defaultOrderBy = [{ name: 'asc' }, { updatedAt: 'desc' }];

  it('returns default order when sort is missing', () => {
    expect(resolveOrderBy(undefined, undefined, allowed, defaultOrderBy)).toEqual(
      defaultOrderBy,
    );
  });

  it('returns default order when sort is not allowed', () => {
    expect(resolveOrderBy('email', 'asc', allowed, defaultOrderBy)).toEqual(
      defaultOrderBy,
    );
  });

  it('returns order for an allowed sort field', () => {
    expect(resolveOrderBy('role', 'desc', allowed, defaultOrderBy)).toEqual([
      { role: 'desc' },
    ]);
  });

  it('uses custom order builder when provided', () => {
    expect(
      resolveOrderBy('name', 'asc', allowed, defaultOrderBy, (sort, order) => {
        if (sort === 'name') {
          return [{ name: order }, { updatedAt: 'desc' }];
        }
        return undefined;
      }),
    ).toEqual([{ name: 'asc' }, { updatedAt: 'desc' }]);
  });
});

describe('buildTextSearchFilter', () => {
  it('returns undefined for blank search', () => {
    expect(buildTextSearchFilter('   ', ['name'])).toBeUndefined();
  });

  it('builds OR filters for searchable fields', () => {
    expect(buildTextSearchFilter('alex', ['name', 'email'])).toEqual({
      OR: [
        { name: { contains: 'alex', mode: 'insensitive' } },
        { email: { contains: 'alex', mode: 'insensitive' } },
      ],
    });
  });
});
