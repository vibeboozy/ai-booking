/**
 * ANCHOR: search
 * PURPOSE: Unit-тесты для searchListings и buildWhereClause (FEAT-002).
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  searchListings,
  buildWhereClause,
} from '@/modules/search/search.repository';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    listing: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const { prisma } = vi.mocked(await import('@/lib/prisma'));

describe('buildWhereClause', () => {
  it('SC-001: Empty params returns empty where object', () => {
    const result = buildWhereClause({});
    expect(result).toEqual({});
  });

  it('SC-002: City filter uses contains with case-insensitive mode', () => {
    const result = buildWhereClause({ city: 'Сочи' });
    expect(result).toEqual({ city: { contains: 'Сочи', mode: 'insensitive' } });
  });

  it('SC-003: Price range uses gte/lte operators', () => {
    const result = buildWhereClause({ priceMin: 1000, priceMax: 5000 });
    expect(result).toEqual({ pricePerNight: { gte: 1000, lte: 5000 } });
  });

  it('SC-004: Property type filter uses exact match', () => {
    const result = buildWhereClause({ propertyType: 'apartment' });
    expect(result).toEqual({ propertyType: 'APARTMENT' });
  });

  it('SC-005: Amenities filter uses hasEvery operator', () => {
    const result = buildWhereClause({ amenities: ['wifi', 'kitchen'] });
    expect(result).toEqual({ amenities: { hasEvery: ['wifi', 'kitchen'] } });
  });
});

describe('searchListings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('SC-006: No results returns empty array with meta.total = 0', async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
    vi.mocked(prisma.listing.count).mockResolvedValue(0);

    const result = await searchListings({ city: 'NonExistentCity12345' });

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
    expect(result.meta.hasMore).toBe(false);
  });

  it('SC-007: Page 2 returns correct page meta', async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue([]);
    vi.mocked(prisma.listing.count).mockResolvedValue(0);

    const result = await searchListings({ page: 2 });

    expect(result.meta.page).toBe(2);
    expect(prisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20 }),
    );
  });

  it('SC-008: Default take = 20, not 50', async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue(
      Array(20).fill({
        id: '1',
        title: 'Test',
        city: 'Moscow',
        country: 'Russia',
        pricePerNight: 1000,
        images: [],
        averageRating: 4.5,
        reviewCount: 10,
        propertyType: 'APARTMENT',
      }),
    );
    vi.mocked(prisma.listing.count).mockResolvedValue(100);

    const result = await searchListings({ page: 1 });

    expect(result.data.length).toBeLessThanOrEqual(20);
    expect(prisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 }),
    );
  });

  it('hasMore is true when there are more results', async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue(
      Array(20).fill({
        id: '1',
        title: 'Test',
        city: 'Moscow',
        country: 'Russia',
        pricePerNight: 1000,
        images: [],
        averageRating: 4.5,
        reviewCount: 10,
        propertyType: 'APARTMENT',
      }),
    );
    vi.mocked(prisma.listing.count).mockResolvedValue(100);

    const result = await searchListings({ page: 1 });

    expect(result.meta.hasMore).toBe(true);
  });

  it('hasMore is false when on last page', async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue(
      Array(5).fill({
        id: '1',
        title: 'Test',
        city: 'Moscow',
        country: 'Russia',
        pricePerNight: 1000,
        images: [],
        averageRating: 4.5,
        reviewCount: 10,
        propertyType: 'APARTMENT',
      }),
    );
    vi.mocked(prisma.listing.count).mockResolvedValue(25);

    const result = await searchListings({ page: 3 });

    expect(result.meta.hasMore).toBe(false);
  });
});
