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

import type { ListingDetail } from '@/modules/listing/types';

type ListingDetailsProps = {
  listing: ListingDetail;
};

export function ListingDetails(_props: ListingDetailsProps) {
  return null;
}
