/**
 * ANCHOR: shared
 * PURPOSE: Site header — logo, nav, auth controls.
 * Dependencies: @/lib/auth, @/shared/ui.
 */

import Link from 'next/link';

import { auth } from '@/lib/auth';
import { Button } from '@/shared/ui/button';
import { signOutAction } from '@/shared/actions/auth';

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-primary"
        >
          <span aria-hidden>✦</span>
          TripVibe
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/search"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Поиск
          </Link>
          {session?.user && (
            <Link
              href="/profile"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Профиль
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Выйти
                </Button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
