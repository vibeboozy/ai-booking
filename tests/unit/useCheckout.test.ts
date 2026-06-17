/**
 * ANCHOR: booking
 * PURPOSE: Unit-тесты useCheckout validation: все кейсы validationError.
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, expect, it, beforeEach } from 'vitest';
import type { ListingDetail } from '@/modules/listing/types';
import type { AvailabilityDay } from '@/modules/listing/types';

const mockUseSearchParams = vi.hoisted(() =>
  vi.fn(() => new URLSearchParams()),
);

vi.mock('next/navigation', () => ({
  useSearchParams: mockUseSearchParams,
}));

import { useCheckout } from '@/modules/booking/hooks/useCheckout';

const mockListing: ListingDetail = {
  id: 'listing-1',
  title: 'Тестовая квартира',
  city: 'Москва',
  country: 'Россия',
  pricePerNight: 500000,
  images: ['https://example.com/img.jpg'],
  averageRating: 4.5,
  reviewCount: 10,
  propertyType: 'apartment',
  description: 'Отличная квартира',
  amenities: ['wifi', 'kitchen'],
  lat: 55.7558,
  lng: 37.6173,
  cleaningFee: 100000,
  serviceFee: 50000,
  host: { id: 'host-1', name: 'Иван', avatarUrl: null },
};

const futureCheckIn = '2026-08-01';
const futureCheckOut = '2026-08-05';

describe('useCheckout validationError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('guests validation', () => {
    it('should set validationError when guests > 10 in URL', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '15',
          checkIn: futureCheckIn,
          checkOut: futureCheckOut,
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, []));

      expect(result.current.validationError).toBe(
        'Максимальное количество гостей — 10',
      );
    });

    it('should allow guests exactly 10', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '10',
          checkIn: futureCheckIn,
          checkOut: futureCheckOut,
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, []));

      expect(result.current.validationError).toBeNull();
    });

    it('should clamp guests to 10 when URL has value > 10', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '20',
          checkIn: futureCheckIn,
          checkOut: futureCheckOut,
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, []));

      expect(result.current.guests).toBe(10);
    });

    it('should default to 1 guest when guests is invalid', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: 'abc',
          checkIn: futureCheckIn,
          checkOut: futureCheckOut,
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, []));

      expect(result.current.guests).toBe(1);
    });

    it('should block submit when guests > 10', async () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '99',
          checkIn: futureCheckIn,
          checkOut: futureCheckOut,
        }),
      );

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'booking-1' } }),
      });

      const { result } = renderHook(() => useCheckout(mockListing, []));

      let bookingId: string | null = null;
      await act(async () => {
        bookingId = await result.current.submit();
      });

      expect(bookingId).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('dates validation', () => {
    it('should return null when checkIn and checkOut are not set', () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams({ guests: '2' }));

      const { result } = renderHook(() => useCheckout(mockListing, []));

      expect(result.current.validationError).toBeNull();
    });

    it('should set error when checkIn is in the past', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '2',
          checkIn: '2020-01-01',
          checkOut: futureCheckOut,
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, []));

      expect(result.current.validationError).toBe('Выбранные даты уже прошли');
    });

    it('should set error when checkOut is in the past', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '2',
          checkIn: futureCheckIn,
          checkOut: '2020-01-01',
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, []));

      expect(result.current.validationError).toBe('Выбранные даты уже прошли');
    });

    it('should set error when checkOut <= checkIn', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '2',
          checkIn: futureCheckOut,
          checkOut: futureCheckIn,
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, []));

      expect(result.current.validationError).toBe(
        'Дата выезда должна быть позже даты заезда',
      );
    });

    it('should set error when checkOut equals checkIn', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '2',
          checkIn: futureCheckIn,
          checkOut: futureCheckIn,
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, []));

      expect(result.current.validationError).toBe(
        'Дата выезда должна быть позже даты заезда',
      );
    });
  });

  describe('availability validation', () => {
    const bookedDays: AvailabilityDay[] = [
      { date: '2026-08-02', status: 'booked' },
      { date: '2026-08-03', status: 'booked' },
    ];

    it('should set error when checkIn date is booked', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '2',
          checkIn: '2026-08-02',
          checkOut: futureCheckOut,
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, bookedDays));

      expect(result.current.validationError).toBe(
        'Выбранные даты недоступны для бронирования',
      );
    });

    it('should set error when checkOut date is booked', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '2',
          checkIn: futureCheckIn,
          checkOut: '2026-08-03',
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, bookedDays));

      expect(result.current.validationError).toBe(
        'Выбранные даты недоступны для бронирования',
      );
    });

    it('should allow dates when neither checkIn nor checkOut is booked', () => {
      const freeDays: AvailabilityDay[] = [
        { date: '2026-08-02', status: 'free' },
        { date: '2026-08-03', status: 'free' },
      ];

      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '2',
          checkIn: futureCheckIn,
          checkOut: futureCheckOut,
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, freeDays));

      expect(result.current.validationError).toBeNull();
    });
  });

  describe('valid state', () => {
    it('should have no validationError for valid future dates', () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '2',
          checkIn: futureCheckIn,
          checkOut: futureCheckOut,
        }),
      );

      const { result } = renderHook(() => useCheckout(mockListing, []));

      expect(result.current.validationError).toBeNull();
    });

    it('should allow submit with valid dates and guests', async () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          guests: '2',
          checkIn: futureCheckIn,
          checkOut: futureCheckOut,
        }),
      );

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'booking-new' } }),
      });

      const { result } = renderHook(() => useCheckout(mockListing, []));

      let bookingId: string | null = null;
      await act(async () => {
        bookingId = await result.current.submit();
      });

      expect(bookingId).toBe('booking-new');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
