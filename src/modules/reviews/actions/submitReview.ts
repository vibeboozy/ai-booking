/**
 * ANCHOR: reviews
 * PURPOSE: Server Action — submit review + aggregate rating.
 * Dependencies: reviews.repository, Zod validation, @/lib/auth.
 * CRITICAL: Eligibility: completed booking, no existing review, owner match.
 */

'use server';

import type { ReviewInput } from '@/modules/reviews/types';

export async function submitReview(_input: ReviewInput): Promise<{ data?: unknown; error?: string }> {
  return { error: 'Not implemented' };
}
