/**
 * ANCHOR: SEARCH_PAGE_LOADING
 * PURPOSE: Skeleton UI пока SearchPage загружается.
 *
 * @PreConditions:
 * - React Suspense boundary wraps the search page
 *
 * @PostConditions:
 * - Показывает 6-9 skeleton cards в grid
 * - Соответствует размеру реальных ListingCard
 *
 * @Invariants:
 * - Не показывает контент — только placeholder
 * - Высота skeleton карточки ~300px
 *
 * @SideEffects: нет
 */

// [START SEARCH_PAGE_LOADING]

export default function SearchPageLoading() {
  console.log('[search][SearchPageLoading][SEARCH_PAGE_LOADING][RENDER]');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="h-16 bg-muted/20 rounded-lg mb-6 animate-pulse" />
      <p className="text-muted-foreground mb-4">Загрузка...</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border bg-card">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
// [END SEARCH_PAGE_LOADING]