/**
 * ANCHOR: listing
 * PURPOSE: Интерактивная карта с маркером объекта на основе react-leaflet + OpenStreetMap.
 * Dependencies: react-leaflet, leaflet (client-side only).
 *
 * DO:
 * - SSR-safe (dynamic import)
 * - Responsive, single marker
 * - OpenStreetMap tiles (без API ключа)
 * DONT:
 * - Использовать Mapbox или другие платные карты
 */

'use client';

import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

type ListingMapProps = {
  lat: number;
  lng: number;
  title: string;
};

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-400">Загрузка карты...</div>
    </div>
  ),
});

export function ListingMap({ lat, lng, title }: ListingMapProps) {
  return (
    <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-gray-100 z-[10]">
      <LeafletMap lat={lat} lng={lng} title={title} />
      <div className="absolute bottom-3 right-3 bg-white/90 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md flex items-center gap-1.5 z-[1000] pointer-events-none">
        <MapPin className="w-4 h-4 text-blue-600" />
        <span className="text-gray-700">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
