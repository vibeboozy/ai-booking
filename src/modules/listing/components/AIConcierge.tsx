/**
 * ANCHOR: listing
 * PURPOSE: ИИ-Консьерж: чат-виджет, streaming ответ на вопросы об объекте.
 * Dependencies: @ai-sdk/react, POST /api/listings/[id]/concierge, @/shared/constants/ai.
 * CRITICAL: Bot отвечает ONLY из description + amenities; suggested questions chips.
 *
 * DO:
 * - Streaming UI с typing indicator
 * - Render AI response as plain text
 * DONT:
 * - dangerouslySetInnerHTML для ответов
 * - Принимать listing context из client body
 */

'use client';

type AIConciergeProps = {
  listingId: string;
};

export function AIConcierge(_props: AIConciergeProps) {
  return null;
}
