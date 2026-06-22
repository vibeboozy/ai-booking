/**
 * ANCHOR: reviews
 * PURPOSE: Badge среднего рейтинга + count для карточек и header listing.
 * Dependencies: StarRating (readonly).
 * CRITICAL: Uses denormalized Listing.averageRating — no live AVG query.
 *
 * DO:
 * - Export for search ListingCard and listing header
 * DONT:
 * - Fetch all reviews to compute average on card
 */

'use client';

import { cn } from '@/shared/utils/cn';

type RatingBadgeProps = {
  averageRating: number;
  reviewCount: number;
  showCount?: boolean;
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Badge displaying average rating with star icon and review count.
 * Uses denormalized Listing.averageRating for performance.
 */
export function RatingBadge({
  averageRating,
  reviewCount,
  showCount = true,
  size = 'md',
  className,
}: RatingBadgeProps) {
  const isZeroRating = averageRating === 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5',
        size === 'sm' ? 'text-sm' : 'text-base',
        className,
      )}
      aria-label={
        isZeroRating
          ? 'Пока нет отзывов'
          : `Рейтинг ${averageRating.toFixed(1)} из 5 на основе ${reviewCount} отзывов`
      }
    >
      {/* Star icon */}
      <svg
        className={cn(
          'text-red-500',
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
        )}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
          clipRule="evenodd"
        />
      </svg>

      {/* Rating value */}
      <span className="font-medium text-gray-900">
        {isZeroRating ? 'New' : averageRating.toFixed(1)}
      </span>

      {/* Review count */}
      {showCount && (
        <span className="text-gray-500">
          {isZeroRating ? '' : `(${reviewCount})`}
        </span>
      )}
    </div>
  );
}
