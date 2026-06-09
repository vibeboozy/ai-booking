/**
 * ANCHOR: reviews
 * PURPOSE: Route /profile/trips/[bookingId]/review — форма отзыва.
 * Dependencies: ReviewForm, @/lib/auth, booking eligibility check.
 * CRITICAL: Only completed booking without existing review.
 */

type ReviewPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function ReviewPage(_props: ReviewPageProps) {
  return (
    <main>
      <h1>Оставить отзыв</h1>
      {/* TODO: <ReviewForm bookingId={...} /> */}
    </main>
  );
}
