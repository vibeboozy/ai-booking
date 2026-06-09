/**
 * ANCHOR: search
 * PURPOSE: Панель фильтров: цена (slider), тип жилья, удобства (checkboxes).
 * Dependencies: useSearchFilters, @/shared/constants/*, nuqs/useSearchParams.
 * CRITICAL: URL — единственный source of truth; debounce 300ms на price slider.
 *
 * DO:
 * - Sync всех фильтров с URL
 * - Mobile filter drawer
 * DONT:
 * - useState для priceMin/priceMax без URL sync
 */

'use client';

export function SearchFilters() {
  return null;
}
