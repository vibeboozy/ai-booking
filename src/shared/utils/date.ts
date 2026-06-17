/**
 * ANCHOR: shared
 * PURPOSE: Форматирование дат для URL и отображения.
 * Dependencies: none.
 *
 * DO:
 * - Use UTC functions consistently for YYYY-MM-DD (toISOString uses UTC)
 * - use toLocalDateString for URL params
 * - use parseLocalDate for YYYY-MM-DD strings from URL/DB
 * DONT:
 * - Mix local time and UTC; this caused date shifts (e.g., +3 TZ = -1 day display)
 */

export function toLocalDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(
  param: string | string[] | undefined | null,
): Date | null {
  if (!param || Array.isArray(param)) return null;
  const [year, month, day] = param.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return isNaN(date.getTime()) ? null : date;
}

export function parseLocalDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
