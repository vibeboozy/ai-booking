/**
 * ANCHOR: profile
 * PURPOSE: Public API модуля profile (Dev D). Трипы, избранное, FavoriteButton.
 * Dependencies: @/modules/booking (Booking), @/shared/types/listing.
 *
 * DO:
 * - Экспортировать FavoriteButton для search и listing
 * DONT:
 * - Import Favorite logic into other modules inline
 */

export { FavoriteButton } from '@/modules/profile/components/FavoriteButton';
export { TripsList } from '@/modules/profile/components/TripsList';
export { FavoritesList } from '@/modules/profile/components/FavoritesList';
export { useFavorites } from '@/modules/profile/hooks/useFavorites';
export { useTrips } from '@/modules/profile/hooks/useTrips';
export type { Trip, Favorite } from '@/modules/profile/types';
