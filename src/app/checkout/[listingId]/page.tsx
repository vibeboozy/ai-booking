/**
 * ANCHOR: booking
 * PURPOSE: Route /checkout/[listingId] — процесс бронирования.
 * Dependencies: CheckoutForm, @/lib/auth (auth guard).
 * CRITICAL: Auth required; redirect to login with callbackUrl.
 *
 * DO:
 * - Middleware or page-level auth check
 * DONT:
 * - Allow checkout without session
 */

type CheckoutPageProps = {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutPage(_props: CheckoutPageProps) {
  return (
    <main>
      <h1>Бронирование</h1>
      {/* TODO: <CheckoutForm listingId={...} /> */}
    </main>
  );
}
