/**
 * ANCHOR: reviews
 * PURPOSE: Unit tests for RatingBadge component
 * DEPENDS: RatingBadge
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RatingBadge } from '@/modules/reviews/components/RatingBadge';

describe('RatingBadge', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('renders star icon', () => {
      render(<RatingBadge averageRating={4.5} reviewCount={10} />);
      const starIcon = document.querySelector('svg[aria-hidden="true"]');
      expect(starIcon).toBeInTheDocument();
    });

    it('displays rating value formatted to 1 decimal', () => {
      render(<RatingBadge averageRating={4.567} reviewCount={10} />);
      expect(screen.getByText('4.6')).toBeInTheDocument();
    });

    it('displays review count in parentheses', () => {
      render(<RatingBadge averageRating={4.5} reviewCount={25} />);
      expect(screen.getByText('(25)')).toBeInTheDocument();
    });

    it('does not display count when showCount is false', () => {
      render(<RatingBadge averageRating={4.5} reviewCount={25} showCount={false} />);
      const countElement = screen.queryByText(/\(\d+\)/);
      expect(countElement).not.toBeInTheDocument();
    });

    it('displays "New" when averageRating is 0', () => {
      render(<RatingBadge averageRating={0} reviewCount={0} />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('does not display count when rating is 0', () => {
      render(<RatingBadge averageRating={0} reviewCount={0} />);
      const countElement = screen.queryByText(/\(\d+\)/);
      expect(countElement).not.toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('applies sm size classes', () => {
      render(<RatingBadge averageRating={4.5} reviewCount={10} size="sm" />);
      const container = screen.getByLabelText(/Рейтинг.*на основе.*отзывов/);
      expect(container).toHaveClass('text-sm');
    });

    it('applies md size classes by default', () => {
      render(<RatingBadge averageRating={4.5} reviewCount={10} />);
      const container = screen.getByLabelText(/Рейтинг.*на основе.*отзывов/);
      expect(container).toHaveClass('text-base');
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label with rating', () => {
      render(<RatingBadge averageRating={4.5} reviewCount={10} />);
      const container = screen.getByLabelText('Рейтинг 4.5 из 5 на основе 10 отзывов');
      expect(container).toBeInTheDocument();
    });

    it('has correct aria-label when no reviews', () => {
      render(<RatingBadge averageRating={0} reviewCount={0} />);
      const container = screen.getByLabelText('Пока нет отзывов');
      expect(container).toBeInTheDocument();
    });
  });
});