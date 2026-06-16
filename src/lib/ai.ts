/**
 * ANCHOR: shared
 * PURPOSE: Клиент Vercel AI SDK для ИИ-Консьержа.
 * Dependencies: ai, @ai-sdk/openai, @/lib/env.
 * CRITICAL: Custom provider (AI_PROVIDER_URL) — OpenAI-compatible API.
 *
 * DO:
 * - aiProvider — custom provider для route handler (server-side)
 * DONT:
 * - Не импортировать этот файл напрямую в client components
 */

import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { env } from '@/lib/env';

export const CONCIERGE_MODEL = env.AI_MODEL_NAME ?? 'gpt-4o';

export const aiProvider =
  env.AI_PROVIDER_URL && env.AI_API_KEY
    ? createOpenAI({
        baseURL: env.AI_PROVIDER_URL,
        apiKey: env.AI_API_KEY,
      })
    : null;

export function isCustomProviderConfigured(): boolean {
  return Boolean(env.AI_PROVIDER_URL && env.AI_API_KEY);
}

export { streamText };
