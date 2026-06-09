/**
 * ANCHOR: shared
 * PURPOSE: Константы ИИ-Консьержа: system prompt template, лимиты, suggested questions.
 * Dependencies: none.
 * CRITICAL: System prompt — answer ONLY from listing context; maxTokens 500.
 */

export const CONCIERGE_MAX_TOKENS = 500;

export const CONCIERGE_SUGGESTED_QUESTIONS = [
  'Есть Wi-Fi?',
  'Есть кухня?',
  'Как далеко до центра?',
  'Есть парковка?',
] as const;

export const CONCIERGE_SYSTEM_PROMPT = `
{{description}}
{{amenities}}
`.trim();
