import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTrips } from '@/modules/profile/hooks/useTrips';
import type { Trip } from '@/modules/profile/types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Пример данных trip
const mockTrips: Trip[] = [
  {
    booking: {
      id: 'booking-1',
      userId: 'user-1',
      listingId: 'listing-1',
      checkIn: '2026-07-01',
      checkOut: '2026-07-05',
      guests: 2,
      totalPrice: 500,
      status: 'confirmed',
      createdAt: '2026-06-01',
    },
    listing: {
      id: 'listing-1',
      title: 'Уютная квартира',
      city: 'Москва',
      country: 'Россия',
      pricePerNight: 125,
      images: ['/image1.jpg'],
      averageRating: 4.5,
      reviewCount: 10,
      propertyType: 'apartment',
    },
    canReview: false,
  },
];

describe('useTrips', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('initial state', () => {
    it('возвращает пустой массив trips при инициализации без данных', () => {
      const { result } = renderHook(() => useTrips());
      expect(result.current.trips).toEqual([]);
    });

    it('isLoading true когда нет initialTrips', () => {
      const { result } = renderHook(() => useTrips());
      expect(result.current.isLoading).toBe(true);
    });

    it('использует initialTrips если передан', () => {
      const { result } = renderHook(() => useTrips('upcoming', mockTrips));
      expect(result.current.trips).toEqual(mockTrips);
    });

    it('isLoading false когда есть initialTrips', () => {
      const { result } = renderHook(() => useTrips('upcoming', mockTrips));
      expect(result.current.isLoading).toBe(false);
    });

    it('error null при инициализации', () => {
      const { result } = renderHook(() => useTrips());
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetch trips', () => {
    it('вызывает fetch с правильным URL для upcoming', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockTrips }),
      });

      const { result } = renderHook(() => useTrips('upcoming'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/profile/trips?status=upcoming',
        );
      });
    });

    it('вызывает fetch с правильным URL для history', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useTrips('history'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/profile/trips?status=history',
        );
      });
    });

    it('вызывает fetch без параметров когда status не передан', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      renderHook(() => useTrips());

      await waitFor(() => {
        // URL может быть /api/profile/trips или /api/profile/trips? (с вопросительным знаком)
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(/^\/api\/profile\/trips\??$/),
        );
      });
    });

    it('устанавливает trips при успешном ответе', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockTrips }),
      });

      const { result } = renderHook(() => useTrips());

      await waitFor(() => {
        expect(result.current.trips).toEqual(mockTrips);
      });
    });

    it('isLoading false после успешного fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockTrips }),
      });

      const { result } = renderHook(() => useTrips());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('устанавливает error при неудачном ответе', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useTrips());

      await waitFor(() => {
        expect(result.current.error).toBe('Ошибка при загрузке поездок');
      });
    });

    it('устанавливает error при 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useTrips());

      await waitFor(() => {
        expect(result.current.error).toBe('Требуется авторизация');
      });
    });

    it('очищает trips при ошибке', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useTrips());

      await waitFor(() => {
        expect(result.current.trips).toEqual([]);
      });
    });

    it('isLoading false после ошибки', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useTrips());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('устанавливает ошибку при network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTrips());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });
  });

  describe('refetch', () => {
    it('refetch вызывает fetch заново', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useTrips());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockTrips }),
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.current.trips).toEqual(mockTrips);
    });

    it('refetch очищает предыдущую ошибку', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useTrips());

      await waitFor(() => {
        expect(result.current.error).toBe('Ошибка при загрузке поездок');
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('skip fetch с initialTrips', () => {
    it('не делает fetch если initialTrips передан', async () => {
      renderHook(() => useTrips('upcoming', mockTrips));

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    it('возвращает initialTrips сразу', () => {
      const { result } = renderHook(() => useTrips('upcoming', mockTrips));
      expect(result.current.trips).toEqual(mockTrips);
    });
  });
});
