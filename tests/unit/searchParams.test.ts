/**
 * ANCHOR: shared
 * PURPOSE: Unit-тесты parseSearchParams / buildSearchUrl roundtrip.
 */

import { describe, expect, it } from 'vitest';

import { buildSearchUrl } from '@/shared/utils/buildSearchUrl';
import { parseSearchParams } from '@/shared/utils/parseSearchParams';

describe('search params URL utils', () => {
  it('parses valid query params', () => {
    const parsed = parseSearchParams({
      city: 'Москва',
      country: 'Россия',
      checkIn: '2026-06-10',
      checkOut: '2026-06-15',
      guests: '3',
      priceMin: '100000',
      priceMax: '500000',
      propertyType: 'apartment',
      amenities: 'kitchen,wifi',
      page: '2',
    });

    expect(parsed).toEqual({
      city: 'Москва',
      country: 'Россия',
      checkIn: '2026-06-10',
      checkOut: '2026-06-15',
      guests: 3,
      priceMin: 100000,
      priceMax: 500000,
      propertyType: 'apartment',
      amenities: ['kitchen', 'wifi'],
      page: 2,
    });
  });

  it('returns empty object for invalid params', () => {
    expect(parseSearchParams({ guests: '99', checkIn: 'bad-date' })).toEqual(
      {},
    );
  });

  it('roundtrips parse → build → parse', () => {
    const original = {
      city: 'Казань',
      checkIn: '2026-08-01',
      checkOut: '2026-08-05',
      guests: 4,
      amenities: ['wifi', 'parking'],
      propertyType: 'house' as const,
    };

    const url = buildSearchUrl(original);
    const query = url.split('?')[1] ?? '';
    const raw = Object.fromEntries(new URLSearchParams(query));

    expect(parseSearchParams(raw)).toEqual({
      ...original,
      amenities: ['parking', 'wifi'],
    });
  });

  it('omits default guests and page from URL', () => {
    expect(buildSearchUrl({ city: 'Москва', guests: 2, page: 1 })).toBe(
      '/search?city=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0',
    );
  });
});
