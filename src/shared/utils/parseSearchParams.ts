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

import type { SearchParams } from '@/shared/schemas/searchParams';

export function parseSearchParams(
  _raw: Record<string, string | string[] | undefined>,
): SearchParams {
  return {};
}
