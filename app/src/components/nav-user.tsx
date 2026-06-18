'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useSingleFlight } from '@/hooks/use-single-flight';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types/user';

function getInitials(user: User) {
  return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
}

function getDisplayName(user: User) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function NavUser() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const logout = useAuthStore((s) => s.logout);
  const authBusy = useAuthStore((s) => s.isLoading);
  const { isMobile } = useSidebar();

  const logoutImpl = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  const { run: runLogout, isPending } = useSingleFlight(logoutImpl);
  const isBusy = isPending || authBusy;

  const displayName = user ? getDisplayName(user) : 'Account';
  const initials = user ? getInitials(user) : '?';
  const email = user?.email ?? (isLoading ? 'Loading…' : 'Not signed in');

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            {user ? (
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{displayName}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            ) : null}
            {user ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              disabled={isBusy}
              onClick={() => void runLogout()}
            >
              <LogOut />
              {isBusy ? 'Logging out…' : 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
