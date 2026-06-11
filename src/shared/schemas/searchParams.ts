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

import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const propertyTypeSchema = z.enum(['apartment', 'house', 'room']);

export const searchParamsSchema = z.object({
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  checkIn: z.string().regex(dateRegex, 'Invalid date format').optional(),
  checkOut: z.string().regex(dateRegex, 'Invalid date format').optional(),
  guests: z.coerce.number().int().min(1).max(16).optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  propertyType: propertyTypeSchema.optional(),
  amenities: z.array(z.string().min(1)).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
