/**
 * ANCHOR: listing
 * PURPOSE: Интеграционные тесты ИИ-Консьержа с реальным AI-провайдером.
 * Dependencies: POST /api/listings/[id]/concierge (реальный запрос).
 * CRITICAL: Тесты требуют запущенного сервера (npm run dev).
 *            Для запуска: npm run dev (в отдельном терминале), затем npx vitest run tests/AIConcierge.integration.test.ts
 *
 * DO:
 * - Реальные HTTP запросы к API
 * - Проверка streaming ответа
 * DONT:
 * - Не мокать fetch в этих тестах
 */

import { describe, it, expect, beforeAll } from 'vitest';

const TEST_LISTING_ID =
  process.env.TEST_LISTING_ID ?? 'seed-listing-moscow-ru-1';
const API_BASE = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
const AI_PROVIDER_URL =
  process.env.AI_PROVIDER_URL ?? 'https://ai.develonica.group';
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL_NAME = process.env.AI_MODEL_NAME ?? 'dvl-analyst';

async function checkListingExists(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/listings/${TEST_LISTING_ID}`);
    return response.ok;
  } catch {
    return false;
  }
}

describe('AIConcierge Real API Integration', () => {
  let listingExists = false;

  beforeAll(async () => {
    listingExists = await checkListingExists();
    if (!listingExists) {
      console.warn(
        `Test listing '${TEST_LISTING_ID}' not found. Set TEST_LISTING_ID env var. Streaming tests will be skipped.`,
      );
    }
  });

  describe('Direct AI Provider API diagnostics', () => {
    it('should create chat session directly', async () => {
      if (!AI_API_KEY) {
        console.warn('AI_API_KEY not set, skipping direct API test');
        return;
      }

      const baseUrl = AI_PROVIDER_URL.replace(/\/$/, '');

      const createChatResponse = await fetch(`${baseUrl}/api/v1/chats/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          chat: {
            id: '',
            title: 'Новый чат',
            models: [AI_MODEL_NAME],
            params: {},
            history: {
              messages: {},
              currentId: '',
            },
            messages: [],
            tags: [],
            timestamp: Date.now(),
          },
          folder_id: null,
        }),
      });

      console.log('createChat status:', createChatResponse.status);
      console.log(
        'createChat headers:',
        Object.fromEntries(createChatResponse.headers.entries()),
      );
      const createChatText = await createChatResponse.text();
      console.log('createChat body:', createChatText.slice(0, 500));

      expect(
        createChatResponse.ok,
        `createChat failed: ${createChatText}`,
      ).toBe(true);

      const chatData = JSON.parse(createChatText);
      const chatId = chatData.id ?? chatData.chat_id;
      expect(chatId).toBeTruthy();

      console.log('Created chat_id:', chatId);

      const taskResponse = await fetch(`${baseUrl}/api/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          stream: true,
          model: AI_MODEL_NAME,
          messages: [{ role: 'user', content: '1+1=?' }],
          params: {},
          tool_servers: [],
          features: {
            voice: false,
            image_generation: false,
            code_interpreter: false,
            web_search: false,
          },
          variables: {},
          chat_id: chatId,
        }),
      });

      console.log('submitCompletion status:', taskResponse.status);
      const taskText = await taskResponse.text();
      console.log('submitCompletion body:', taskText.slice(0, 500));

      expect(taskResponse.ok, `submitCompletion failed: ${taskText}`).toBe(
        true,
      );

      const taskData = JSON.parse(taskText);
      const taskId = taskData.task_id;
      expect(taskId).toBeTruthy();

      console.log('Got task_id:', taskId);

      await new Promise((r) => setTimeout(r, 2000));

      const completedResponse = await fetch(`${baseUrl}/api/chat/completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_MODEL_NAME,
          task_id: taskId,
        }),
      });

      console.log('pollForCompletion status:', completedResponse.status);
      const completedText = await completedResponse.text();
      console.log('pollForCompletion body:', completedText.slice(0, 1000));

      expect(
        completedResponse.ok,
        `pollForCompletion failed: ${completedText}`,
      ).toBe(true);
    });
  });

  describe('POST /api/listings/[id]/concierge', () => {
    it('returns streaming response for valid question', async () => {
      if (!listingExists) return;

      const response = await fetch(
        `${API_BASE}/api/listings/${TEST_LISTING_ID}/concierge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Есть Wi-Fi?' }],
          }),
        },
      );

      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
      }

      expect(fullResponse.length).toBeGreaterThan(0);
    });

    it('returns response within max tokens limit', async () => {
      if (!listingExists) return;

      const response = await fetch(
        `${API_BASE}/api/listings/${TEST_LISTING_ID}/concierge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Опиши объект подробно' }],
          }),
        },
      );

      expect(response.ok).toBe(true);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
      }

      expect(fullResponse.length).toBeLessThan(10000);
    }, 15000);

    it('handles suggestion questions', async () => {
      if (!listingExists) return;

      const questions = ['Есть Wi-Fi?', 'Есть кухня?', 'Как далеко до центра?'];
      const results: boolean[] = [];

      for (const question of questions) {
        const response = await fetch(
          `${API_BASE}/api/listings/${TEST_LISTING_ID}/concierge`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: question }],
            }),
          },
        );

        results.push(response.ok);
      }

      expect(results.every((r) => r)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('returns 400 for invalid request without messages', async () => {
      const response = await fetch(
        `${API_BASE}/api/listings/${TEST_LISTING_ID}/concierge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      );

      if (response.status === 404 && !listingExists) {
        console.warn(`Skipping: listing ${TEST_LISTING_ID} not found`);
        return;
      }

      expect(response.status).toBe(400);
    });

    it('returns 400 for empty message content', async () => {
      const response = await fetch(
        `${API_BASE}/api/listings/${TEST_LISTING_ID}/concierge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: '' }],
          }),
        },
      );

      if (response.status === 404 && !listingExists) {
        console.warn(`Skipping: listing ${TEST_LISTING_ID} not found`);
        return;
      }

      expect(response.status).toBe(400);
    });

    it('returns 404 for non-existent listing', async () => {
      const response = await fetch(
        `${API_BASE}/api/listings/non-existent-listing/concierge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Есть Wi-Fi?' }],
          }),
        },
      );

      expect(response.status).toBe(404);
    });
  });
});
