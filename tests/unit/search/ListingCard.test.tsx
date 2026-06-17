/**
 * Unit tests for ListingCard component (LISTING_CARD)
 * SC-FEAT-007-001: ListingCard рендерит изображение
 * SC-FEAT-007-002: ListingCard рендерит цену
 * SC-FEAT-007-003: ListingCard содержит data-testid
 * SC-FEAT-007-004: ListingCard ссылается на /listings/[id]
 * SC-FEAT-007-005: ListingCard обрабатывает пустой images массив
 * SC-FEAT-007-010: Проверка лог-маркеров для LISTING_CARD
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import type { ListingPreview } from '@/shared/types/listing';
import type { ReadonlyURLSearchParams } from 'next/navigation';

import { ListingCard } from '@/modules/search/components/ListingCard';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

const mockListing: ListingPreview = {
  id: 'clx123abc',
  title: 'Уютная квартира',
  city: 'Москва',
  country: 'Россия',
  pricePerNight: 350000,
  images: ['https://example.com/img.jpg'],
  averageRating: 4.8,
  reviewCount: 23,
  propertyType: 'apartment',
};

describe('LISTING_CARD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReadonlyURLSearchParams,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  const getLogCalls = (): unknown[][] => {
    return (console.log as unknown as { mock: { calls: unknown[][] } }).mock
      .calls;
  };

  describe('SC-FEAT-007-001: ListingCard рендерит изображение', () => {
    it('should render image from listing.images[0]', () => {
      render(<ListingCard listing={mockListing} />);
      const link = screen.getByTestId('listing-card');
      expect(link).toBeInTheDocument();
      expect(link.querySelector('img')).toBeTruthy();
    });
  });

  describe('SC-FEAT-007-002: ListingCard рендерит цену', () => {
    it('should display price formatted as "3 500 ₽"', () => {
      const { unmount } = render(<ListingCard listing={mockListing} />);
      expect(screen.getAllByText('3 500 ₽')[0]).toBeInTheDocument();
      expect(screen.getAllByText('/ ночь')[0]).toBeInTheDocument();
      unmount();
    });
  });

  describe('SC-FEAT-007-003: ListingCard содержит data-testid', () => {
    it('should have data-testid="listing-card" attribute', () => {
      const { unmount } = render(<ListingCard listing={mockListing} />);
      expect(screen.getByTestId('listing-card')).toBeInTheDocument();
      unmount();
    });
  });

  describe('SC-FEAT-007-004: ListingCard ссылается на /listings/[id]', () => {
    it('should link to /listings/clx123abc', () => {
      const { unmount } = render(<ListingCard listing={mockListing} />);
      const link = screen.getByTestId('listing-card');
      expect(link).toHaveAttribute('href', '/listings/clx123abc');
      unmount();
    });

    it('should preserve search params in link', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams({
          city: 'Москва',
        }) as unknown as ReadonlyURLSearchParams,
      );

      const { unmount } = render(<ListingCard listing={mockListing} />);
      const link = screen.getByTestId('listing-card');
      expect(link).toHaveAttribute(
        'href',
        '/listings/clx123abc?city=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0',
      );
      unmount();
    });
  });

  describe('SC-FEAT-007-005: ListingCard обрабатывает пустой images массив', () => {
    it('should not crash when images is empty array', () => {
      const listingNoImages: ListingPreview = { ...mockListing, images: [] };
      const { unmount } = render(<ListingCard listing={listingNoImages} />);
      unmount();
    });

    it('should render placeholder when images is empty', () => {
      const listingNoImages: ListingPreview = { ...mockListing, images: [] };
      const { unmount } = render(<ListingCard listing={listingNoImages} />);
      expect(screen.getByTestId('listing-card')).toBeInTheDocument();
      unmount();
    });
  });

  describe('SC-FEAT-007-010: Проверка лог-маркеров для LISTING_CARD', () => {
    it('should log ENTRY marker', () => {
      const { unmount } = render(<ListingCard listing={mockListing} />);
      const logCalls = getLogCalls();
      const hasEntryLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('[search][ListingCard][LISTING_CARD][ENTRY]'),
      );
      expect(hasEntryLog).toBe(true);
      unmount();
    });

    it('should log EXIT marker', () => {
      const { unmount } = render(<ListingCard listing={mockListing} />);
      const logCalls = getLogCalls();
      const hasExitLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('[search][ListingCard][LISTING_CARD][EXIT]'),
      );
      expect(hasExitLog).toBe(true);
      unmount();
    });

    it('should log DECISION marker for images-empty', () => {
      const { unmount } = render(<ListingCard listing={mockListing} />);
      const logCalls = getLogCalls();
      const hasDecisionLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes(
            '[search][ListingCard][LISTING_CARD][DECISION][images-empty]',
          ),
      );
      expect(hasDecisionLog).toBe(true);
      unmount();
    });
  });

  describe('Property type display', () => {
    it('should display "Квартира" for apartment type', () => {
      const { unmount } = render(<ListingCard listing={mockListing} />);
      expect(screen.getAllByText('Квартира')[0]).toBeInTheDocument();
      unmount();
    });

    it('should display "Дом" for house type', () => {
      const houseListing: ListingPreview = {
        ...mockListing,
        propertyType: 'house',
      };
      const { unmount } = render(<ListingCard listing={houseListing} />);
      expect(screen.getAllByText('Дом')[0]).toBeInTheDocument();
      unmount();
    });

    it('should display "Комната" for room type', () => {
      const roomListing: ListingPreview = {
        ...mockListing,
        propertyType: 'room',
      };
      const { unmount } = render(<ListingCard listing={roomListing} />);
      expect(screen.getAllByText('Комната')[0]).toBeInTheDocument();
      unmount();
    });
  });

  describe('Rating display', () => {
    it('should display rating when averageRating > 0', () => {
      const { unmount } = render(<ListingCard listing={mockListing} />);
      expect(screen.getAllByText('★')[0]).toBeInTheDocument();
      expect(screen.getAllByText('4.8')[0]).toBeInTheDocument();
      expect(screen.getAllByText('(23)')[0]).toBeInTheDocument();
      unmount();
    });

    it('should not display rating when averageRating is 0', () => {
      const noRatingListing: ListingPreview = {
        ...mockListing,
        averageRating: 0,
      };
      const { unmount } = render(<ListingCard listing={noRatingListing} />);
      expect(screen.queryByText('★')).not.toBeInTheDocument();
      unmount();
    });
  });

  describe('Title and location display', () => {
    it('should display listing title', () => {
      const { unmount } = render(<ListingCard listing={mockListing} />);
      expect(
        screen.getAllByRole('heading', { level: 3 })[0],
      ).toBeInTheDocument();
      unmount();
    });

    it('should display city and country', () => {
      const { unmount } = render(<ListingCard listing={mockListing} />);
      expect(screen.getByText('Москва, Россия')).toBeInTheDocument();
      unmount();
    });
  });
});
