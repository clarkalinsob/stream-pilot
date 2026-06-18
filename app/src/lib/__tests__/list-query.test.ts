import { describe, expect, it } from 'vitest';
import { buildListQueryString, getEffectiveSort } from '@/lib/list-query';

describe('buildListQueryString', () => {
  it('builds pagination params', () => {
    expect(buildListQueryString({ page: 2, limit: 20 })).toBe('page=2&limit=20');
  });

  it('includes sort and order when sort is set', () => {
    expect(
      buildListQueryString({ page: 1, limit: 10, sort: 'name', order: 'desc' }),
    ).toBe('page=1&limit=10&sort=name&order=desc');
  });
});

describe('getEffectiveSort', () => {
  it('falls back to defaults when URL sort is missing', () => {
    expect(
      getEffectiveSort({
        defaultSort: 'eventDate',
        defaultOrder: 'desc',
      }),
    ).toEqual({ sort: 'eventDate', order: 'desc' });
  });

  it('uses URL sort when present', () => {
    expect(
      getEffectiveSort({
        sort: 'title',
        order: 'asc',
        defaultSort: 'eventDate',
        defaultOrder: 'desc',
      }),
    ).toEqual({ sort: 'title', order: 'asc' });
  });
});
