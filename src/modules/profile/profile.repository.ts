/**
 * ANCHOR: profile
 * PURPOSE: Prisma-запросы: trips, favorites CRUD.
 * Dependencies: @/lib/prisma, auth-scoped by userId.
 * CRITICAL: Все queries filter by session userId; unique (userId, listingId) for favorites.
 *
 * DO:
 * - JOIN listing for Trip cards
 * - Return proper TypeScript types
 * - Export cached versions for Next.js data fetching
 * DONT:
 * - Accept userId from client body
 */

import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { ListingPreview } from '@/shared/types/listing';
import type { Favorite, Trip } from '@/modules/profile/types';
import type { BookingStatus, Prisma } from '@prisma/client';

/**
 * Map Prisma BookingStatus to API BookingStatus (lowercase)
 */
function mapBookingStatus(
  status: BookingStatus,
): 'pending' | 'confirmed' | 'completed' | 'cancelled' {
  const statusMap: Record<
    BookingStatus,
    'pending' | 'confirmed' | 'completed' | 'cancelled'
  > = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };
  return statusMap[status];
}

/**
 * Get user's trips with listing preview data (cached).
 * Status filter: 'upcoming' (CONFIRMED/PENDING with future checkIn) | 'history' (COMPLETED/CANCELLED or past checkOut)
 */
export const getUserTrips = cache(
  async (userId: string, status?: 'upcoming' | 'history'): Promise<Trip[]> => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const bookingWhere: Prisma.BookingWhereInput = {
      userId,
    };

    if (status === 'upcoming') {
      // Upcoming: confirmed or pending with checkIn in the future or today
      bookingWhere.status = { in: ['CONFIRMED', 'PENDING'] as BookingStatus[] };
      bookingWhere.checkIn = { gte: now };
    } else if (status === 'history') {
      // History: completed or cancelled, OR checkOut in the past
      bookingWhere.OR = [
        { status: { in: ['COMPLETED', 'CANCELLED'] as BookingStatus[] } },
        { checkOut: { lt: now } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where: bookingWhere,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            pricePerNight: true,
            images: true,
            averageRating: true,
            reviewCount: true,
            propertyType: true,
          },
        },
        review: {
          select: { id: true },
        },
      },
      orderBy: { checkIn: status === 'upcoming' ? 'asc' : 'desc' },
    });

    return bookings.map((booking) => ({
      booking: {
        id: booking.id,
        userId: booking.userId,
        listingId: booking.listingId,
        checkIn: booking.checkIn.toISOString().split('T')[0],
        checkOut: booking.checkOut.toISOString().split('T')[0],
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        status: mapBookingStatus(booking.status),
        createdAt: booking.createdAt.toISOString(),
      },
      listing: {
        id: booking.listing.id,
        title: booking.listing.title,
        city: booking.listing.city,
        country: booking.listing.country,
        pricePerNight: booking.listing.pricePerNight,
        images: booking.listing.images,
        averageRating: booking.listing.averageRating,
        reviewCount: booking.listing.reviewCount,
        propertyType:
          booking.listing.propertyType.toLowerCase() as ListingPreview['propertyType'],
      },
      canReview:
        booking.status === 'COMPLETED' &&
        booking.checkOut < now &&
        !booking.review,
    }));
  },
);

type UserTripsResult = {
  upcoming: Trip[];
  history: Trip[];
};

/**
 * Get all user trips split by status (single query for SSR).
 */
export const getAllUserTrips = cache(
  async (userId: string): Promise<UserTripsResult> => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            pricePerNight: true,
            images: true,
            averageRating: true,
            reviewCount: true,
            propertyType: true,
          },
        },
        review: {
          select: { id: true },
        },
      },
      orderBy: { checkIn: 'asc' },
    });

    const upcoming: Trip[] = [];
    const history: Trip[] = [];

    for (const booking of bookings) {
      const trip: Trip = {
        booking: {
          id: booking.id,
          userId: booking.userId,
          listingId: booking.listingId,
          checkIn: booking.checkIn.toISOString().split('T')[0],
          checkOut: booking.checkOut.toISOString().split('T')[0],
          guests: booking.guests,
          totalPrice: booking.totalPrice,
          status: mapBookingStatus(booking.status),
          createdAt: booking.createdAt.toISOString(),
        },
        listing: {
          id: booking.listing.id,
          title: booking.listing.title,
          city: booking.listing.city,
          country: booking.listing.country,
          pricePerNight: booking.listing.pricePerNight,
          images: booking.listing.images,
          averageRating: booking.listing.averageRating,
          reviewCount: booking.listing.reviewCount,
          propertyType:
            booking.listing.propertyType.toLowerCase() as ListingPreview['propertyType'],
        },
        canReview:
          booking.status === 'COMPLETED' &&
          booking.checkOut < now &&
          !booking.review,
      };

      // Split by status
      if (
        (booking.status === 'CONFIRMED' || booking.status === 'PENDING') &&
        booking.checkIn >= now
      ) {
        upcoming.push(trip);
      } else {
        history.push(trip);
      }
    }

    // Sort history by checkIn descending
    history.sort(
      (a, b) =>
        new Date(b.booking.checkIn).getTime() -
        new Date(a.booking.checkIn).getTime(),
    );

    return { upcoming, history };
  },
);

/**
 * Get user's favorite listings as ListingPreview[] (cached).
 */
export const getUserFavorites = cache(
  async (userId: string): Promise<ListingPreview[]> => {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            pricePerNight: true,
            images: true,
            averageRating: true,
            reviewCount: true,
            propertyType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => ({
      id: fav.listing.id,
      title: fav.listing.title,
      city: fav.listing.city,
      country: fav.listing.country,
      pricePerNight: fav.listing.pricePerNight,
      images: fav.listing.images,
      averageRating: fav.listing.averageRating,
      reviewCount: fav.listing.reviewCount,
      propertyType:
        fav.listing.propertyType.toLowerCase() as ListingPreview['propertyType'],
    }));
  },
);

/**
 * Add listing to user's favorites.
 * Returns the created Favorite record.
 * Idempotent: if already favorited, returns existing record.
 */
export async function addFavorite(
  userId: string,
  listingId: string,
): Promise<Favorite> {
  const favorite = await prisma.favorite.upsert({
    where: {
      userId_listingId: {
        userId,
        listingId,
      },
    },
    update: {},
    create: {
      userId,
      listingId,
    },
  });

  return {
    id: favorite.id,
    userId: favorite.userId,
    listingId: favorite.listingId,
    createdAt: favorite.createdAt.toISOString(),
  };
}

/**
 * Remove listing from user's favorites.
 * Does nothing if not favorited (idempotent).
 */
export async function removeFavorite(
  userId: string,
  listingId: string,
): Promise<void> {
  await prisma.favorite.deleteMany({
    where: {
      userId,
      listingId,
    },
  });
}

/**
 * Check if a listing is favorited by user.
 */
export async function isFavorited(
  userId: string,
  listingId: string,
): Promise<boolean> {
  const count = await prisma.favorite.count({
    where: {
      userId,
      listingId,
    },
  });
  return count > 0;
}

/**
 * Get all favorited listing IDs for a user (for initial state in FavoriteButton).
 */
export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { listingId: true },
  });
  return new Set(favorites.map((f) => f.listingId));
}

/**
 * Cancel a booking. Only CONFIRMED or PENDING bookings can be cancelled.
 * Returns true if cancelled, false if not found or not owned.
 */
export async function cancelBooking(
  userId: string,
  bookingId: string,
): Promise<boolean> {
  const result = await prisma.booking.updateMany({
    where: {
      id: bookingId,
      userId,
      status: { in: ['CONFIRMED', 'PENDING'] as BookingStatus[] },
    },
    data: { status: 'CANCELLED' },
  });
  return result.count > 0;
}
