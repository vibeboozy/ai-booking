import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFavorites } from '@/modules/profile/hooks/useFavorites';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('возвращает пустой Set если initialFavoriteIds не передан', async () => {
      // Мокаем начальный fetch который происходит при монтировании
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useFavorites());

      // Ждем завершения начального fetch
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.favoriteIds).toEqual(new Set());
    });

    it('использует initialFavoriteIds если передан', () => {
      const initialIds = new Set(['listing-1', 'listing-2']);
      const { result } = renderHook(() =>
        useFavorites({ initialFavoriteIds: initialIds }),
      );
      expect(result.current.favoriteIds).toEqual(initialIds);
    });

    it('isLoading false когда есть initialFavoriteIds', () => {
      const initialIds = new Set(['listing-1']);
      const { result } = renderHook(() =>
        useFavorites({ initialFavoriteIds: initialIds }),
      );
      expect(result.current.isLoading).toBe(false);
    });

    it('isOptimistic возвращает false для нового listing', () => {
      const { result } = renderHook(() => useFavorites());
      expect(result.current.isOptimistic('any-id')).toBe(false);
    });
  });

  describe('toggle', () => {
    it('добавляет listingId в favoriteIds при toggle (POST запрос)', async () => {
      // Мокаем начальный fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useFavorites());

      // Ждем завершения начального fetch
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Мокаем POST запрос
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      await act(async () => {
        await result.current.toggle('listing-123');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: 'listing-123' }),
      });

      expect(result.current.favoriteIds.has('listing-123')).toBe(true);
    });

    it('удаляет listingId из favoriteIds при toggle (DELETE запрос)', async () => {
      const initialIds = new Set(['listing-123']);

      // Мокаем DELETE запрос
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { result } = renderHook(() =>
        useFavorites({ initialFavoriteIds: initialIds }),
      );

      await act(async () => {
        await result.current.toggle('listing-123');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/favorites/listing-123', {
        method: 'DELETE',
      });

      expect(result.current.favoriteIds.has('listing-123')).toBe(false);
    });

    it('вызывает onError при неудачном POST', async () => {
      // Мокаем начальный fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      const onError = vi.fn();
      const { result } = renderHook(() => useFavorites({ onError }));

      // Ждем завершения начального fetch
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Мокаем неудачный POST
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await act(async () => {
        await result.current.toggle('listing-123');
      });

      expect(onError).toHaveBeenCalledWith('Ошибка при добавлении в избранное');
    });

    it('вызывает onError при неудачном DELETE', async () => {
      const initialIds = new Set(['listing-123']);
      const onError = vi.fn();

      // Мокаем неудачный DELETE
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() =>
        useFavorites({ initialFavoriteIds: initialIds, onError }),
      );

      await act(async () => {
        await result.current.toggle('listing-123');
      });

      expect(onError).toHaveBeenCalledWith('Ошибка при удалении из избранного');
    });
  });

  describe('rollback на ошибку', () => {
    it('восстанавливает состояние при ошибке POST (add)', async () => {
      // Мокаем начальный fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Мокаем ошибку POST
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await result.current.toggle('listing-123');
      });

      // Должен восстановить исходное состояние (empty set)
      expect(result.current.favoriteIds.has('listing-123')).toBe(false);
    });

    it('восстанавливает состояние при ошибке DELETE (remove)', async () => {
      const initialIds = new Set(['listing-123']);

      // Мокаем ошибку DELETE
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() =>
        useFavorites({ initialFavoriteIds: initialIds }),
      );

      await act(async () => {
        await result.current.toggle('listing-123');
      });

      // Должен восстановить исходное состояние (с listing-123)
      expect(result.current.favoriteIds.has('listing-123')).toBe(true);
    });
  });

  describe('isOptimistic', () => {
    it('возвращает true для listingId в процессе обновления', async () => {
      // Мокаем начальный fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Мокаем POST запрос, но не резолвим его сразу
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            // Не резолвим сразу - оставляем promise pending
          }),
      );

      let togglePromise: Promise<void>;
      await act(async () => {
        togglePromise = result.current.toggle('listing-123');
      });

      // Проверяем что optimistic активен пока запрос в процессе
      // Используем waitFor т.к. состояние может обновиться асинхронно
      await waitFor(() => {
        expect(result.current.isOptimistic('listing-123')).toBe(true);
      });

      // Резолвим запрос чтобы завершить тест
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });
    });
  });

  describe('fetch favorites on mount', () => {
    it('не делает fetch если initialFavoriteIds не пустой', () => {
      const initialIds = new Set(['listing-1']);
      renderHook(() => useFavorites({ initialFavoriteIds: initialIds }));

      // Не мокаем fetch - если initialFavoriteIds не пустой, fetch не должен вызываться
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('делает fetch если initialFavoriteIds пустой', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ id: 'listing-1' }, { id: 'listing-2' }],
        }),
      });

      renderHook(() => useFavorites());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/profile/favorites');
      });
    });

    it('обрабатывает ошибку fetch gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderHook(() => useFavorites());

      // Должен не упасть
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });
});
