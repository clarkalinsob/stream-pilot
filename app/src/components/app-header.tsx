'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeaderNotifications } from '@/components/header-notifications';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getBreadcrumbs } from '@/lib/navigation';
import { useProductionsStore } from '@/stores/productions-store';

export function AppHeader() {
  const pathname = usePathname();
  const current = useProductionsStore((state) => state.current);

  const productionId = pathname.match(/^\/productions\/([^/]+)$/)?.[1];
  const productionTitle =
    productionId &&
    productionId !== 'new' &&
    current?.id === productionId
      ? current.title
      : null;

  const segments = getBreadcrumbs(pathname, { productionTitle });

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b bg-background px-4 py-3 print:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              return (
                <span key={`${segment.label}-${index}`} className="contents">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast || !segment.href ? (
                      <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={segment.href}>{segment.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <HeaderNotifications />
      </div>
    </header>
  );
}
