/**
 * ANCHOR: search
 * PURPOSE: Prisma-запросы: autocomplete locations, search listings с фильтрами.
 * Dependencies: @/lib/prisma, @/shared/schemas/searchParams, @/shared/types/listing.
 * CRITICAL: searchListings — select только ListingPreview поля (без description).
 *
 * DO:
 * - Pagination default 20, max 50
 * DONT:
 * - findMany без select на Listing
 */

import type { SearchParams } from '@/shared/schemas/searchParams';
import type { ListingPreview } from '@/shared/types/listing';
import type { Location } from '@/modules/search/types';

export async function autocompleteLocations(_q: string): Promise<Location[]> {
  return [];
}

export async function searchListings(
  _params: SearchParams,
): Promise<{ data: ListingPreview[]; meta: { total: number; page: number; hasMore: boolean } }> {
  return { data: [], meta: { total: 0, page: 1, hasMore: false } };
}
