/**
 * ANCHOR: profile
 * PURPOSE: Server actions для управления поездками.
 */

'use server';

import { auth } from '@/lib/auth';
import { cancelBooking as cancelBookingRepo } from '@/modules/profile/profile.repository';
import { revalidatePath } from 'next/cache';

export async function cancelTripAction(
  bookingId: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Требуется авторизация' };
  }

  try {
    const cancelled = await cancelBookingRepo(session.user.id, bookingId);

    if (!cancelled) {
      return {
        success: false,
        error: 'Бронирование не найдено или уже отменено',
      };
    }

    revalidatePath('/profile/trips');
    return { success: true };
  } catch (error) {
    console.error('[cancelTripAction]', error);
    return { success: false, error: 'Ошибка при отмене бронирования' };
  }
}
