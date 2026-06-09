/**
 * ANCHOR: shared
 * PURPOSE: Константы удобств (amenities) для фильтров и labels.
 * Dependencies: none.
 * CRITICAL: Значения wifi/kitchen/parking — канонические ключи в URL и БД.
 */

export const AMENITIES = ['wifi', 'kitchen', 'parking'] as const;

export const AMENITY_LABELS: Record<(typeof AMENITIES)[number], string> = {
  wifi: 'Wi-Fi',
  kitchen: 'Кухня',
  parking: 'Парковка',
};
