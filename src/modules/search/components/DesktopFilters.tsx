/**
 * ANCHOR: DESKTOP_FILTERS_SIDEBAR
 * PURPOSE: Sidebar-версия фильтров для desktop layout.
 *
 * @PreConditions:
 * - FiltersContent импортирован из '@/modules/search/components/FiltersContent'
 * - useSearchFilters hook доступен
 *
 * @PostConditions:
 * - Рендерит FiltersContent в sidebar wrapper
 * - Wrapper: w-[280px] min-w-[280px], sticky, top-6, self-start
 * - Содержимое: FiltersContent с вертикальным spacing
 *
 * @Invariants:
 * - visible только на lg+ (родительский aside с hidden lg:block скрывает)
 * - Не меняет логику FiltersContent
 *
 * @SideEffects: нет
 */

// [START DESKTOP_FILTERS_SIDEBAR]
'use client';

import { useSearchFilters } from '@/modules/search/hooks/useSearchFilters';
import { FiltersContent } from './FiltersContent';

export function DesktopFilters() {
  console.log('[search][DesktopFilters][DESKTOP_FILTERS_SIDEBAR][ENTRY]');

  const { params, setParams, resetFilters } = useSearchFilters();

  console.log('[search][DesktopFilters][DESKTOP_FILTERS_SIDEBAR][EXIT]', {
    result: 'success',
    hasParams: Object.keys(params).length > 0,
  });

  return (
    <FiltersContent
      params={params}
      setParams={setParams}
      resetFilters={resetFilters}
    />
  );
}
// [END DESKTOP_FILTERS_SIDEBAR]