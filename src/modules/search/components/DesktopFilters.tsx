/**
 * ANCHOR: search
 * PURPOSE: Desktop layout for filters panel.
 */

'use client';

import { useSearchFilters } from '@/modules/search/hooks/useSearchFilters';
import { FiltersContent } from './FiltersContent';

export function DesktopFilters() {
  const { params, setParams, resetFilters } = useSearchFilters();

  return (
    <div className="hidden md:block">
      <FiltersContent
        params={params}
        setParams={setParams}
        resetFilters={resetFilters}
      />
    </div>
  );
}