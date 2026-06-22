/**
 * ANCHOR: shared
 * PURPOSE: Site footer — links and copyright.
 */

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} TripVibe — бронирование без трения</p>
        <nav className="flex gap-4">
          <Link href="/login" className="hover:text-foreground">
            Вход
          </Link>
        </nav>
      </div>
    </footer>
  );
}
