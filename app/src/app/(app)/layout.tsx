import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar className="print:hidden" />
      <SidebarInset className="flex h-svh min-h-0 flex-col overflow-hidden print:m-0 print:min-h-0 print:rounded-none print:shadow-none">
        <AppHeader />
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 print:gap-0 print:p-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
