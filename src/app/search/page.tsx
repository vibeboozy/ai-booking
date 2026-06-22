/**
 * ANCHOR: SEARCH_PAGE_LAYOUT
 * PURPOSE: 2-колоночный layout: sidebar с фильтрами слева, результаты справа (desktop ≥lg).
 *
 * @PreConditions:
 * - searchParams: Promise<Record<string, string | string[] | undefined>> from Next.js 15
 * - parseSearchParams imported from '@/shared/utils/parseSearchParams'
 * - searchListings imported from '@/modules/search/search.repository'
 * - SearchFilters imported from '@/modules/search/components/SearchFilters'
 * - ListingCard imported from '@/modules/search/components/ListingCard'
 * - result.data contains ListingPreview[]
 *
 * @PostConditions:
 * - Desktop (lg+): 2-колоночный grid: [280px sidebar] [flex-1 results]
 * - Mobile (<lg): вертикальный stack, SearchFilters handles visibility
 * - Filters always visible on desktop (do not require scroll)
 * - SSR: first paint has filters, results load asynchronously
 *
 * @LayoutContract:
 * - lg (1024px): sidebar width 280px fixed, gap-6 между sidebar и results
 * - <lg: MobileFilters button visible, filters in drawer
 * - Sidebar: sticky (handled by SearchFilters component)
 *
 * @SideEffects: нет (pure SSR)
 *
 * @UrlContract:
 * - ?city=...&checkIn=...&checkOut=...&guests=...&priceMin=...&priceMax=...&propertyType=...&amenities=...&page=...
 */

// [START SEARCH_PAGE_LAYOUT]
import type { Metadata } from 'next';
import { parseSearchParams } from '@/shared/utils/parseSearchParams';
import { searchListings } from '@/modules/search/search.repository';
import { SearchFilters } from '@/modules/search/components/SearchFilters';
import { ListingCard } from '@/modules/search/components/ListingCard';
import { Pagination } from '@/modules/search/components/Pagination';
import type { ListingPreview } from '@/shared/types/listing';
import { Suspense } from 'react';
import SearchPageLoading from './loading';
import SearchResultsLoading from './SearchResultsLoading';

function SearchResultsCount({ total }: { total: number }) {
  return (
    <p className="text-muted-foreground mb-4">Найдено {total} вариантов</p>
  );
}

async function SearchResultsList(props: {
  filters: Awaited<ReturnType<typeof parseSearchParams>>;
}) {
  const result = await searchListings(props.filters);

  console.log('[search][SearchResultsList][SEARCH_PAGE_LAYOUT][EXIT]', {
    result: 'success',
    listings_count: result.data.length,
    meta: result.meta,
  });

  return (
    <>
      <SearchResultsCount total={result.meta.total} />
      {result.data.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.data.map((listing: ListingPreview) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Pagination meta={result.meta} />
        </>
      )}
    </>
  );
}

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(
  _props: SearchPageProps,
): Promise<Metadata> {
  return {
    title: 'Поиск жилья — TripVibe',
    description: 'Найдите идеальное жильё для вашего путешествия',
  };
}

function SearchResults(props: {
  params: Awaited<SearchPageProps['searchParams']>;
}) {
  console.log('[search][SearchResults][SEARCH_PAGE_LAYOUT][ENTRY]', {
    params: props.params,
  });

  const filters = parseSearchParams(props.params);

  console.log('[search][SearchResults][SEARCH_PAGE_LAYOUT][DECISION]', {
    decision: 'will_render_filters_immediately_load_results_async',
    filters,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <SearchFilters />
        <main>
          <Suspense fallback={<SearchResultsLoading />}>
            <SearchResultsList filters={filters} />
          </Suspense>
        </main>
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

  console.log('[search][SearchPage][SEARCH_PAGE_LAYOUT][RENDER]', {
    hasSearchParams: Object.keys(searchParams).length > 0,
  });

  return (
    <main className="min-h-screen bg-background">
      <SearchResults params={searchParams} />
    </main>
  );
}
// [END SEARCH_PAGE_LAYOUT]
