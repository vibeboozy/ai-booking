/**
 * ANCHOR: profile
 * PURPOSE: TypeScript-типы profile module: Trip, Favorite.
 * Dependencies: @/modules/booking/types, @/shared/types/listing.
 */

import type { Booking } from '@/modules/booking/types';
import type { ListingPreview } from '@/shared/types/listing';

export type Favorite = {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
};

export type Trip = {
  booking: Booking;
  listing: ListingPreview;
  canReview: boolean;
};
