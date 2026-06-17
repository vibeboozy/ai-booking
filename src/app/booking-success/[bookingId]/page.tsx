/**
 * ANCHOR: booking
 * PURPOSE: Route /booking-success/[bookingId] — подтверждение бронирования.
 * Dependencies: booking.repository (getBookingWithListing).
 *
 * DO:
 * - Show booking confirmation card with listing info
 * DONT:
 * - Expose sensitive payment data
 */

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBookingById } from '@/modules/booking/booking.repository';
import { formatPrice } from '@/shared/utils/formatPrice';
import { parseLocalDateOnly } from '@/shared/utils/date';
import { CheckCircle } from 'lucide-react';

type BookingSuccessPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function BookingSuccessPage({
  params,
}: BookingSuccessPageProps) {
  const { bookingId } = await params;

  const booking = await getBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  const checkIn = parseLocalDateOnly(booking.checkIn);
  const checkOut = parseLocalDateOnly(booking.checkOut);
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Поздравляем, вы забронировали!
        </h1>
        <p className="text-gray-500 mt-2">
          Подтверждение отправлено на вашу почту
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="relative h-48">
          {booking.listing.images[0] && (
            <Image
              src={booking.listing.images[0]}
              alt={booking.listing.title}
              fill
              className="object-cover"
            />
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{booking.listing.title}</h2>
            <p className="text-gray-500">
              {booking.listing.city}, {booking.listing.country}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y">
            <div>
              <p className="text-sm text-gray-500">Заезд</p>
              <p className="font-medium">
                {checkIn.toLocaleDateString('ru-RU', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Выезд</p>
              <p className="font-medium">
                {checkOut.toLocaleDateString('ru-RU', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Количество гостей</p>
              <p className="font-medium">{booking.guests} гостей</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Итого</p>
              <p className="text-xl font-bold">
                {formatPrice(booking.totalPrice)}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs text-gray-400 text-center">
              Номер бронирования: {booking.id}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Link
          href={`/listings/${booking.listingId}`}
          className="flex-1 py-3 px-4 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Вернуться к объекту
        </Link>
        <Link
          href="/trips"
          className="flex-1 py-3 px-4 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Мои поездки
        </Link>
      </div>
    </main>
  );
}
