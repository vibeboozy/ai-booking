/**
 * ANCHOR: booking
 * PURPOSE: Route /checkout/[listingId] — процесс бронирования.
 * Dependencies: CheckoutForm, @/lib/auth (auth guard), getListingById.
 * CRITICAL: Auth required; redirect to login with callbackUrl.
 *
 * DO:
 * - Middleware or page-level auth check
 * DONT:
 * - Allow checkout without session
 */

import { notFound } from 'next/navigation';
import { getListingById } from '@/modules/listing/listing.repository';
import { CheckoutForm } from '@/modules/booking/components/CheckoutForm';

type CheckoutPageProps = {
  params: Promise<{ listingId: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { listingId } = await params;
  const listing = await getListingById(listingId);

  if (!listing) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Бронирование</h1>
      <CheckoutForm listing={listing} />
    </main>
  );
}
