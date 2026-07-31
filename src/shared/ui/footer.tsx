/**
 * ANCHOR: shared
 * PURPOSE: Site footer — links and copyright.
 */

import { auth } from '@/lib/auth';
import Link from 'next/link';
import { URL } from '@/shared/constants/urls';

export async function Footer() {
  const session = await auth();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} TripVibe — бронирование без трения</p>
        <nav className="flex gap-4">
          {!session?.user && (
            <Link href={URL.LOGIN} className="hover:text-foreground">
              Вход
            </Link>
          )}
        </nav>
      </div>
    </footer>
  );
}
