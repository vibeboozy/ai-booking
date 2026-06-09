import type { Metadata } from 'next';
import '@/app/globals.css';

/**
 * ANCHOR: shared
 * PURPOSE: Root layout — header, footer, auth nav, design tokens.
 * Dependencies: @/lib/auth (session), shared UI.
 * CRITICAL: Единый visual language для всех модулей.
 *
 * DO:
 * - Server Component layout
 * DONT:
 * - Module-specific logic in root layout
 */

export const metadata: Metadata = {
  title: 'TripVibe',
  description: 'Бронирование жилья для поколения Z',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
