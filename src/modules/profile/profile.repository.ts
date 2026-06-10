/**
 * ANCHOR: profile
 * PURPOSE: Prisma-запросы: trips, favorites CRUD.
 * Dependencies: @/lib/prisma, auth-scoped by userId.
 * CRITICAL: Все queries filter by session userId; unique (userId, listingId) for favorites.
 *
 * DO:
 * - JOIN listing for Trip cards
 * DONT:
 * - Accept userId from client body
 */

import type { ListingPreview } from '@/shared/types/listing';
import type { Favorite, Trip } from '@/modules/profile/types';

export async function getUserTrips(
  _userId: string,
  _status?: 'upcoming' | 'history',
): Promise<Trip[]> {
  return [];
}

export async function getUserFavorites(
  _userId: string,
): Promise<ListingPreview[]> {
  return [];
}

export async function addFavorite(
  _userId: string,
  _listingId: string,
): Promise<Favorite> {
  throw new Error('Not implemented');
}

export async function removeFavorite(
  _userId: string,
  _listingId: string,
): Promise<void> {
  throw new Error('Not implemented');
}
