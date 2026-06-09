/**
 * ANCHOR: search
 * PURPOSE: Hook синхронизации фильтров с URL (read/write SearchParams).
 * Dependencies: @/shared/utils/parseSearchParams, @/shared/utils/buildSearchUrl, nuqs.
 * CRITICAL: Единственный hook для filter state в search module.
 *
 * DO:
 * - parseSearchParams + buildSearchUrl roundtrip
 * DONT:
 * - Дублировать URL logic в SearchFilters
 */

'use client';

import type { SearchParams } from '@/shared/schemas/searchParams';

export function useSearchFilters(): {
  params: SearchParams;
  setParams: (partial: Partial<SearchParams>) => void;
} {
  return { params: {}, setParams: () => {} };
}
