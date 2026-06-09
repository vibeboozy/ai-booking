/**
 * ANCHOR: shared
 * PURPOSE: Zod-схема SearchParams — единый контракт URL-параметров.
 * Dependencies: zod, @/shared/types/listing.
 * CRITICAL: Единственный источник правды для query params; все модули используют z.infer.
 *
 * DO:
 * - Расширять только через согласование всей команды
 * DONT:
 * - Парсить URL params вручную в отдельных модулях
 */

export type SearchParams = {
  city?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  priceMin?: number;
  priceMax?: number;
  propertyType?: import('@/shared/types/listing').PropertyType;
  amenities?: string[];
  page?: number;
};
