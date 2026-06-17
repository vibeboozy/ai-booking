/**
 * ANCHOR: SEARCH_PAGE
 * PURPOSE: SSR страница результатов поиска с фильтрами.
 *
 * @PreConditions:
 * - searchParams: Promise<Record<string, string | string[] | undefined>> from Next.js 15
 * - parseSearchParams imported from '@/shared/utils/parseSearchParams'
 * - searchListings imported from '@/modules/search/search.repository'
 * - SearchFilters imported from '@/modules/search/components/SearchFilters'
 * - ListingCard imported from '@/modules/search/components/ListingCard' (or graceful fallback)
 *
 * @PostConditions:
 * - SSR: first paint has listings data (no loading spinner for initial load)
 * - При listings.length === 0: empty state component
 * - При listings.length > 0: grid of ListingCard
 * - SearchFilters visible above results
 *
 * @Invariants:
 * - Server Component (no 'use client')
 * - parseSearchParams called with await searchParams
 * - searchListings called on server
 * - ListingCard receives listing: ListingPreview
 *
 * @SideEffects: нет (pure SSR)
 *
 * @UrlContract:
 * - ?city=...&checkIn=...&checkOut=...&guests=...&priceMin=...&priceMax=...&propertyType=...&amenities=...&page=...
 */

// [START SEARCH_PAGE]
import type { Metadata } from 'next';
import { parseSearchParams } from '@/shared/utils/parseSearchParams';
import { searchListings } from '@/modules/search/search.repository';
import { SearchFilters } from '@/modules/search/components/SearchFilters';
import { ListingCard } from '@/modules/search/components/ListingCard';
import type { ListingPreview } from '@/shared/types/listing';
import { Suspense } from 'react';
import { SearchPageLoading } from './loading';

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(_props: SearchPageProps): Promise<Metadata> {
  return {
    title: 'Поиск жилья — TripVibe',
    description: 'Найдите идеальное жильё для вашего путешествия',
  };
}

async function SearchResults(props: { params: Awaited<SearchPageProps['searchParams']> }) {
  console.log('[search][SearchPage][SEARCH_PAGE][ENTRY]', {
    params: props.params,
  });

  const filters = parseSearchParams(props.params);

  console.log('[search][SearchPage][SEARCH_PAGE][DECISION]', {
    decision: 'call_search_listings',
    filters,
  });

  const result = await searchListings(filters);

  console.log('[search][SearchPage][SEARCH_PAGE][EXIT]', {
    result: 'success',
    listings_count: result.data.length,
    meta: result.meta,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <SearchFilters />
      <div className="mt-6">
        <p className="text-muted-foreground mb-4">
          Найдено {result.meta.total} вариантов
        </p>

        {result.data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.data.map((listing: ListingPreview) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">🏠</div>
      <h2 className="text-2xl font-semibold mb-2">Ничего не найдено</h2>
      <p className="text-muted-foreground mb-6">
        Попробуйте изменить параметры поиска
      </p>
      <a
        href="/search"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Сбросить фильтры
      </a>
    </div>
  );
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;

  console.log('[search][SearchPage][RENDER]', {
    hasSearchParams: Object.keys(searchParams).length > 0,
  });

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<SearchPageLoading />}>
        <SearchResults params={searchParams} />
      </Suspense>
    </main>
  );
}
// [END SEARCH_PAGE]