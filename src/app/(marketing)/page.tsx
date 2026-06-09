/**
 * ANCHOR: search
 * PURPOSE: Route / — главная страница с SearchBar.
 * Dependencies: @/modules/search (SearchBar).
 * CRITICAL: SSR; form submit navigates to /search with URL params.
 *
 * DO:
 * - Compose SearchBar from search module
 * DONT:
 * - Implement search logic inline in page
 */

export default function HomePage() {
  return (
    <main>
      <h1>TripVibe</h1>
      {/* TODO: <SearchBar /> */}
    </main>
  );
}
