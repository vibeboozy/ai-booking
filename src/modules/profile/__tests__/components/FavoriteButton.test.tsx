import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FavoriteButton, FavoriteButtonWithAuth } from '@/modules/profile/components/FavoriteButton';
import * as nextNavigation from 'next/navigation';

// Mock next/navigation
const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
};
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock cn utility
vi.mock('@/shared/utils/cn', () => ({
  cn: (...args: (string | undefined)[]) => args.filter(Boolean).join(' '),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FavoriteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('базовый рендеринг', () => {
    it('рендерит кнопку с heart иконкой', () => {
      render(<FavoriteButton listingId="listing-123" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('рендерит с data-testid="favorite-toggle"', () => {
      render(<FavoriteButton listingId="listing-123" />);
      const button = screen.getByTestId('favorite-toggle');
      expect(button).toBeInTheDocument();
    });

    it('имеет правильный aria-label когда НЕ в избранном', () => {
      render(<FavoriteButton listingId="listing-123" initialFavorited={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Добавить в избранное');
    });

    it('имеет правильный aria-label когда В избранном', () => {
      render(<FavoriteButton listingId="listing-123" initialFavorited={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Удалить из избранного');
    });
  });

  describe('toggle логика', () => {
    it('добавляет в избранное (POST запрос) когда не в избранном', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<FavoriteButton listingId="listing-123" initialFavorited={false} />);
      const button = screen.getByTestId('favorite-toggle');

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: 'listing-123' }),
        });
      });
    });

    it('удаляет из избранного (DELETE запрос) когда в избранном', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<FavoriteButton listingId="listing-123" initialFavorited={true} />);
      const button = screen.getByTestId('favorite-toggle');

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/favorites/listing-123', {
          method: 'DELETE',
        });
      });
    });

    it('вызывает router.refresh() при успешном запросе', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<FavoriteButton listingId="listing-123" initialFavorited={false} />);
      fireEvent.click(screen.getByTestId('favorite-toggle'));

      await waitFor(() => {
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });
  });

  describe('обработка ошибок', () => {
    it('показывает ошибку при неудачном запросе', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<FavoriteButton listingId="listing-123" initialFavorited={false} />);
      fireEvent.click(screen.getByTestId('favorite-toggle'));

      await waitFor(() => {
        const errorDiv = screen.getByText('Ошибка при обновлении избранного');
        expect(errorDiv).toBeInTheDocument();
      });
    });

    it('редиректит на логин при 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      // Mock window.location
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { pathname: '/listings/123' },
        writable: true,
      });

      render(<FavoriteButton listingId="listing-123" initialFavorited={false} />);
      fireEvent.click(screen.getByTestId('favorite-toggle'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login?callbackUrl=%2Flistings%2F123');
      });

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });
  });

  describe('предотвращение двойного клика', () => {
    it('не выполняет повторный запрос во время загрузки', async () => {
      let resolvePromise: (value: Response) => void;
      mockFetch.mockImplementationOnce(() => new Promise(resolve => {
        resolvePromise = resolve;
      }));

      render(<FavoriteButton listingId="listing-123" initialFavorited={false} />);
      const button = screen.getByTestId('favorite-toggle');

      fireEvent.click(button);
      fireEvent.click(button); // Второй клик во время загрузки

      // fetch должен быть вызван только один раз
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Разрезолвим запрос
      resolvePromise!({ ok: true, status: 200 } as Response);
    });
  });
});

describe('FavoriteButtonWithAuth', () => {
  it('рендерит ссылку на логин когда не авторизован', () => {
    render(<FavoriteButtonWithAuth listingId="listing-123" isAuthenticated={false} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/login?callbackUrl=%2Flistings%2Flisting-123');
  });

  it('рендерит FavoriteButton когда авторизован', () => {
    render(<FavoriteButtonWithAuth listingId="listing-123" isAuthenticated={true} />);
    const button = screen.getByTestId('favorite-toggle');
    expect(button).toBeInTheDocument();
  });
});