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

type RatingBadgeProps = {
  averageRating: number;
  reviewCount: number;
};

export function RatingBadge(_props: RatingBadgeProps) {
  return null;
}
