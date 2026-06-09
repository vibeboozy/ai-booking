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

type ListingPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ListingPage(_props: ListingPageProps) {
  return (
    <main>
      <h1>Объект</h1>
      {/* TODO: ImageGallery, ListingDetails, ListingMap, AvailabilityCalendar, AIConcierge */}
    </main>
  );
}
