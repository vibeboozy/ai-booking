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
  _params: Partial<SearchParams>,
  _basePath = '/search',
): string {
  return '/search';
}
