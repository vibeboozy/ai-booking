/**
 * ANCHOR: listing
 * PURPOSE: POST /api/listings/[id]/concierge — ИИ-Консьерж (custom provider).
 * Dependencies: listing.repository (fetch context server-side).
 * CRITICAL: Listing context from DB only; prompt injection defense.
 *
 * DO:
 * - Direct fetch to custom API (/v1/chats/new → /chat/completions)
 * - Sync response (stream: false)
 * DONT:
 * - Vercel AI SDK streamText (incompatible with this provider)
 * - Accept description/amenities from request body
 */

import { getListingById } from '@/modules/listing/listing.repository';
import { env } from '@/lib/env';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}

export async function POST(request: Request, context: RouteContext) {
  if (!env.AI_PROVIDER_URL || !env.AI_API_KEY) {
    return new Response('AI provider not configured', { status: 500 });
  }

  const { id } = await context.params;
  const body = await request.json();

  const messages: Array<{ role: string; content: string }> = body.messages;
  const legacyMessage = typeof body.message === 'string' ? body.message : null;

  if (!messages && !legacyMessage) {
    return new Response('Invalid request', { status: 400 });
  }

  const listing = await getListingById(id);
  if (!listing) {
    return new Response('Listing not found', { status: 404 });
  }

  let userMessage = '';
  if (messages && Array.isArray(messages)) {
    const lastMsg = messages[messages.length - 1];
    userMessage = lastMsg?.content?.slice(0, 500).replace(/[<>]/g, '') ?? '';
  } else if (legacyMessage) {
    userMessage = legacyMessage.slice(0, 500).replace(/[<>]/g, '');
  }

  if (!userMessage) {
    return new Response('Invalid message content', { status: 400 });
  }

  const modelName = env.AI_MODEL_NAME ?? 'dvl-analyst';
  const baseUrl = env.AI_PROVIDER_URL.replace(/\/$/, '');

  const systemPrompt = `Ты — ИИ-консьерж для объекта "${listing.title}" в ${listing.city}, ${listing.country}.

Описание объекта:
${listing.description}

Удобства:
${listing.amenities.join(', ') || 'не указаны'}

ВНИМАНИЕ: Отвечай ТОЛЬКО на основе предоставленной информации об объекте. Если информации недостаточно, ответь: "К сожалению, я не знаю ответ на этот вопрос на основе доступных данных об объекте." НЕ придумывай информацию. НЕ упоминай, что ты ИИ-бот. Будь дружелюбным и полезным. Отвечай кратко и по существу.`;

  const chatId = await createChat(baseUrl, env.AI_API_KEY, modelName);
  if (!chatId) {
    return new Response('Failed to create chat session', { status: 500 });
  }

  const assistantResponse = await submitCompletion(
    baseUrl,
    env.AI_API_KEY,
    modelName,
    chatId,
    systemPrompt,
    userMessage,
  );
  if (!assistantResponse) {
    return new Response('Failed to get completion result', { status: 500 });
  }

  return new Response(assistantResponse, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

async function createChat(
  baseUrl: string,
  apiKey: string,
  modelName: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/chats/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        chat: {
          id: '',
          title: 'Новый чат',
          models: [modelName],
          params: {},
          history: { messages: {}, currentId: '' },
          messages: [],
          tags: [],
          timestamp: Date.now(),
        },
        folder_id: null,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.id ?? data.chat_id ?? null;
  } catch {
    return null;
  }
}

async function submitCompletion(
  baseUrl: string,
  apiKey: string,
  modelName: string,
  chatId: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${baseUrl}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        stream: false,
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        params: {},
        tool_servers: [],
        features: {
          voice: false,
          image_generation: false,
          code_interpreter: false,
          web_search: false,
        },
        variables: {
          '{{USER_NAME}}': 'Гость',
          '{{USER_EMAIL}}': '',
          '{{USER_LOCATION}}': 'Unknown',
          '{{CURRENT_DATETIME}}': new Date()
            .toISOString()
            .replace('T', ' ')
            .split('.')[0],
          '{{CURRENT_DATE}}': new Date().toISOString().split('T')[0],
          '{{CURRENT_TIME}}':
            new Date().toISOString().split('T')[1]?.split('.')[0] ?? '',
          '{{CURRENT_WEEKDAY}}': new Date().toLocaleDateString('en-US', {
            weekday: 'long',
          }),
          '{{CURRENT_TIMEZONE}}':
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          '{{USER_LANGUAGE}}': 'ru-RU',
        },
        model_item: {
          id: modelName,
          name: modelName,
          object: 'model',
          created: 0,
          owned_by: 'openai',
          connection_type: 'external',
          preset: true,
          info: { id: modelName, builtinTools: {} },
        },
        session_id: '',
        chat_id: chatId,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
