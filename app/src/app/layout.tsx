import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stream Pilot',
  description: 'Stream Pilot Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
