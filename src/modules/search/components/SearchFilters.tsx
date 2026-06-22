/**
 * ANCHOR: SEARCH_FILTERS_CONTAINER
 * PURPOSE: Контейнер фильтров — переключает DesktopFilters ↔ MobileFilters по breakpoint.
 *
 * @PreConditions:
 * - DesktopFilters imported from '@/modules/search/components/DesktopFilters'
 * - MobileFilters imported from '@/modules/search/components/MobileFilters'
 * - lg breakpoint = 1024px
 *
 * @PostConditions:
 * - Desktop (lg+): DesktopFilters в sticky sidebar (aside), MobileFilters hidden
 * - Mobile (<lg): MobileFilters button visible (без wrapper), DesktopFilters hidden
 * - FiltersContent reused from обоих компонентов
 *
 * @LayoutContract:
 * - Desktop: <aside className="sticky top-6 self-start w-[280px] min-w-[280px]">DesktopFilters</aside>
 * - Mobile: <MobileFilters /> без wrapper
 *
 * @DelegatedToChildren:
 * - Filter state management (useSearchFilters hook) → DesktopFilters / MobileFilters
 * - URL sync (router.push) → DesktopFilters / MobileFilters
 * - Debounce logic → DesktopFilters / MobileFilters
 *
 * @SideEffects: нет
 */

// [START SEARCH_FILTERS_CONTAINER]
import { DesktopFilters } from './DesktopFilters';
import { MobileFilters } from './MobileFilters';

export function SearchFilters() {
  console.log('[search][SearchFilters][SEARCH_FILTERS_CONTAINER][RENDER]');

  return (
    <>
      <aside className="sticky top-6 self-start w-[280px] min-w-[280px] hidden lg:block">
        <DesktopFilters />
      </aside>
      <div className="lg:hidden">
        <MobileFilters />
      </div>
    </>
  );
}
// [END SEARCH_FILTERS_CONTAINER]
