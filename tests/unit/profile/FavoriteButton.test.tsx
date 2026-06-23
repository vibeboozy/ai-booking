/**
 * Unit tests for FavoriteButton component
 * Tests: rendering, optimistic UI, API calls, error handling, auth redirects
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import {
  FavoriteButton,
  FavoriteButtonWithAuth,
} from '@/modules/profile/components/FavoriteButton';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  default: { push: vi.fn(), refresh: vi.fn() },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FAVORITE_BUTTON', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('Rendering', () => {
    it('should render favorite toggle button with data-testid', () => {
      render(<FavoriteButton listingId="test-listing" />);
      expect(screen.getByTestId('favorite-toggle')).toBeInTheDocument();
    });

    it('should render heart icon (SVG)', () => {
      render(<FavoriteButton listingId="test-listing" />);
      const button = screen.getByTestId('favorite-toggle');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with label when showLabel is true', () => {
      render(<FavoriteButton listingId="test-listing" showLabel />);
      expect(screen.getByText('Добавить в избранное')).toBeInTheDocument();
    });

    it('should render "В избранном" when initialFavorited is true and showLabel is true', () => {
      render(
        <FavoriteButton listingId="test-listing" initialFavorited showLabel />,
      );
      expect(screen.getByText('В избранном')).toBeInTheDocument();
    });

    it('should apply correct size classes for sm size', () => {
      render(<FavoriteButton listingId="test-listing" size="sm" showLabel />);
      const svg = screen.getByTestId('favorite-toggle').querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
    });

    it('should apply correct size classes for md size', () => {
      render(<FavoriteButton listingId="test-listing" size="md" showLabel />);
      const svg = screen.getByTestId('favorite-toggle').querySelector('svg');
      expect(svg).toHaveClass('h-5', 'w-5');
    });

    it('should have correct aria-label when not favorited', () => {
      render(<FavoriteButton listingId="test-listing" />);
      expect(screen.getByTestId('favorite-toggle')).toHaveAttribute(
        'aria-label',
        'Добавить в избранное',
      );
    });

    it('should have correct aria-label when favorited', () => {
      render(<FavoriteButton listingId="test-listing" initialFavorited />);
      expect(screen.getByTestId('favorite-toggle')).toHaveAttribute(
        'aria-label',
        'Удалить из избранного',
      );
    });
  });

  describe('Optimistic UI', () => {
    it('should optimistically update UI when clicking to add to favorites', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<FavoriteButton listingId="test-listing" showLabel />);

      const button = screen.getByTestId('favorite-toggle');
      await user.click(button);

      expect(screen.getByText('В избранном')).toBeInTheDocument();
    });

    it('should optimistically update UI when clicking to remove from favorites', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(
        <FavoriteButton listingId="test-listing" initialFavorited showLabel />,
      );

      const button = screen.getByTestId('favorite-toggle');
      await user.click(button);

      expect(screen.getByText('Добавить в избранное')).toBeInTheDocument();
    });
  });

  describe('API calls', () => {
    it('should call POST /api/favorites when adding to favorites', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<FavoriteButton listingId="test-listing" />);

      const button = screen.getByTestId('favorite-toggle');
      await user.click(button);

      expect(mockFetch).toHaveBeenCalledWith('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: 'test-listing' }),
      });
    });

    it('should call DELETE /api/favorites/[listingId] when removing from favorites', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<FavoriteButton listingId="test-listing" initialFavorited />);

      const button = screen.getByTestId('favorite-toggle');
      await user.click(button);

      expect(mockFetch).toHaveBeenCalledWith('/api/favorites/test-listing', {
        method: 'DELETE',
      });
    });

    it('should call router.refresh() on successful API call', async () => {
      const user = userEvent.setup();
      const refreshMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({
        push: vi.fn(),
        refresh: refreshMock,
      } as unknown as ReturnType<typeof useRouter>);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<FavoriteButton listingId="test-listing" />);

      const button = screen.getByTestId('favorite-toggle');
      await user.click(button);

      await waitFor(() => {
        expect(refreshMock).toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    it('should rollback to previous state on API error', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<FavoriteButton listingId="test-listing" showLabel />);

      const button = screen.getByTestId('favorite-toggle');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Добавить в избранное')).toBeInTheDocument();
      });
    });

    it('should display error message on API failure', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<FavoriteButton listingId="test-listing" />);

      const button = screen.getByTestId('favorite-toggle');
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText('Ошибка при обновлении избранного'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading state', () => {
    it('should apply disabled styling class', () => {
      render(<FavoriteButton listingId="test-listing" />);
      const button = screen.getByTestId('favorite-toggle');
      expect(button).toHaveClass(
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
      );
    });
  });

  describe('Auth redirect', () => {
    it('should redirect to login on 401 response', async () => {
      const user = userEvent.setup();
      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
        refresh: vi.fn(),
      } as unknown as ReturnType<typeof useRouter>);

      mockFetch.mockResolvedValueOnce({
        status: 401,
      });

      Object.defineProperty(window, 'location', {
        value: { pathname: '/listings/test-listing' },
        writable: true,
      });

      render(<FavoriteButton listingId="test-listing" />);

      const button = screen.getByTestId('favorite-toggle');
      await user.click(button);

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith(
          '/login?callbackUrl=%2Flistings%2Ftest-listing',
        );
      });
    });
  });
});

describe('FAVORITE_BUTTON_WITH_AUTH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render FavoriteButton when isAuthenticated is true', () => {
    render(<FavoriteButtonWithAuth listingId="test-listing" isAuthenticated />);
    expect(screen.getByTestId('favorite-toggle')).toBeInTheDocument();
  });

  it('should render Link to login when isAuthenticated is false', () => {
    render(
      <FavoriteButtonWithAuth
        listingId="test-listing"
        isAuthenticated={false}
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      '/login?callbackUrl=%2Flistings%2Ftest-listing',
    );
    expect(link).toHaveAttribute(
      'aria-label',
      'Войдите, чтобы добавить в избранное',
    );
  });

  it('should show unfilled heart icon when not authenticated', () => {
    render(
      <FavoriteButtonWithAuth
        listingId="test-listing"
        isAuthenticated={false}
      />,
    );
    const link = screen.getByRole('link');
    const svg = link.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
  });
});
