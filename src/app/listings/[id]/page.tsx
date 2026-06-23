/**
 * ANCHOR: listing
 * PURPOSE: Route /listings/[id] — страница объекта.
 * Dependencies: listing module components, profile FavoriteButton, reviews ReviewList.
 * CRITICAL: generateMetadata for SEO; pre-fill dates from URL.
 *
 * DO:
 * - Server fetch ListingDetail
 * DONT:
 * - Fetch listing in client-only useEffect without RSC initial data
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { getListingById } from '@/modules/listing/listing.repository';
import { isFavorited } from '@/modules/profile/profile.repository';
import { ImageGallery } from '@/modules/listing/components/ImageGallery';
import { ListingDetails } from '@/modules/listing/components/ListingDetails';
import { ListingMap } from '@/modules/listing/components/ListingMap';
import { AIConcierge } from '@/modules/listing/components/AIConcierge';
import { ListingDateSelector } from '@/modules/listing/components/ListingDateSelector';
import { ReviewList } from '@/modules/reviews/components/ReviewList';

type ListingPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return { title: 'Объект не найден' };
  }

  return {
    title: `${listing.title} — ${listing.city}, ${listing.country} | TripVibe`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
      images: listing.images[0] ? [listing.images[0]] : [],
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const session = await auth();

  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const initialFavorited = session?.user?.id
    ? await isFavorited(session.user.id, listing.id)
    : false;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <ImageGallery images={listing.images} title={listing.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ListingDetails
            listing={listing}
            initialFavorited={initialFavorited}
          />
          <ListingMap
            lat={listing.lat}
            lng={listing.lng}
            title={listing.title}
          />
        </div>

        <div className="space-y-6">
          <ListingDateSelector listingId={listing.id} />
          <AIConcierge listingId={listing.id} />
        </div>
      </div>

      {/* Reviews section */}
      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-xl font-semibold mb-4">
          Отзывы
        </h2>
        <ReviewList listingId={listing.id} currentUserId={session?.user?.id} />
      </section>
    </main>
  );
}
