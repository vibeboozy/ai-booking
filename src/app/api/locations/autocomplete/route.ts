/**
 * ANCHOR: search
 * PURPOSE: GET /api/locations/autocomplete — автокомплит городов/стран.
 * Dependencies: search.repository autocompleteLocations, Zod (q min 2 chars).
 * CRITICAL: Rate limit 60 req/min per IP.
 *
 * DO:
 * - Return { data: Location[] }
 * DONT:
 * - Return full Location table without query filter
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { autocompleteLocations } from '@/modules/search/search.repository';
import {
  AUTOCOMPLETE_MIN_CHARS,
  AUTOCOMPLETE_DEFAULT_LIMIT,
} from '@/modules/search/constants/searchFilters';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_KEY_PREFIX = 'rate_limit:';
const MAX_QUERY_LENGTH = 50;
const MAX_AUTOCOMPLETE_LIMIT = 10;

function logLine(
  module: string,
  function_name: string,
  anchor: string,
  point: 'ENTRY' | 'EXIT' | 'CHECK' | 'DECISION' | 'ERROR',
  data?: Record<string, unknown>,
): void {
  console.log(
    `[${module}][${function_name}][${anchor}][${point}]`,
    JSON.stringify(data ?? {}),
  );
}

const querySchema = z.object({
  q: z.string().max(MAX_QUERY_LENGTH).optional().default(''),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_AUTOCOMPLETE_LIMIT)
    .optional()
    .default(AUTOCOMPLETE_DEFAULT_LIMIT),
});

type RateLimitKey = string;
type RateLimitEntry = { count: number; windowStart: number };

const rateLimitStore = new Map<RateLimitKey, RateLimitEntry>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    logLine(
      'api',
      'GET /api/locations/autocomplete',
      'AUTOCOMPLETE_LOCATIONS_API',
      'ERROR',
      {
        reason: 'rate_limit_exceeded',
        ip,
        count: entry.count,
      },
    );
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return '127.0.0.1';
}

export async function GET(request: Request) {
  logLine(
    'api',
    'GET /api/locations/autocomplete',
    'AUTOCOMPLETE_LOCATIONS_API',
    'ENTRY',
    {
      url: request.url,
    },
  );

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);

  logLine(
    'api',
    'GET /api/locations/autocomplete',
    'AUTOCOMPLETE_LOCATIONS_API',
    'CHECK',
    {
      check: 'rate_limit',
      ip,
      allowed: rateLimit.allowed,
      remaining: rateLimit.remaining,
    },
  );

  if (!rateLimit.allowed) {
    logLine(
      'api',
      'GET /api/locations/autocomplete',
      'AUTOCOMPLETE_LOCATIONS_API',
      'EXIT',
      {
        result: 'rate_limited',
        error: 'RATE_LIMITED',
      },
    );
    return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  const url = new URL(request.url);
  const rawParams = Object.fromEntries(url.searchParams);

  const parseResult = querySchema.safeParse(rawParams);

  if (!parseResult.success) {
    logLine(
      'api',
      'GET /api/locations/autocomplete',
      'AUTOCOMPLETE_LOCATIONS_API',
      'ERROR',
      {
        reason: 'validation_failed',
        errors: parseResult.error.flatten(),
      },
    );
    logLine(
      'api',
      'GET /api/locations/autocomplete',
      'AUTOCOMPLETE_LOCATIONS_API',
      'EXIT',
      {
        result: 'validation_error',
        error: 'INVALID_QUERY',
      },
    );
    return NextResponse.json({ error: 'INVALID_QUERY' }, { status: 400 });
  }

  const { q, limit } = parseResult.data;

  logLine(
    'api',
    'GET /api/locations/autocomplete',
    'AUTOCOMPLETE_LOCATIONS_API',
    'CHECK',
    {
      check: 'query_validated',
      q,
      q_length: q.length,
      limit,
    },
  );

  try {
    const locations = await autocompleteLocations(q, { limit });

    logLine(
      'api',
      'GET /api/locations/autocomplete',
      'AUTOCOMPLETE_LOCATIONS_API',
      'EXIT',
      {
        result: 'success',
        locations_count: locations.length,
      },
    );

    return NextResponse.json({ data: locations });
  } catch (error) {
    logLine(
      'api',
      'GET /api/locations/autocomplete',
      'AUTOCOMPLETE_LOCATIONS_API',
      'ERROR',
      {
        reason: 'internal_error',
        error: error instanceof Error ? error.message : 'unknown',
      },
    );
    logLine(
      'api',
      'GET /api/locations/autocomplete',
      'AUTOCOMPLETE_LOCATIONS_API',
      'EXIT',
      {
        result: 'internal_error',
        error: 'INTERNAL_ERROR',
      },
    );
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
