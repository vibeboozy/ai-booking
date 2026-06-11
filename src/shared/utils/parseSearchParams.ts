/**
 * ANCHOR: shared
 * PURPOSE: Парсинг raw searchParams (Next.js) в типизированный SearchParams.
 * Dependencies: @/shared/schemas/searchParams.
 * CRITICAL: Используется search, listing, booking для чтения URL.
 *
 * DO:
 * - Валидировать и нормализовать даты (YYYY-MM-DD), guests (1–16)
 * DONT:
 * - Дублировать логику парсинга в модулях
 */

import {
  searchParamsSchema,
  type SearchParams,
} from '@/shared/schemas/searchParams';

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}

export function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
): SearchParams {
  const amenitiesRaw = firstValue(raw.amenities);
  const amenities = amenitiesRaw
    ? amenitiesRaw.split(',').map((a) => a.trim()).filter(Boolean).sort()
    : undefined;

  const parsed = searchParamsSchema.safeParse({
    city: firstValue(raw.city),
    country: firstValue(raw.country),
    checkIn: firstValue(raw.checkIn),
    checkOut: firstValue(raw.checkOut),
    guests: firstValue(raw.guests),
    priceMin: firstValue(raw.priceMin),
    priceMax: firstValue(raw.priceMax),
    propertyType: firstValue(raw.propertyType),
    amenities,
    page: firstValue(raw.page),
  });

  if (!parsed.success) {
    return {};
  }

  const result = { ...parsed.data };

  if (result.amenities) {
    result.amenities = [...result.amenities].sort();
  }

  return result;
}
