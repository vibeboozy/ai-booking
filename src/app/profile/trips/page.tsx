/**
 * ANCHOR: profile
 * PURPOSE: Route /profile/trips — upcoming и history поездок.
 * Dependencies: TripsList, @/lib/auth.
 * CRITICAL: Auth required; canReview links to review form.
 */

type ProfileTripsPageProps = {
  searchParams: Promise<{ status?: string; success?: string }>;
};

export default async function ProfileTripsPage(_props: ProfileTripsPageProps) {
  return (
    <main>
      <h1>Мои поездки</h1>
      {/* TODO: <TripsList /> */}
    </main>
  );
}
