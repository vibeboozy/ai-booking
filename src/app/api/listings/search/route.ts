/**
 * ANCHOR: LISTINGS_SEARCH_API
 * PURPOSE: Поиск объявлений с фильтрами через URL query params.
 *
 * @PreConditions:
 * - query params: city?, country?, checkIn?, checkOut?, guests?, priceMin?, priceMax?, propertyType?, amenities?, page?
 * - parseSearchParams imported from '@/shared/utils/parseSearchParams'
 * - searchListings imported from '@/modules/search/search.repository'
 *
 * @PostConditions:
 * - при успехе: { data: ListingPreview[], meta: { total, page, hasMore } }
 * - при ошибке валидации: { error: "Invalid params" } status 400
 * - при ошибке БД: { error: "Search failed" } status 500
 *
 * @Invariants:
 * - Пагинация: page default 1, take 20
 * - select только ListingPreview поля (id, title, city, country, pricePerNight, images, averageRating, reviewCount, propertyType)
 * - NO description в ответе (тяжёлое поле)
 * - Сортировка: averageRating DESC, reviewCount DESC
 *
 * @SideEffects: нет
 *
 * @QueryParams:
 * - city?: string - город для поиска (contains, case-insensitive)
 * - priceMin?: number - минимальная цена в копейках
 * - priceMax?: number - максимальная цена в копейках
 * - propertyType?: 'apartment' | 'house' | 'room'
 * - amenities?: string - comma-separated ('wifi,kitchen')
 * - page?: number - номер страницы (default 1)
 */

// [START LISTINGS_SEARCH_API]
import { NextResponse } from 'next/server';
import { searchParamsSchema } from '@/shared/schemas/searchParams';
import { parseSearchParams } from '@/shared/utils/parseSearchParams';
import { searchListings } from '@/modules/search/search.repository';
import type { ListingPreview } from '@/shared/types/listing';

export async function GET(request: Request): Promise<
  NextResponse<
    | {
        data: ListingPreview[];
        meta: { total: number; page: number; hasMore: boolean };
      }
    | { error: string }
  >
> {
  console.log('[search][GET][LISTINGS_SEARCH_API][ENTRY]', {
    url: request.url,
  });

  try {
    const { searchParams } = new URL(request.url);
    const rawParams: Record<string, string | string[] | undefined> = {};

    for (const [key, value] of searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = searchParamsSchema.safeParse(parseSearchParams(rawParams));

    if (!parsed.success) {
      console.log('[search][GET][LISTINGS_SEARCH_API][DECISION]', {
        decision: 'invalid_params',
        errors: parsed.error.issues,
      });
      console.log('[search][GET][LISTINGS_SEARCH_API][EXIT]', {
        result: 'validation_error',
      });
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    console.log('[search][GET][LISTINGS_SEARCH_API][DECISION]', {
      decision: 'call_search_listings',
      params: parsed.data,
    });

    const result = await searchListings(parsed.data);

    console.log('[search][GET][LISTINGS_SEARCH_API][EXIT]', {
      result: 'success',
      data_length: result.data.length,
      meta: result.meta,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[search][GET][LISTINGS_SEARCH_API][ERROR]', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
// [END LISTINGS_SEARCH_API]
