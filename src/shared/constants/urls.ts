/**
 * ANCHOR: shared
 * PURPOSE: Centralized URL and API constants for the application.
 * All URLs used in router.push, redirect, Link href must use these constants.
 * All API endpoints used in fetch() must use API constants.
 */

export const URL = {
  HOME: '/',
  LOGIN: '/login',
  SEARCH: '/search',
  PROFILE: '/profile',
  PROFILE_TRIPS: '/profile/trips',
  PROFILE_FAVORITES: '/profile/favorites',
  BOOKING_SUCCESS: (bookingId: string) => `/booking-success/${bookingId}`,
  LISTING: (listingId: string) => `/listings/${listingId}`,
  CHECKOUT: (listingId: string) => `/checkout/${listingId}`,
  TRIP_REVIEW: (bookingId: string) => `/profile/trips/${bookingId}/review`,
} as const;

export const API = {
  BOOKINGS: '/api/bookings',
  BOOKINGS_MOCK_PAY: '/api/bookings/mock-pay',
  BOOKINGS_DETAIL: (bookingId: string) => `/api/bookings/${bookingId}`,
  FAVORITES: '/api/favorites',
  FAVORITES_DETAIL: (listingId: string) => `/api/favorites/${listingId}`,
  PROFILE_FAVORITES: '/api/profile/favorites',
  PROFILE_TRIPS: '/api/profile/trips',
  REVIEWS: '/api/reviews',
  LISTINGS_REVIEWS: (listingId: string) => `/api/listings/${listingId}/reviews`,
  LISTINGS_SEARCH: '/api/listings/search',
  LISTINGS_DETAIL: (listingId: string) => `/api/listings/${listingId}`,
  LISTINGS_AVAILABILITY: (listingId: string) =>
    `/api/listings/${listingId}/availability`,
  LISTINGS_CONCIERGE: (listingId: string) =>
    `/api/listings/${listingId}/concierge`,
  LOCATIONS_AUTOCOMPLETE: '/api/locations/autocomplete',
} as const;

export type UrlKey = keyof typeof URL;
export type ApiKey = keyof typeof API;
