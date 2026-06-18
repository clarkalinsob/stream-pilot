import { describe, expect, it } from 'vitest';
import { getBreadcrumbs, getPageTitle } from '@/lib/navigation';

describe('getPageTitle', () => {
  it('returns titles for main nav routes', () => {
    expect(getPageTitle('/dashboard')).toBe('Dashboard');
    expect(getPageTitle('/productions')).toBe('Productions');
    expect(getPageTitle('/resources')).toBe('Resources');
    expect(getPageTitle('/notifications')).toBe('Notifications');
  });

  it('returns New Production for the wizard route', () => {
    expect(getPageTitle('/productions/new')).toBe('New Production');
  });

  it('returns Production for detail routes', () => {
    expect(getPageTitle('/productions/abc-123')).toBe('Production');
  });

  it('falls back to app name for unknown routes', () => {
    expect(getPageTitle('/unknown')).toBe('Stream Pilot');
  });
});

describe('getBreadcrumbs', () => {
  it('returns a single segment for top-level pages', () => {
    expect(getBreadcrumbs('/dashboard')).toEqual([{ label: 'Dashboard' }]);
    expect(getBreadcrumbs('/resources')).toEqual([{ label: 'Resources' }]);
  });

  it('returns nested breadcrumbs for new production', () => {
    expect(getBreadcrumbs('/productions/new')).toEqual([
      { label: 'Productions', href: '/productions' },
      { label: 'New' },
    ]);
  });

  it('includes production title on detail pages when provided', () => {
    expect(
      getBreadcrumbs('/productions/abc-123', {
        productionTitle: 'Morning Show',
      }),
    ).toEqual([
      { label: 'Productions', href: '/productions' },
      { label: 'Morning Show' },
    ]);
  });

  it('omits production title segment when not provided', () => {
    expect(getBreadcrumbs('/productions/abc-123')).toEqual([
      { label: 'Productions', href: '/productions' },
    ]);
  });
});
