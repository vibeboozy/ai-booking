/**
 * ANCHOR: shared
 * PURPOSE: Генерация URL с query params из SearchParams.
 * Dependencies: @/shared/schemas/searchParams.
 * CRITICAL: Omit empty/default params; amenities sorted alphabetically.
 *
 * DO:
 * - Использовать для navigate после поиска и фильтров
 * DONT:
 * - Строить URL строками вручную в компонентах
 */

import type { SearchParams } from '@/shared/schemas/searchParams';

export function buildSearchUrl(
  params: Partial<SearchParams>,
  basePath = '/search',
): string {
  const search = new URLSearchParams();

  if (params.city) {
    search.set('city', params.city);
  }
  if (params.country) {
    search.set('country', params.country);
  }
  if (params.checkIn) {
    search.set('checkIn', params.checkIn);
  }
  if (params.checkOut) {
    search.set('checkOut', params.checkOut);
  }
  if (params.guests !== undefined && params.guests !== 2) {
    search.set('guests', String(params.guests));
  }
  if (params.priceMin !== undefined) {
    search.set('priceMin', String(params.priceMin));
  }
  if (params.priceMax !== undefined) {
    search.set('priceMax', String(params.priceMax));
  }
  if (params.propertyType) {
    search.set('propertyType', params.propertyType);
  }
  if (params.amenities?.length) {
    search.set('amenities', [...params.amenities].sort().join(','));
  }
  if (params.page !== undefined && params.page > 1) {
    search.set('page', String(params.page));
  }

  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
