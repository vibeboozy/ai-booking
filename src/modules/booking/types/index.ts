/**
 * ANCHOR: booking
 * PURPOSE: TypeScript-типы booking module.
 * Dependencies: none.
 */

export type BookingCreateInput = {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export type Booking = {
  id: string;
  userId: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
};

export type PriceBreakdown = {
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
};
