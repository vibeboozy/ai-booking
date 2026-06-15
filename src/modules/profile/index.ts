/**
 * ANCHOR: profile
 * PURPOSE: Public API модуля profile (Dev D). Трипы, избранное, FavoriteButton.
 * Dependencies: @/modules/booking (Booking), @/shared/types/listing.
 *
 * DO:
 * - Экспортировать FavoriteButton для search и listing
 * - Экспортировать схемы валидации для API routes
 * DONT:
 * - Import Favorite logic into other modules inline
 */

export { FavoriteButton, FavoriteButtonWithAuth } from '@/modules/profile/components/FavoriteButton';
export { TripsList } from '@/modules/profile/components/TripsList';
export { FavoritesList } from '@/modules/profile/components/FavoritesList';
export { ReviewForm } from '@/modules/profile/components/ReviewForm';
export { StarRating } from '@/modules/profile/components/StarRating';
export { useFavorites } from '@/modules/profile/hooks/useFavorites';
export { useTrips } from '@/modules/profile/hooks/useTrips';
export type { Trip, Favorite } from '@/modules/profile/types';
export type { TripsQuery, AddFavoriteInput } from '@/modules/profile/schemas/profile';
