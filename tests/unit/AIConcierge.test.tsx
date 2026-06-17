import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { AIConcierge } from '@/modules/listing/components/AIConcierge';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function createMockStream(chunks: string[], delay = 0) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      if (delay > 0) {
        setTimeout(() => {
          chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
          controller.close();
        }, delay);
      } else {
        chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
        controller.close();
      }
    },
  });
}

function createMockErrorStream(errorMessage: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n`),
      );
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: 'error', errorText: errorMessage })}\n`,
        ),
      );
      controller.close();
    },
  });
}

describe('AIConcierge', () => {
  beforeEach(() => {
    mockFetch.mockReset().mockResolvedValue({
      ok: true,
      body: createMockStream([]),
    });
  });

  it('renders initial state with title and placeholder', () => {
    render(<AIConcierge listingId="test-listing-id" />);
    expect(screen.getAllByText('ИИ-Консьерж')[0]).toBeInTheDocument();
    expect(
      screen.getAllByPlaceholderText('Есть Wi-Fi?')[0],
    ).toBeInTheDocument();
  });

  it('displays suggested questions', () => {
    render(<AIConcierge listingId="test-listing-id" />);
    const buttons = screen.getAllByRole('button');
    const suggestionBtns = buttons.filter((b) =>
      b.className.includes('transition-colors'),
    );
    expect(suggestionBtns.length).toBeGreaterThanOrEqual(4);
  });

  it('shows user and assistant messages after submit', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['Привет!']),
    });

    const { container } = render(<AIConcierge listingId="test-listing-id" />);
    const input = container.querySelector('input')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Привет' } });
      fireEvent.submit(input.closest('form')!);
    });

    await waitFor(() => {
      const messages = container.querySelectorAll('.bg-blue-600');
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  it('clears input after submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['Ответ']),
    });

    const { container } = render(<AIConcierge listingId="test-listing-id" />);
    const input = container.querySelector('input')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Новый вопрос' } });
      fireEvent.submit(input.closest('form')!);
    });

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('handles suggestion button click', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['Ответ на предложение']),
    });

    const { container } = render(<AIConcierge listingId="test-listing-id" />);
    const buttons = container.querySelectorAll('button');
    const wifiBtn = Array.from(buttons).find(
      (b) =>
        b.textContent === 'Есть Wi-Fi?' &&
        b.className.includes('transition-colors'),
    )!;

    await act(async () => {
      fireEvent.click(wifiBtn);
    });

    await waitFor(() => {
      const messages = container.querySelectorAll('.bg-blue-600');
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  it('disables submit button while loading', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['Ответ'], 100),
    });

    const { container } = render(<AIConcierge listingId="test-listing-id" />);
    const input = container.querySelector('input')!;
    const submitBtn = container.querySelector('button[type="submit"]')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Вопрос' } });
      fireEvent.submit(input.closest('form')!);
    });

    expect(submitBtn).toBeDisabled();
  });

  it('does not submit when input is empty', async () => {
    const { container } = render(<AIConcierge listingId="test-listing-id" />);
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('displays streaming response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['Частичный ответ']),
    });

    const { container } = render(<AIConcierge listingId="test-listing-id" />);
    const input = container.querySelector('input')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Вопрос' } });
      fireEvent.submit(input.closest('form')!);
    });

    await waitFor(() => {
      const messages = container.querySelectorAll('.bg-white.border');
      expect(messages.length).toBeGreaterThan(0);
    });
  });
});

describe('AIConcierge API Integration', () => {
  beforeEach(() => {
    mockFetch.mockReset().mockResolvedValue({
      ok: true,
      body: createMockStream([]),
    });
  });

  it('sends POST request to correct endpoint with listingId', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['Ответ']),
    });

    const { container } = render(<AIConcierge listingId="listing-123" />);
    const input = container.querySelector('input')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Тест' } });
      fireEvent.submit(input.closest('form')!);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/listings/listing-123/concierge',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });

  it('sends messages array in request body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['Ответ']),
    });

    const { container } = render(<AIConcierge listingId="test-id" />);
    const input = container.querySelector('input')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Мой вопрос' } });
      fireEvent.submit(input.closest('form')!);
    });

    await waitFor(() => {
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.messages).toBeInstanceOf(Array);
      expect(body.messages[0].content).toBe('Мой вопрос');
      expect(body.messages[0].role).toBe('user');
    });
  });

  it('handles API error response gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 405,
      body: null,
    });

    const { container } = render(<AIConcierge listingId="test-id" />);
    const input = container.querySelector('input')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Вопрос' } });
      fireEvent.submit(input.closest('form')!);
    });

    await waitFor(() => {
      const assistantMessages = container.querySelectorAll('.bg-white.border');
      expect(assistantMessages.length).toBeGreaterThan(0);
    });
  });

  it('handles network error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { container } = render(<AIConcierge listingId="test-id" />);
    const input = container.querySelector('input')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Вопрос' } });
      fireEvent.submit(input.closest('form')!);
    });

    await waitFor(() => {
      const errorMessages = container.querySelectorAll('.bg-white.border');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('re-enables input after error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { container } = render(<AIConcierge listingId="test-id" />);
    const input = container.querySelector('input')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Вопрос' } });
      fireEvent.submit(input.closest('form')!);
    });

    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });
  });

  it('sends suggestion question when suggestion button clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['Ответ на Wi-Fi']),
    });

    const { container } = render(<AIConcierge listingId="test-id" />);
    const buttons = container.querySelectorAll('button');
    const wifiBtn = Array.from(buttons).find(
      (b) =>
        b.textContent === 'Есть Wi-Fi?' &&
        b.className.includes('transition-colors'),
    )!;

    await act(async () => {
      fireEvent.click(wifiBtn);
    });

    await waitFor(() => {
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.messages[0].content).toBe('Есть Wi-Fi?');
    });
  });
});

describe('AIConcierge Streaming Integration', () => {
  beforeEach(() => {
    mockFetch.mockReset().mockResolvedValue({
      ok: true,
      body: createMockStream([]),
    });
  });

  it('processes streaming chunks correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['Первая ', 'часть ', 'ответа']),
    });

    const { container } = render(<AIConcierge listingId="test-id" />);
    const input = container.querySelector('input')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Вопрос' } });
      fireEvent.submit(input.closest('form')!);
    });

    await waitFor(() => {
      const assistantMessages = container.querySelectorAll('.bg-white.border');
      expect(assistantMessages.length).toBeGreaterThan(0);
    });
  });

  it('adds user message before streaming starts', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: createMockStream(['Ответ']),
    });

    const { container } = render(<AIConcierge listingId="test-id" />);
    const input = container.querySelector('input')!;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Мой вопрос' } });
      fireEvent.submit(input.closest('form')!);
    });

    await waitFor(() => {
      const userMessages = container.querySelectorAll('.bg-blue-600');
      expect(userMessages.length).toBeGreaterThan(0);
      expect(userMessages[0].textContent).toBe('Мой вопрос');
    });
  });
});
