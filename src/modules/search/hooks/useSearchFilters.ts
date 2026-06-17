/**
 * ANCHOR: USE_SEARCH_FILTERS_HOOK
 * PURPOSE: Управление фильтрами поиска через URL.
 *
 * @PreConditions:
 * - parseSearchParams imported from '@/shared/utils/parseSearchParams'
 * - buildSearchUrl imported from '@/shared/utils/buildSearchUrl'
 * - useSearchParams available from 'next/navigation'
 *
 * @PostConditions:
 * - params: текущие SearchParams из URL
 * - setParams(partial): обновляет URL через router.push с debounce 300ms
 * - clearParams(): навигация на /search (сбрасывает все параметры)
 * - resetFilters(): сбрасывает только price/propertyType/amenities (city/guests сохраняются)
 *
 * @Invariants:
 * - Никогда не вызывает router.refresh() или полную перезагрузку
 * - Debounce применяется только к price slider (другие фильтры — сразу)
 *
 * @SideEffects: Изменение URL
 */

// [START USE_SEARCH_FILTERS_HOOK]
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { parseSearchParams } from '@/shared/utils/parseSearchParams';
import { buildSearchUrl } from '@/shared/utils/buildSearchUrl';
import type { SearchParams } from '@/shared/schemas/searchParams';

const DEBOUNCE_DELAY_MS = 300;
const PRICE_FILTER_KEYS = ['priceMin', 'priceMax'] as const;

export function useSearchFilters(): {
  params: SearchParams;
  setParams: (partial: Partial<SearchParams>) => void;
  clearParams: () => void;
  resetFilters: () => void;
} {
  console.log('[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][ENTRY]');

  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const params = parseSearchParams(searchParams.toString() ? Object.fromEntries(searchParams.entries()) : {});

  console.log('[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][EXIT]', {
    result: 'params parsed',
    params,
  });

  const clearParams = useCallback(() => {
    console.log('[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][CLEAR_PARAMS][ENTRY]');
    router.push('/search');
    console.log('[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][CLEAR_PARAMS][EXIT]');
  }, [router]);

  const resetFilters = useCallback(() => {
    console.log('[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][RESET_FILTERS][ENTRY]');

    const { city, guests, ...filtersToReset } = params;

    const resetParams: Partial<SearchParams> = {};
    if (city !== undefined) {
      resetParams.city = city;
    }
    if (guests !== undefined) {
      resetParams.guests = guests;
    }

    const url = buildSearchUrl(resetParams);
    router.push(url);

    console.log('[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][RESET_FILTERS][EXIT]', {
      preserved: { city, guests },
      removed: filtersToReset,
    });
  }, [params, router]);

  const setParams = useCallback(
    (partial: Partial<SearchParams>) => {
      console.log('[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][SET_PARAMS][ENTRY]', {
        partial,
      });

      const newParams: Partial<SearchParams> = { ...params, ...partial };

      const isPriceUpdate = PRICE_FILTER_KEYS.some(
        (key) => partial[key] !== undefined && params[key] !== partial[key],
      );

      if (isPriceUpdate) {
        console.log('[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][DEBOUNCE]', {
          reason: 'price update',
          delayMs: DEBOUNCE_DELAY_MS,
        });

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          const url = buildSearchUrl(newParams);
          router.push(url);
          console.log('[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][DEBOUNCE][EXIT]', {
            url,
          });
        }, DEBOUNCE_DELAY_MS);
      } else {
        const url = buildSearchUrl(newParams);
        router.push(url);
        console.log('[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][SET_PARAMS][EXIT]', {
          url,
          isPriceUpdate: false,
        });
      }
    },
    [params, router],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return { params, setParams, clearParams, resetFilters };
}
// [END USE_SEARCH_FILTERS_HOOK]