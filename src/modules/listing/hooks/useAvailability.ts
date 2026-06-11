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

import type { AvailabilityDay } from '@/modules/listing/types';

export function useAvailability(
  _listingId: string,
  _month?: string,
): {
  days: AvailabilityDay[];
  isLoading: boolean;
} {
  return { days: [], isLoading: false };
}
