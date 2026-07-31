/**
 * ANCHOR: profile
 * PURPOSE: Hook toggle/list favorites (client API calls).
 * Dependencies: POST/DELETE /api/favorites, useState for optimistic updates.
 *
 * DO:
 * - Optimistic toggle in FavoriteButton
 * - Return favoriteIds Set for convenience
 * DONT:
 * - Store favorites only in localStorage
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { API } from '@/shared/constants/urls';

interface UseFavoritesOptions {
  initialFavoriteIds?: Set<string>;
  onError?: (error: string) => void;
}

export function useFavorites(options: UseFavoritesOptions = {}): {
  favoriteIds: Set<string>;
  toggle: (listingId: string) => Promise<void>;
  isLoading: boolean;
  isOptimistic: (listingId: string) => boolean;
} {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    options.initialFavoriteIds || new Set(),
  );
  const [optimisticIds, setOptimisticIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial favorites on mount
  useEffect(() => {
    // Only skip fetch if initialFavoriteIds was explicitly provided (even as empty Set)
    // Use ?? operator to distinguish undefined from empty Set
    const hasInitialIds = options.initialFavoriteIds !== undefined;
    if (hasInitialIds) {
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await fetch(API.PROFILE_FAVORITES);
        if (response.ok) {
          const data = await response.json();
          const ids: Set<string> = new Set(
            data.data.map((listing: { id: string }) => listing.id),
          );
          setFavoriteIds(ids);
        }
      } catch {
        // Silently fail on initial load - user can still try to add favorites
      }
    };

    fetchFavorites();
  }, [options.initialFavoriteIds]);

  const toggle = useCallback(
    async (listingId: string) => {
      const isCurrentlyFavorited = favoriteIds.has(listingId);
      const isCurrentlyOptimistic = optimisticIds.has(listingId);

      // If already doing optimistic update for this listing, ignore
      if (isCurrentlyOptimistic) {
        return;
      }

      // Optimistic update
      setOptimisticIds((prev) => new Set(prev).add(listingId));

      try {
        if (isCurrentlyFavorited) {
          // Remove from favorites
          const response = await fetch(API.FAVORITES_DETAIL(listingId), {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Ошибка при удалении из избранного');
          }

          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(listingId);
            return next;
          });
        } else {
          // Add to favorites
          const response = await fetch(API.FAVORITES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listingId }),
          });

          if (!response.ok) {
            throw new Error('Ошибка при добавлении в избранное');
          }

          setFavoriteIds((prev) => new Set(prev).add(listingId));
        }
      } catch (err) {
        // Rollback optimistic update
        setFavoriteIds((prev) => {
          // If it was favorited before, add it back; if not, remove it
          if (isCurrentlyFavorited) {
            return new Set(prev).add(listingId);
          }
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });

        const message =
          err instanceof Error ? err.message : 'Неизвестная ошибка';
        options.onError?.(message);
      } finally {
        setOptimisticIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      }
    },
    [favoriteIds, optimisticIds, options],
  );

  const isOptimistic = useCallback(
    (listingId: string) => optimisticIds.has(listingId),
    [optimisticIds],
  );

  return {
    favoriteIds,
    toggle,
    isLoading,
    isOptimistic,
  };
}
