/**
 * ANCHOR: reviews
 * PURPOSE: Paginated list отзывов на странице listing.
 * Dependencies: GET /api/listings/[id]/reviews.
 * CRITICAL: Author name masked (first name + last initial).
 *
 * DO:
 * - Paginate default 5 per page on listing
 * DONT:
 * - Expose full email in author field
 */

type ReviewListProps = {
  listingId: string;
  limit?: number;
};

export function ReviewList(_props: ReviewListProps) {
  return null;
}
