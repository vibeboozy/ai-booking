/**
 * ANCHOR: listing
 * PURPOSE: TypeScript-типы listing module: ListingDetail, AvailabilityDay.
 * Dependencies: @/shared/types/listing.
 */

import type { HostPreview, ListingPreview } from '@/shared/types/listing';

export type ListingDetail = ListingPreview & {
  description: string;
  amenities: string[];
  lat: number;
  lng: number;
  cleaningFee: number;
  serviceFee: number;
  host: HostPreview;
};

export type AvailabilityDay = {
  date: string;
  status: 'free' | 'booked' | 'past';
};
