/**
 * ANCHOR: shared
 * PURPOSE: Константы удобств (amenities) для фильтров и labels.
 * Dependencies: none.
 * CRITICAL: Значения wifi/kitchen/parking — канонические ключи в URL и БД.
 */

export const AMENITIES = [
  'wifi',
  'kitchen',
  'parking',
  'washer',
  'ac',
  'tv',
] as const;

export type Amenity = (typeof AMENITIES)[number];

export const AMENITY_LABELS: Record<Amenity, string> = {
  wifi: 'Wi-Fi',
  kitchen: 'Кухня',
  parking: 'Парковка',
  washer: 'Стиральная машина',
  ac: 'Кондиционер',
  tv: 'Телевизор',
};

export function isAmenity(value: string): value is Amenity {
  return AMENITIES.includes(value as Amenity);
}
