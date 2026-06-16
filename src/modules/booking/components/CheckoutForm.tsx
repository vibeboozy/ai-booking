/**
 * ANCHOR: booking
 * PURPOSE: Форма чекаут: даты, гости, summary listing, CTA «Забронировать».
 * Dependencies: AvailabilityCalendar, PriceBreakdown, MockPaymentButton, useCheckout.
 * CRITICAL: Все сборы видны до оплаты; auth required.
 *
 * DO:
 * - Reuse AvailabilityCalendar mode="select"
 * DONT:
 * - Скрытые комиссии в UI
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ListingDetail } from '@/modules/listing/types';
import { AvailabilityCalendar } from '@/modules/listing/components/AvailabilityCalendar';
import { PriceBreakdown } from '@/modules/booking/components/PriceBreakdown';
import { MockPaymentButton } from '@/modules/booking/components/MockPaymentButton';
import { useCheckout } from '@/modules/booking/hooks/useCheckout';
import { formatPrice } from '@/shared/utils/formatPrice';

type CheckoutFormProps = {
  listing: ListingDetail;
};

export function CheckoutForm({ listing }: CheckoutFormProps) {
  const [bookingId, setBookingId] = useState<string | null>(null);
  const {
    checkIn,
    checkOut,
    guests,
    breakdown,
    pendingCheckIn,
    onDateClick,
    clearDates,
    setGuests,
    submit,
    isSubmitting,
  } = useCheckout(listing);

  const handleConfirm = async () => {
    const id = await submit();
    if (id) {
      setBookingId(id);
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
                <span className="font-medium">{formatPrice(listing.pricePerNight)}</span> за ночь
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Выберите даты</h2>
            {pendingCheckIn && (
              <button
                onClick={clearDates}
                className="text-sm text-blue-600 hover:underline"
              >
                Отменить выбор
              </button>
            )}
          </div>
          {pendingCheckIn && (
            <p className="text-sm text-blue-600 mb-3">
              Выберите дату выезда
            </p>
          )}
          <AvailabilityCalendar
            listingId={listing.id}
            selectedCheckIn={checkIn ?? undefined}
            selectedCheckOut={checkOut ?? undefined}
            onDateSelect={(date) => onDateClick(date)}
            mode="select"
          />
          {checkIn && checkOut && (
            <p className="text-sm text-gray-600 mt-3">
              {checkIn.toLocaleDateString('ru-RU')} — {checkOut.toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>

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
          breakdown={breakdown ?? { nights: 0, subtotal: 0, cleaningFee: 0, serviceFee: 0, total: 0 }}
          pricePerNight={listing.pricePerNight}
          listingTitle={listing.title}
        />

        {breakdown && breakdown.nights > 0 && (
          bookingId ? (
            <MockPaymentButton bookingId={bookingId} disabled={isSubmitting} />
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Обработка...' : 'Подтвердить бронирование'}
            </button>
          )
        )}

        <p className="text-xs text-gray-500 text-center">
          Нажимая кнопку, вы принимаете правила отмены бронирования
        </p>
      </div>
    </div>
  );
}
