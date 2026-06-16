/**
 * ANCHOR: listing
 * PURPOSE: Блок описания объекта: title, amenities, host, price preview.
 * Dependencies: @/modules/listing/types, @/shared/utils/formatPrice.
 *
 * DO:
 * - Pre-fill dates from URL search params
 * DONT:
 * - Inline price calculation (use booking module)
 */

import Image from 'next/image';
import { User, Wifi, Car, Utensils } from 'lucide-react';
import type { ListingDetail } from '@/modules/listing/types';
import { formatPrice } from '@/shared/utils/formatPrice';

type ListingDetailsProps = {
  listing: ListingDetail;
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi size={16} />,
  kitchen: <Utensils size={16} />,
  parking: <Car size={16} />,
};

export function ListingDetails({ listing }: ListingDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{listing.title}</h1>
        <div className="flex items-center gap-2 text-gray-600 mt-1">
          <span>
            {listing.city}, {listing.country}
          </span>
          {listing.averageRating > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <span>★</span>
                <span>{listing.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({listing.reviewCount})</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
          {listing.host.avatarUrl ? (
            <Image
              src={listing.host.avatarUrl}
              alt={listing.host.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User size={24} />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">Хозяин: {listing.host.name}</p>
          <p className="text-sm text-gray-500">Владелец объекта</p>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Описание</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {listing.description}
        </p>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Удобства</h2>
        <div className="flex flex-wrap gap-2">
          {listing.amenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
            >
              {AMENITY_ICONS[amenity] ?? null}
              {amenity}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-2 pt-4 border-t">
        <span className="text-2xl font-bold">
          {formatPrice(listing.pricePerNight)}
        </span>
        <span className="text-gray-500">за ночь</span>
      </div>
    </div>
  );
}
