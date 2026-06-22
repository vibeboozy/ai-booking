/**
 * ANCHOR: listing
 * PURPOSE: Public API модуля listing (Dev B). Карточка объекта, галерея, карта, календарь, ИИ.
 * Dependencies: @/shared/types/listing.
 *
 * DO:
 * - Экспортировать AvailabilityCalendar для booking module
 * DONT:
 * - Экспортировать internal repository напрямую consumers
 */

export { ImageGallery } from '@/modules/listing/components/ImageGallery';
export { ListingMap } from '@/modules/listing/components/ListingMap';
export { AvailabilityCalendar } from '@/modules/listing/components/AvailabilityCalendar';
export { ListingDateSelector } from '@/modules/listing/components/ListingDateSelector';
export { AIConcierge } from '@/modules/listing/components/AIConcierge';
export { ListingDetails } from '@/modules/listing/components/ListingDetails';
export { useAvailability } from '@/modules/listing/hooks/useAvailability';
export type { ListingDetail, AvailabilityDay } from '@/modules/listing/types';
