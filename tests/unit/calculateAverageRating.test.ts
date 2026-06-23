/**
 * ANCHOR: reviews
 * PURPOSE: Unit-тесты calculateAverageRating — проверка вычисления среднего рейтинга.
 */

import { describe, it, expect } from 'vitest';
import { calculateAverageRating } from '@/modules/reviews/utils/calculateAverageRating';

describe('calculateAverageRating', () => {
  describe('Basic calculations', () => {
    it('calculates average of single rating', () => {
      expect(calculateAverageRating([5])).toBe(5);
    });

    it('calculates average of two ratings', () => {
      expect(calculateAverageRating([4, 5])).toBe(4.5);
    });

    it('calculates average of multiple ratings', () => {
      expect(calculateAverageRating([5, 4, 3, 5, 3])).toBe(4);
    });

    it('rounds to 1 decimal place', () => {
      expect(calculateAverageRating([5, 4, 4, 4, 3])).toBe(4);
      expect(calculateAverageRating([5, 5, 4, 4, 3])).toBe(4.2);
      expect(calculateAverageRating([5, 5, 5, 4, 3])).toBe(4.4);
    });
  });

  describe('Edge cases', () => {
    it('returns 0 for empty array', () => {
      expect(calculateAverageRating([])).toBe(0);
    });

    it('returns 0 when passed null/undefined', () => {
      // @ts-expect-error - testing edge case
      expect(calculateAverageRating(null)).toBe(0);
      // @ts-expect-error - testing edge case
      expect(calculateAverageRating(undefined)).toBe(0);
    });

    it('handles all same ratings', () => {
      expect(calculateAverageRating([3, 3, 3, 3, 3])).toBe(3);
      expect(calculateAverageRating([5, 5, 5])).toBe(5);
      expect(calculateAverageRating([1, 1, 1])).toBe(1);
    });

    it('handles minimum rating (1)', () => {
      expect(calculateAverageRating([1, 2, 3])).toBe(2);
    });

    it('handles maximum rating (5)', () => {
      expect(calculateAverageRating([5, 4, 5])).toBe(4.7);
    });
  });

  describe('Precision', () => {
    it('rounds down correctly', () => {
      // (5 + 4 + 4 + 4 + 4) / 5 = 4.2
      expect(calculateAverageRating([5, 4, 4, 4, 4])).toBe(4.2);
    });

    it('rounds up correctly', () => {
      // (5 + 5 + 5 + 5 + 4) / 5 = 4.8
      expect(calculateAverageRating([5, 5, 5, 5, 4])).toBe(4.8);
    });

    it('handles long decimal results', () => {
      // (4 + 4 + 4 + 5 + 5) / 5 = 4.4
      expect(calculateAverageRating([4, 4, 4, 5, 5])).toBe(4.4);
    });

    it('handles repeating decimals', () => {
      // (5 + 5 + 5 + 4 + 4) / 5 = 4.6
      expect(calculateAverageRating([5, 5, 5, 4, 4])).toBe(4.6);
    });
  });

  describe('Large datasets', () => {
    it('handles large number of ratings', () => {
      const manyFives = Array(100).fill(5);
      expect(calculateAverageRating(manyFives)).toBe(5);
    });

    it('handles mixed large dataset', () => {
      const mixed = [
        ...Array(50).fill(5),
        ...Array(30).fill(4),
        ...Array(20).fill(3),
      ];
      // (50*5 + 30*4 + 20*3) / 100 = (250 + 120 + 60) / 100 = 4.3
      expect(calculateAverageRating(mixed)).toBe(4.3);
    });
  });
});