/**
 * ANCHOR: SEARCH_RESULTS_LOADING
 * PURPOSE: Skeleton UI пока результаты поиска загружаются.
 *
 * @PreConditions:
 * - React Suspense boundary wraps SearchResultsList
 *
 * @PostConditions:
 * - Показывает 6 skeleton cards в grid
 * - Фильтры уже отображены (скелетон только для результатов)
 *
 * @Invariants:
 * - Не показывает контент — только placeholder
 * - Высота skeleton карточки ~300px
 *
 * @SideEffects: нет
 */

// [START SEARCH_RESULTS_LOADING]

export default function SearchResultsLoading() {
  console.log('[search][SearchResultsLoading][SEARCH_RESULTS_LOADING][RENDER]');

  return (
    <>
      <p className="text-muted-foreground mb-4">Загрузка...</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
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
// [END SEARCH_RESULTS_LOADING]
