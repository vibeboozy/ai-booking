/**
 * ANCHOR: listing
 * PURPOSE: ИИ-Консьерж: чат-виджет, streaming ответ на вопросы об объекте.
 * Dependencies: POST /api/listings/[id]/concierge.
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

import { useState, useCallback, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { CONCIERGE_SUGGESTED_QUESTIONS } from '@/shared/constants/ai';
import { API } from '@/shared/constants/urls';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type AIConciergeProps = {
  listingId: string;
};

export function AIConcierge({ listingId }: AIConciergeProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const appendMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 0);
    },
    [scrollToBottom],
  );

  const updateLastAssistantMessage = useCallback(
    (content: string) => {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.findLastIndex((m) => m.role === 'assistant');
        if (lastIdx !== -1) {
          updated[lastIdx] = { ...updated[lastIdx], content };
        }
        return updated;
      });
      setTimeout(scrollToBottom, 0);
    },
    [scrollToBottom],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: input.trim(),
      };

      appendMessage(userMessage);
      setInput('');
      setIsLoading(true);

      let assistantMessageAdded = false;

      try {
        const response = await fetch(API.LISTINGS_CONCIERGE(listingId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [userMessage] }),
        });

        if (!response.ok || !response.body) throw new Error('Network error');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          content += decoder.decode(value, { stream: true });

          if (!assistantMessageAdded) {
            const msg: ChatMessage = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content,
            };
            appendMessage(msg);
            assistantMessageAdded = true;
          } else {
            updateLastAssistantMessage(content);
          }
        }
      } catch {
        if (assistantMessageAdded) {
          updateLastAssistantMessage(
            'Извините, произошла ошибка. Попробуйте ещё раз.',
          );
        } else {
          const msg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: 'Извините, произошла ошибка. Попробуйте ещё раз.',
          };
          appendMessage(msg);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, listingId, appendMessage, updateLastAssistantMessage],
  );

  const handleSuggestion = useCallback(
    (question: string) => {
      if (isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: question,
      };

      appendMessage(userMessage);
      setIsLoading(true);

      let assistantMessageAdded = false;

      fetch(API.LISTINGS_CONCIERGE(listingId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [userMessage] }),
      })
        .then((res) => {
          if (!res.ok || !res.body) throw new Error('Network error');
          return res.body.getReader();
        })
        .then((reader) => {
          if (!reader) return;
          const decoder = new TextDecoder();
          let content = '';

          const processStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                content += decoder.decode(value, { stream: true });

                if (!assistantMessageAdded) {
                  const msg: ChatMessage = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content,
                  };
                  appendMessage(msg);
                  assistantMessageAdded = true;
                } else {
                  updateLastAssistantMessage(content);
                }
              }
            } catch {
              if (assistantMessageAdded) {
                updateLastAssistantMessage(
                  'Извините, произошла ошибка. Попробуйте ещё раз.',
                );
              } else {
                const msg: ChatMessage = {
                  id: `assistant-${Date.now()}`,
                  role: 'assistant',
                  content: 'Извините, произошла ошибка. Попробуйте ещё раз.',
                };
                appendMessage(msg);
                assistantMessageAdded = true;
              }
            } finally {
              setIsLoading(false);
            }
          };

          return processStream();
        })
        .catch(() => {
          if (assistantMessageAdded) {
            updateLastAssistantMessage(
              'Извините, произошла ошибка. Попробуйте ещё раз.',
            );
          } else {
            const msg: ChatMessage = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: 'Извините, произошла ошибка. Попробуйте ещё раз.',
            };
            appendMessage(msg);
          }
          setIsLoading(false);
        });
    },
    [isLoading, listingId, appendMessage, updateLastAssistantMessage],
  );

  return (
    <div className="border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">ИИ-Консьерж</h2>
        <span className="text-xs text-gray-400">спросите об объекте</span>
      </div>

      <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-3 bg-gray-50 rounded-xl p-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Задайте вопрос об этом объекте — я отвечу на основе описания и
            удобств.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border px-3 py-2 rounded-xl text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Печатает...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Есть Wi-Fi?"
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 transition-colors"
          aria-label="Отправить вопрос"
        >
          <Send size={18} />
        </button>
      </form>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {CONCIERGE_SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              onClick={() => handleSuggestion(question)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
