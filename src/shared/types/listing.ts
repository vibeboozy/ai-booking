/**
 * ANCHOR: shared
 * PURPOSE: Канонические типы Listing для cross-module контрактов.
 * Dependencies: none.
 * CRITICAL: ListingPreview — без description; используется в search, profile, cards.
 *
 * DO:
 * - Импортировать PropertyType и ListingPreview отсюда
 * DONT:
 * - Дублировать типы в модулях
 */

export type PropertyType = 'apartment' | 'house' | 'room';

export type ListingPreview = {
  id: string;
  title: string;
  city: string;
  country: string;
  pricePerNight: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  propertyType: PropertyType;
};

export type HostPreview = {
  id: string;
  name: string;
  avatarUrl: string | null;
};
