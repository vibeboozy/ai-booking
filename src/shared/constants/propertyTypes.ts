/**
 * ANCHOR: shared
 * PURPOSE: Константы типов жилья для фильтров и UI labels.
 * Dependencies: @/shared/types/listing.
 * CRITICAL: API/URL lowercase; Prisma UPPER_SNAKE — маппинг в repository.
 */

import type { PropertyType } from '@/shared/types/listing';

export const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'room'];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Квартира',
  house: 'Дом',
  room: 'Комната',
};
