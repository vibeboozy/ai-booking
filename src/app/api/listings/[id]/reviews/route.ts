/**
 * ANCHOR: reviews
 * PURPOSE: GET /api/listings/[id]/reviews — paginated public reviews.
 * Dependencies: reviews.repository getListingReviews.
 *
 * DO:
 * - Mask author as first name + last initial
 * DONT:
 * - Return user email
 */

import { NextResponse } from 'next/server';
import { getListingReviews } from '@/modules/reviews/reviews.repository';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const result = await getListingReviews(id, page);

    return NextResponse.json({
      data: result.data,
      meta: {
        total: result.meta.total,
        page: result.meta.page,
        limit,
        totalPages: Math.ceil(result.meta.total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 },
    );
  }
}
