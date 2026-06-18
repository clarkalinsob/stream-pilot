import { describe, expect, it } from 'vitest';
import {
  buildListQueryString,
  getEffectiveSort,
  listQueryKey,
  resolveListQuery,
} from '@/lib/list-query';

describe('buildListQueryString', () => {
  it('builds pagination params', () => {
    expect(buildListQueryString({ page: 2, limit: 20 })).toBe('page=2&limit=20');
  });

  it('includes sort and order when sort is set', () => {
    expect(
      buildListQueryString({ page: 1, limit: 10, sort: 'name', order: 'desc' }),
    ).toBe('page=1&limit=10&sort=name&order=desc');
  });

  it('includes search when provided', () => {
    expect(
      buildListQueryString({ page: 1, limit: 10, search: ' morning ' }),
    ).toBe('page=1&limit=10&search=morning');
  });
});

describe('resolveListQuery', () => {
  it('does not carry over search when omitted from the next request', () => {
    const previous = resolveListQuery({
      page: 1,
      limit: 10,
      search: 'aldrin',
      sort: 'name',
      order: 'asc',
    });

    expect(
      resolveListQuery({ page: 1, limit: 10, sort: 'name', order: 'asc' }, previous),
    ).toEqual({
      page: 1,
      limit: 10,
      sort: 'name',
      order: 'asc',
    });
  });

  it('includes search when provided', () => {
    expect(resolveListQuery({ page: 1, limit: 10, search: ' aldrin ' })).toEqual({
      page: 1,
      limit: 10,
      search: 'aldrin',
    });
  });

  it('builds stable list query keys', () => {
    expect(listQueryKey({ page: 1, limit: 10 })).toBe(
      listQueryKey({ page: 1, limit: 10 }),
    );
    expect(listQueryKey({ page: 1, limit: 10, search: 'atem' })).not.toBe(
      listQueryKey({ page: 1, limit: 10 }),
    );
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
