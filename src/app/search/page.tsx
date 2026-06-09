/**
 * ANCHOR: search
 * PURPOSE: Route /search — результаты поиска + SearchFilters.
 * Dependencies: search.repository, SearchFilters, ListingCard.
 * CRITICAL: SSR initial load; filters via URL params.
 *
 * DO:
 * - parseSearchParams from page searchParams prop
 * DONT:
 * - Client-only fetch without SSR fallback
 */

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage(_props: SearchPageProps) {
  return (
    <main>
      <h1>Результаты поиска</h1>
      {/* TODO: SearchFilters + ListingCard grid */}
    </main>
  );
}
