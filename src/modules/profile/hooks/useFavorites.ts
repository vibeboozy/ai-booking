/**
 * ANCHOR: profile
 * PURPOSE: Hook toggle/list favorites (client API calls).
 * Dependencies: /api/favorites endpoints.
 *
 * DO:
 * - Optimistic toggle in FavoriteButton
 * DONT:
 * - Store favorites only in localStorage
 */

'use client';

export function useFavorites(): {
  favoriteIds: Set<string>;
  toggle: (listingId: string) => Promise<void>;
  isLoading: boolean;
} {
  return { favoriteIds: new Set(), toggle: async () => {}, isLoading: false };
}
