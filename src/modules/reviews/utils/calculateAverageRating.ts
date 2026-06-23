/**
 * ANCHOR: reviews
 * PURPOSE: Агрегация среднего рейтинга (1 decimal).
 * Dependencies: none.
 * CRITICAL: Used on review create/delete to update Listing.averageRating.
 *
 * DO:
 * - Return 0 for empty array
 * DONT:
 * - AVG() on every search query
 */

export function calculateAverageRating(ratings: number[]): number {
  if (!ratings || ratings.length === 0) {
    return 0;
  }

  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  const average = sum / ratings.length;

  // Round to 1 decimal place
  return Math.round(average * 10) / 10;
}
