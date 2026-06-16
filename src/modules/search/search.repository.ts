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
import type { LocationType, Prisma } from '@prisma/client';
import type { SearchParams } from '@/shared/schemas/searchParams';
import type { ListingPreview, PropertyType } from '@/shared/types/listing';
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

/**
 * ANCHOR: AUTOCOMPLETE_LOCATIONS_REPO
 * PURPOSE: Поиск локаций по строке для автокомплита.
 *
 * @PreConditions:
 * - q: непустая строка (минимум 2 символа для поиска)
 *
 * @PostConditions:
 * - Возвращает Location[] с полями: id, name, type, slug, lat, lng
 * - q пустая → возвращает популярные локации (до limit)
 * - q < 2 символов → возвращает пустой массив
 *
 * @Invariants:
 * - limit по умолчанию 5
 * - Сортировка: type ASC, name ASC
 * - Регистронезависимый поиск через contains + mode: 'insensitive'
 *
 * @SideEffects: нет
 *
 * @ForbiddenChanges:
 * - Нельзя возвращать данные без filter по name при q.length >= 2
 */
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

/**
 * ANCHOR: BUILD_WHERE_CLAUSE
 * PURPOSE: Строит Prisma where-объект из SearchParams.
 *
 * @PreConditions:
 * - SearchParams валидированы (zod schema)
 *
 * @PostConditions:
 * - Возвращает объект для Prisma where:
 *   - city: contains (case-insensitive) если указан
 *   - country: contains (case-insensitive) если указан
 *   - pricePerNight: gte priceMin, lte priceMax
 *   - propertyType: equals если указан
 *   - amenities:hasEvery (все выбранные должны присутствовать)
 *
 * @Invariants:
 * - city/country поиск через contains, mode: 'insensitive'
 * - priceMin/max корректно обрабатывают undefined
 * - amenities пустой массив не добавляет фильтр
 *
 * @SideEffects: нет
 *
 * @ForbiddenChanges:
 * - Нельзя добавлять фильтры по отсутствующим в SearchParams полям
 * - Нельзя менять mode: 'insensitive' на чувствительный к регистру поиск
 */
export function buildWhereClause(params: SearchParams): Prisma.ListingWhereInput {
  logLine('search', 'buildWhereClause', 'BUILD_WHERE_CLAUSE', 'ENTRY', {
    hasParams: Object.keys(params).length > 0,
    params_keys: Object.keys(params),
  });

  const where: Prisma.ListingWhereInput = {};

  if (params.city) {
    logLine('search', 'buildWhereClause', 'BUILD_WHERE_CLAUSE', 'CHECK', {
      check: 'city_filter',
      city: params.city,
    });
    where.city = { contains: params.city, mode: 'insensitive' };
  }

  if (params.country) {
    logLine('search', 'buildWhereClause', 'BUILD_WHERE_CLAUSE', 'CHECK', {
      check: 'country_filter',
      country: params.country,
    });
    where.country = { contains: params.country, mode: 'insensitive' };
  }

  if (params.priceMin !== undefined || params.priceMax !== undefined) {
    logLine('search', 'buildWhereClause', 'BUILD_WHERE_CLAUSE', 'CHECK', {
      check: 'price_filter',
      priceMin: params.priceMin,
      priceMax: params.priceMax,
    });
    where.pricePerNight = {};
    if (params.priceMin !== undefined) {
      where.pricePerNight.gte = params.priceMin;
    }
    if (params.priceMax !== undefined) {
      where.pricePerNight.lte = params.priceMax;
    }
  }

  if (params.propertyType) {
    logLine('search', 'buildWhereClause', 'BUILD_WHERE_CLAUSE', 'CHECK', {
      check: 'property_type_filter',
      propertyType: params.propertyType,
    });
    where.propertyType = params.propertyType.toUpperCase() as 'APARTMENT' | 'HOUSE' | 'ROOM';
  }

  if (params.amenities && params.amenities.length > 0) {
    logLine('search', 'buildWhereClause', 'BUILD_WHERE_CLAUSE', 'CHECK', {
      check: 'amenities_filter',
      amenities: params.amenities,
    });
    where.amenities = { hasEvery: params.amenities };
  }

  logLine('search', 'buildWhereClause', 'BUILD_WHERE_CLAUSE', 'EXIT', {
    result: 'success',
    where_keys: Object.keys(where),
  });

  return where;
}

/**
 * ANCHOR: SEARCH_LISTINGS_REPO
 * PURPOSE: Поиск объявлений с фильтрами и пагинацией, возврат только ListingPreview полей.
 *
 * @PreConditions:
 * - params: SearchParams (парсится из URL через parseSearchParams)
 * - page: default 1, min 1
 *
 * @PostConditions:
 * - data: ListingPreview[] (без description)
 * - meta.total: общее количество符合条件 объявлений
 * - meta.page: текущая страница
 * - meta.hasMore: true если есть следующая страница
 * - Пустой city → возвращает все объявления (с другими фильтрами)
 * - Нет результатов → data: [], meta.total: 0
 *
 * @Invariants:
 * - SELECT только ListingPreview поля (id, title, city, country, pricePerNight, images, averageRating, reviewCount, propertyType)
 * - НЕ выбирается description (тяжёлое поле)
 * - Пагинация: take = 20, максимум 50
 * - Сортировка: averageRating DESC, reviewCount DESC
 *
 * @SideEffects: нет
 *
 * @ForbiddenChanges:
 * - Нельзя убрать select (риск утечки данных)
 * - Нельзя увеличить take > 50
 */
const LISTING_PREVIEW_SELECT = {
  id: true,
  title: true,
  city: true,
  country: true,
  pricePerNight: true,
  images: true,
  averageRating: true,
  reviewCount: true,
  propertyType: true,
} as const;

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 50;

export async function searchListings(
  params: SearchParams,
): Promise<{
  data: ListingPreview[];
  meta: { total: number; page: number; hasMore: boolean };
}> {
  logLine('search', 'searchListings', 'SEARCH_LISTINGS_REPO', 'ENTRY', {
    hasParams: Object.keys(params).length > 0,
    params_keys: Object.keys(params),
    page: params.page,
  });

  const page = params.page ?? 1;
  const take = Math.min(PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX);
  const skip = (page - 1) * take;

  logLine('search', 'searchListings', 'SEARCH_LISTINGS_REPO', 'DECISION', {
    decision: 'pagination_params',
    page,
    take,
    skip,
  });

  const where = buildWhereClause(params);

  logLine('search', 'searchListings', 'SEARCH_LISTINGS_REPO', 'CHECK', {
    check: 'db_query',
    where_keys: Object.keys(where),
  });

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      select: LISTING_PREVIEW_SELECT,
      take,
      skip,
      orderBy: [
        { averageRating: 'desc' },
        { reviewCount: 'desc' },
      ],
    }),
    prisma.listing.count({ where }),
  ]);

  logLine('search', 'searchListings', 'SEARCH_LISTINGS_REPO', 'CHECK', {
    check: 'results_fetched',
    listings_count: listings.length,
    total,
  });

  const data: ListingPreview[] = listings.map((listing) => ({
    ...listing,
    propertyType: listing.propertyType.toLowerCase() as PropertyType,
  }));

  const result = {
    data,
    meta: {
      total,
      page,
      hasMore: skip + take < total,
    },
  };

  logLine('search', 'searchListings', 'SEARCH_LISTINGS_REPO', 'EXIT', {
    result: 'success',
    data_length: listings.length,
    meta: result.meta,
  });

  return result;
}
