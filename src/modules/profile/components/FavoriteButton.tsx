/**
 * ANCHOR: profile
 * PURPOSE: Toggle избранного (сердечко) — optimistic UI.
 * Dependencies: POST/DELETE /api/favorites, useFavorites.
 * CRITICAL: Exported to search ListingCard and listing page; data-testid="favorite-toggle".
 *
 * DO:
 * - Optimistic update + rollback on error
 * - Auth required (redirect/login prompt if guest)
 * DONT:
 * - Block render if favorites loading on entire page
 */

'use client';

type FavoriteButtonProps = {
  listingId: string;
  initialFavorited?: boolean;
  size?: 'sm' | 'md';
  className?: string;
};

export function FavoriteButton(_props: FavoriteButtonProps) {
  return null;
}
