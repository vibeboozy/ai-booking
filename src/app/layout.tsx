import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';

import '@/app/globals.css';
import { Footer } from '@/shared/ui/footer';
import { Header } from '@/shared/ui/header';

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

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

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
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
