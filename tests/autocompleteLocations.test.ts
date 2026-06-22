/**
 * ANCHOR: search
 * PURPOSE: Unit-тесты для autocompleteLocations (FEAT-001).
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { autocompleteLocations } from '@/modules/search/search.repository';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    location: {
      findMany: vi.fn(),
    },
  },
}));

const { prisma } = vi.mocked(await import('@/lib/prisma'));

describe('autocompleteLocations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('SC-001: q = empty string returns all/popular locations up to limit', async () => {
    const mockLocations = [
      {
        id: '1',
        name: 'Sochi',
        type: 'CITY',
        slug: 'sochi',
        lat: 43.6,
        lng: 39.7,
      },
      {
        id: '2',
        name: 'Moscow',
        type: 'CITY',
        slug: 'moscow',
        lat: 55.75,
        lng: 37.62,
      },
    ];
    vi.mocked(prisma.location.findMany).mockResolvedValue(
      mockLocations as never,
    );

    const result = await autocompleteLocations('');

    expect(result.length).toBeLessThanOrEqual(5);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('type');
    expect(prisma.location.findMany).toHaveBeenCalledWith({
      take: 5,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        type: true,
        slug: true,
        lat: true,
        lng: true,
      },
    });
  });

  it('SC-002: q = 1 char returns empty array', async () => {
    const result = await autocompleteLocations('С');

    expect(result).toEqual([]);
    expect(prisma.location.findMany).not.toHaveBeenCalled();
  });

  it('SC-003: q = 2+ chars case-insensitive returns matching locations', async () => {
    const mockLocations = [
      {
        id: '1',
        name: 'Sochi',
        type: 'CITY',
        slug: 'sochi',
        lat: 43.6,
        lng: 39.7,
      },
    ];
    vi.mocked(prisma.location.findMany).mockResolvedValue(
      mockLocations as never,
    );

    const result = await autocompleteLocations('со');

    expect(result).toContainEqual(
      expect.objectContaining({ name: 'Sochi', type: 'city' }),
    );
  });

  it('SC-004: limit parameter restricts result count', async () => {
    vi.mocked(prisma.location.findMany).mockResolvedValue([
      {
        id: '1',
        name: 'Madrid',
        type: 'CITY',
        slug: 'madrid',
        lat: 40.4,
        lng: -3.7,
      },
      {
        id: '2',
        name: 'Mallorca',
        type: 'CITY',
        slug: 'mallorca',
        lat: 39.7,
        lng: 2.8,
      },
    ] as never);

    await autocompleteLocations('Ma', { limit: 2 });

    expect(prisma.location.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 2 }),
    );
  });

  it('SC-005: results sorted by type asc, name asc', async () => {
    const mockLocations = [
      {
        id: '1',
        name: 'Marseilles',
        type: 'CITY',
        slug: 'marseilles',
        lat: 43.3,
        lng: 5.4,
      },
      {
        id: '2',
        name: 'France',
        type: 'COUNTRY',
        slug: 'france',
        lat: 46.2,
        lng: 2.2,
      },
    ];
    vi.mocked(prisma.location.findMany).mockResolvedValue(
      mockLocations as never,
    );

    await autocompleteLocations('Mar');

    expect(prisma.location.findMany).toHaveBeenCalledWith({
      where: { name: { contains: 'Mar', mode: 'insensitive' } },
      take: 5,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        type: true,
        slug: true,
        lat: true,
        lng: true,
      },
    });
  });
});
