import type { Metadata } from 'next';
import { AuthInitializer } from '@/components/auth/auth-initializer';
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
    <html lang="en">
      <body className="min-h-screen">
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
