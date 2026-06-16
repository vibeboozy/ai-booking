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

import { prisma } from '@/lib/prisma';
import type { LocationType } from '@prisma/client';
import type { SearchParams } from '@/shared/schemas/searchParams';
import type { ListingPreview } from '@/shared/types/listing';
import type { Location } from '@/modules/search/types';

function mapPrismaLocationType(type: LocationType): 'city' | 'country' {
  return type === 'CITY' ? 'city' : 'country';
}

function logLine(
  module: string,
  function_name: string,
  anchor: string,
  point: 'ENTRY' | 'EXIT' | 'CHECK' | 'DECISION' | 'ERROR',
  data?: Record<string, unknown>
): void {
  console.log(`[${module}][${function_name}][${anchor}][${point}]`, JSON.stringify(data ?? {}));
}

interface AutocompleteOptions {
  limit?: number;
}

export async function autocompleteLocations(
  q: string,
  options: AutocompleteOptions = {}
): Promise<Location[]> {
  logLine('search', 'autocompleteLocations', 'AUTOCOMPLETE_LOCATIONS_REPO', 'ENTRY', {
    q,
    q_length: q.length,
    limit: options.limit ?? 5,
  });

  const limit = options.limit ?? 5;

  if (q.length > 0 && q.length < 2) {
    logLine('search', 'autocompleteLocations', 'AUTOCOMPLETE_LOCATIONS_REPO', 'DECISION', {
      decision: 'return_empty_for_short_query',
      q_length: q.length,
    });
    logLine('search', 'autocompleteLocations', 'AUTOCOMPLETE_LOCATIONS_REPO', 'EXIT', {
      result: 'empty_array',
      reason: 'query_too_short',
    });
    return [];
  }

  let dbLocations: Array<{
    id: string;
    name: string;
    type: LocationType;
    slug: string;
    lat: number | null;
    lng: number | null;
  }>;

  if (q.length === 0) {
    logLine('search', 'autocompleteLocations', 'AUTOCOMPLETE_LOCATIONS_REPO', 'CHECK', {
      check: 'empty_query',
      result: true,
    });
    dbLocations = await prisma.location.findMany({
      take: limit,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, type: true, slug: true, lat: true, lng: true },
    });
  } else {
    logLine('search', 'autocompleteLocations', 'AUTOCOMPLETE_LOCATIONS_REPO', 'CHECK', {
      check: 'search_query',
      result: true,
      q,
    });
    dbLocations = await prisma.location.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      take: limit,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, type: true, slug: true, lat: true, lng: true },
    });
  }

  const locations: Location[] = dbLocations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    type: mapPrismaLocationType(loc.type),
    slug: loc.slug,
    lat: loc.lat ?? undefined,
    lng: loc.lng ?? undefined,
  }));

  logLine('search', 'autocompleteLocations', 'AUTOCOMPLETE_LOCATIONS_REPO', 'EXIT', {
    result: 'success',
    locations_count: locations.length,
  });

  return locations;
}

export async function searchListings(
  _params: SearchParams,
): Promise<{
  data: ListingPreview[];
  meta: { total: number; page: number; hasMore: boolean };
}> {
  return { data: [], meta: { total: 0, page: 1, hasMore: false } };
}
