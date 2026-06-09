/**
 * ANCHOR: listing
 * PURPOSE: Mapbox-карта с маркером объекта (lat/lng).
 * Dependencies: react-map-gl, NEXT_PUBLIC_MAPBOX_TOKEN.
 * CRITICAL: Static image fallback если token отсутствует.
 *
 * DO:
 * - Responsive height, single marker
 * DONT:
 * - Expose Mapbox secret server-side token to client
 */

type ListingMapProps = {
  lat: number;
  lng: number;
  title: string;
};

export function ListingMap(_props: ListingMapProps) {
  return null;
}
