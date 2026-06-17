import {
  Clapperboard,
  LayoutDashboard,
  ListChecks,
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
  { title: 'Run Sheets', href: '/run-sheets', icon: ListChecks },
  { title: 'Resources', href: '/resources', icon: Users },
];

export function getPageTitle(pathname: string): string {
  const item = mainNavItems.find(
    (nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`),
  );
  return item?.title ?? 'Stream Pilot';
}
