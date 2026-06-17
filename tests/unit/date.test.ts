/**
 * ANCHOR: shared
 * PURPOSE: Unit-тесты date utils — UTC consistency, parsing, formatting.
 */

import { describe, it, expect } from 'vitest';
import {
  toLocalDateString,
  parseLocalDate,
  parseLocalDateOnly,
} from '@/shared/utils/date';

describe('toLocalDateString', () => {
  it('formats date as YYYY-MM-DD using UTC', () => {
    const date = new Date(Date.UTC(2026, 5, 19)); // June 19, 2026 UTC
    expect(toLocalDateString(date)).toBe('2026-06-19');
  });

  it('pads single-digit month and day with zeros', () => {
    const date = new Date(Date.UTC(2026, 0, 5)); // Jan 5, 2026 UTC
    expect(toLocalDateString(date)).toBe('2026-01-05');
  });

  it('handles end of year dates', () => {
    const date = new Date(Date.UTC(2026, 11, 31)); // Dec 31, 2026 UTC
    expect(toLocalDateString(date)).toBe('2026-12-31');
  });
});

describe('parseLocalDate', () => {
  it('parses YYYY-MM-DD string to Date using UTC', () => {
    const result = parseLocalDate('2026-06-19');
    expect(result).not.toBeNull();
    expect(result?.getUTCFullYear()).toBe(2026);
    expect(result?.getUTCMonth()).toBe(5); // June is 5 (0-indexed)
    expect(result?.getUTCDate()).toBe(19);
  });

  it('returns null for invalid string', () => {
    expect(parseLocalDate('invalid')).toBeNull();
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate(undefined)).toBeNull();
    expect(parseLocalDate(null)).toBeNull();
  });

  it('returns null for array input', () => {
    expect(parseLocalDate(['2026-06-19'])).toBeNull();
  });

  it('handles single-digit month and day', () => {
    const result = parseLocalDate('2026-01-05');
    expect(result?.getUTCFullYear()).toBe(2026);
    expect(result?.getUTCMonth()).toBe(0);
    expect(result?.getUTCDate()).toBe(5);
  });
});

describe('parseLocalDateOnly', () => {
  it('parses YYYY-MM-DD from YYYY-MM-DDTHH:MM:SS format', () => {
    const result = parseLocalDateOnly('2026-06-19T00:00:00.000Z');
    expect(result.getUTCFullYear()).toBe(2026);
    expect(result.getUTCMonth()).toBe(5);
    expect(result.getUTCDate()).toBe(19);
  });

  it('handles date-only string', () => {
    const result = parseLocalDateOnly('2026-06-19');
    expect(result.getUTCFullYear()).toBe(2026);
    expect(result.getUTCMonth()).toBe(5);
    expect(result.getUTCDate()).toBe(19);
  });
});

describe('UTC consistency', () => {
  it('roundtrip: parse -> format -> parse yields same date', () => {
    const original = '2026-06-19';
    const parsed = parseLocalDate(original)!;
    const formatted = toLocalDateString(parsed);
    const reparsed = parseLocalDate(formatted);

    expect(formatted).toBe(original);
    expect(reparsed?.getTime()).toBe(parsed.getTime());
  });

  it('toLocalDateString output is ISO-format compatible', () => {
    const date = new Date(Date.UTC(2026, 5, 19, 12, 30, 0));
    const formatted = toLocalDateString(date);
    const reparsed = parseLocalDate(formatted);

    expect(reparsed?.toISOString().startsWith(formatted)).toBe(true);
  });

  it('no timezone shift: UTC midnight stays as midnight', () => {
    const date = new Date(Date.UTC(2026, 5, 19, 0, 0, 0, 0));
    const formatted = toLocalDateString(date);
    const reparsed = parseLocalDate(formatted);

    expect(reparsed?.getUTCHours()).toBe(0);
    expect(reparsed?.getUTCMinutes()).toBe(0);
  });
});
