/**
 * ANCHOR: reviews
 * PURPOSE: Unit tests for StarRating component
 * DEPENDS: StarRating
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { StarRating } from '@/modules/reviews/components/StarRating';

describe('StarRating', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('renders 5 star buttons', () => {
      render(<StarRating value={0} onChange={vi.fn()} />);
      const stars = screen.getAllByRole('button');
      expect(stars).toHaveLength(5);
    });

    it('renders with correct filled stars for value 3', () => {
      render(<StarRating value={3} onChange={vi.fn()} />);
      const stars = screen.getAllByRole('button');

      // First 3 should be yellow (filled)
      expect(stars[0].querySelector('svg')).toHaveClass('text-yellow-400');
      expect(stars[1].querySelector('svg')).toHaveClass('text-yellow-400');
      expect(stars[2].querySelector('svg')).toHaveClass('text-yellow-400');

      // Last 2 should be gray (empty)
      expect(stars[3].querySelector('svg')).toHaveClass('text-gray-300');
      expect(stars[4].querySelector('svg')).toHaveClass('text-gray-300');
    });

    it('renders with all empty stars when value is 0', () => {
      render(<StarRating value={0} onChange={vi.fn()} />);
      const stars = screen.getAllByRole('button');
      stars.forEach((star) => {
        expect(star.querySelector('svg')).toHaveClass('text-gray-300');
      });
    });

    it('renders with all filled stars when value is 5', () => {
      render(<StarRating value={5} onChange={vi.fn()} />);
      const stars = screen.getAllByRole('button');
      stars.forEach((star) => {
        expect(star.querySelector('svg')).toHaveClass('text-yellow-400');
      });
    });
  });

  describe('Interaction', () => {
    it('calls onChange when star is clicked', () => {
      const onChange = vi.fn();
      render(<StarRating value={0} onChange={onChange} />);

      const stars = screen.getAllByRole('button');
      fireEvent.click(stars[2]); // Click 3rd star (value 3)

      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('calls onChange with correct value for each star', () => {
      const onChange = vi.fn();
      render(<StarRating value={0} onChange={onChange} />);

      const stars = screen.getAllByRole('button');

      fireEvent.click(stars[0]);
      expect(onChange).toHaveBeenLastCalledWith(1);

      fireEvent.click(stars[4]);
      expect(onChange).toHaveBeenLastCalledWith(5);
    });
  });

  describe('Readonly mode', () => {
    it('renders in readonly mode', () => {
      render(<StarRating value={3} readonly />);
      // In readonly mode, role is "img" not "radiogroup"
      const container = screen.getByRole('img');
      expect(container).toBeInTheDocument();
    });

    it('does not call onChange when clicked in readonly mode', () => {
      const onChange = vi.fn();
      render(<StarRating value={3} onChange={onChange} readonly />);

      const stars = screen.getAllByRole('button');
      fireEvent.click(stars[2]);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('buttons are disabled in readonly mode', () => {
      render(<StarRating value={3} readonly />);
      const stars = screen.getAllByRole('button');
      stars.forEach((star) => {
        expect(star).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label when rating selected', () => {
      render(<StarRating value={3} onChange={vi.fn()} />);
      const container = screen.getByRole('radiogroup');
      expect(container).toHaveAttribute(
        'aria-label',
        'Оцените от 1 до 5 звёзд. Выбрано: 3 звезды',
      );
    });

    it('has correct aria-label when no rating selected', () => {
      render(<StarRating value={0} onChange={vi.fn()} />);
      const container = screen.getByRole('radiogroup');
      expect(container).toHaveAttribute(
        'aria-label',
        'Оцените от 1 до 5 звёзд. Выбрано: не выбрано',
      );
    });

    it('has aria-label on each star button', () => {
      render(<StarRating value={0} onChange={vi.fn()} />);
      expect(screen.getByLabelText('1 звезда')).toBeInTheDocument();
      expect(screen.getByLabelText('2 звезды')).toBeInTheDocument();
      expect(screen.getByLabelText('3 звезды')).toBeInTheDocument();
      expect(screen.getByLabelText('4 звезды')).toBeInTheDocument();
      expect(screen.getByLabelText('5 звёзд')).toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('applies sm size classes', () => {
      render(<StarRating value={3} size="sm" />);
      const star = screen.getAllByRole('button')[0];
      expect(star.querySelector('svg')).toHaveClass('w-4', 'h-4');
    });

    it('applies md size classes by default', () => {
      render(<StarRating value={3} />);
      const star = screen.getAllByRole('button')[0];
      expect(star.querySelector('svg')).toHaveClass('w-5', 'h-5');
    });

    it('applies lg size classes', () => {
      render(<StarRating value={3} size="lg" />);
      const star = screen.getAllByRole('button')[0];
      expect(star.querySelector('svg')).toHaveClass('w-7', 'h-7');
    });
  });
});
