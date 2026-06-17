import {
  Clapperboard,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Productions', href: '/productions', icon: Clapperboard },
  { title: 'Resources', href: '/resources', icon: Users },
];

export function getPageTitle(pathname: string): string {
  if (pathname === '/productions/new') return 'New Production';
  if (pathname.match(/^\/productions\/[^/]+$/)) return 'Production';
  const item = mainNavItems.find(
    (nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`),
  );
  return item?.title ?? 'Stream Pilot';
}

export type BreadcrumbSegment = {
  label: string;
  href?: string;
};

export function getBreadcrumbs(
  pathname: string,
  options?: { productionTitle?: string | null },
): BreadcrumbSegment[] {
  if (pathname === '/productions/new') {
    return [
      { label: 'Productions', href: '/productions' },
      { label: 'New' },
    ];
  }
  if (pathname.match(/^\/productions\/[^/]+$/) && pathname !== '/productions/new') {
    const segments: BreadcrumbSegment[] = [
      { label: 'Productions', href: '/productions' },
    ];
    if (options?.productionTitle) {
      segments.push({ label: options.productionTitle });
    }
    return segments;
  }
  const title = getPageTitle(pathname);
  return [{ label: title }];
}
