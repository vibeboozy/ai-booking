/**
 * ANCHOR: shared
 * PURPOSE: Утилита cn() — clsx + tailwind-merge для условных классов.
 * Dependencies: clsx, tailwind-merge.
 *
 * DO:
 * - cn('base', condition && 'active')
 * DONT:
 * - Конкатенация className строками
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
