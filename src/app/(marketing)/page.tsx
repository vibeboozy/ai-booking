/**
 * ANCHOR: search
 * PURPOSE: Route / — главная страница с SearchBar.
 * Dependencies: @/modules/search (SearchBar).
 * CRITICAL: SSR; form submit navigates to /search with URL params.
 *
 * DO:
 * - Compose SearchBar from search module
 * DONT:
 * - Implement search logic inline in page
 */

import { SearchBar } from '@/modules/search';

export default function HomePage() {
  return (
    <main className="container py-16">
      <section className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
          Бронирование для поколения Z
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          TripVibe
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Скорость, прозрачные цены и UX без трения.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-4xl">
        <SearchBar />
      </section>

      <section className="mx-auto mt-16 max-w-2xl text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-muted"
          >
            Войти
          </a>
        </div>
      </section>
    </main>
  );
}
