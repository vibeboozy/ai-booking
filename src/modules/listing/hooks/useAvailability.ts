/**
 * ANCHOR: listing
 * PURPOSE: Hook загрузки availability для календаря (client fetch / React Query).
 * Dependencies: GET /api/listings/[id]/availability.
 *
 * DO:
 * - staleTime config для кэша
 * DONT:
 * - Fetch availability в Server Component и prop-drill глубоко
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { AvailabilityDay } from '@/modules/listing/types';

export function useAvailability(
  listingId: string,
  month?: string,
): {
  days: AvailabilityDay[];
  isLoading: boolean;
  error?: Error;
} {
  const query = useQuery({
    queryKey: ['availability', listingId, month],
    queryFn: async () => {
      const url = month
        ? `/api/listings/${listingId}/availability?month=${month}`
        : `/api/listings/${listingId}/availability`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch availability');
      const { data } = await res.json();
      return data as AvailabilityDay[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    days: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | undefined,
  };
}
