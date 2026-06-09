/**
 * ANCHOR: reviews
 * PURPOSE: Interactive/display star rating (1-5).
 * Dependencies: none.
 * CRITICAL: Exported to ReviewForm, RatingBadge, ListingCard; aria-label="Rate N stars".
 *
 * DO:
 * - Support readonly mode for display
 * DONT:
 * - Use images without accessible labels
 */

'use client';

type StarRatingProps = {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function StarRating(_props: StarRatingProps) {
  return null;
}
