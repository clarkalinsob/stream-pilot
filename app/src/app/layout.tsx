import type { Metadata } from 'next';
import { AuthInitializer } from '@/components/auth/auth-initializer';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stream Pilot',
  description: 'Stream Pilot application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthInitializer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
