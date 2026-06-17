/**
 * ANCHOR: booking
 * PURPOSE: Форма чекаут: даты, гости, summary listing, CTA «Забронировать».
 * Dependencies: DateDisplay, PriceBreakdown, MockPaymentButton, useCheckout.
 * CRITICAL: Все сборы видны до оплаты; auth required.
 *
 * DO:
 * - Use DateDisplay for date selection
 * DONT:
 * - Скрытые комиссии в UI
 */

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import type { ListingDetail } from '@/modules/listing/types';
import { useAvailability } from '@/modules/listing/hooks/useAvailability';
import { DateDisplay } from '@/modules/booking/components/DateDisplay';
import { PriceBreakdown } from '@/modules/booking/components/PriceBreakdown';
import { useCheckout } from '@/modules/booking/hooks/useCheckout';
import { formatPrice } from '@/shared/utils/formatPrice';

type CheckoutFormProps = {
  listing: ListingDetail;
};

export function CheckoutForm({ listing }: CheckoutFormProps) {
  const router = useRouter();
  const { days } = useAvailability(listing.id);
  const {
    guests,
    breakdown,
    validationError,
    setGuests,
    submit,
    isSubmitting,
  } = useCheckout(listing, days);

  const handleConfirm = async () => {
    const id = await submit();
    if (id) {
      router.push(`/booking-success/${id}`);
    }
  };

  const incrementGuests = () => setGuests(Math.min(guests + 1, 10));
  const decrementGuests = () => setGuests(Math.max(guests - 1, 1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-xl font-semibold mb-4">Информация о жилье</h2>
          <div className="flex gap-4">
            {listing.images[0] && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-medium">{listing.title}</h3>
              <p className="text-gray-500 text-sm">
                {listing.city}, {listing.country}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {listing.propertyType === 'apartment'
                  ? 'Квартира'
                  : listing.propertyType === 'house'
                    ? 'Дом'
                    : 'Комната'}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">
                  {formatPrice(listing.pricePerNight)}
                </span>{' '}
                за ночь
              </p>
            </div>
          </div>
        </div>

        <DateDisplay listingId={listing.id} />

        {validationError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-xl font-semibold mb-4">Количество гостей</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={decrementGuests}
              disabled={guests <= 1}
              className="w-10 h-10 rounded-full border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              −
            </button>
            <span className="font-medium text-lg">{guests}</span>
            <button
              onClick={incrementGuests}
              disabled={guests >= 10}
              className="w-10 h-10 rounded-full border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              +
            </button>
            <span className="text-gray-500 text-sm">Максимум 10 гостей</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <PriceBreakdown
          breakdown={
            breakdown ?? {
              nights: 0,
              subtotal: 0,
              cleaningFee: 0,
              serviceFee: 0,
              total: 0,
            }
          }
          pricePerNight={listing.pricePerNight}
          listingTitle={listing.title}
        />

        {breakdown && breakdown.nights > 0 && !validationError && (
          <>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Обработка...' : 'Подтвердить бронирование'}
            </button>
            <p className="text-xs text-gray-500 text-center">
              Нажимая кнопку, вы принимаете правила отмены бронирования
            </p>
          </>
        )}
      </div>
    </div>
  );
}
