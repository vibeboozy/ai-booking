/**
 * Unit tests for Pagination component (PAGINATION)
 * SC-FEAT-007-006: Pagination скрыт когда hasMore: false
 * SC-FEAT-007-007: Pagination виден когда hasMore: true
 * SC-FEAT-007-008: Pagination обновляет URL при клике
 * SC-FEAT-007-011: Проверка лог-маркеров для PAGINATION
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/modules/search/components/Pagination';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

const createMockRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
});

const createMockSearchParams = (params: Record<string, string> = {}) => ({
  get: vi.fn((key: string) => params[key] ?? null),
  getAll: vi.fn(),
  has: vi.fn((key: string) => key in params),
  entries: vi.fn(() => Object.entries(params)),
  keys: vi.fn(() => Object.keys(params)),
  values: vi.fn(() => Object.values(params)),
  toString: vi.fn(() => new URLSearchParams(params).toString()),
  forEach: vi.fn(),
  size: Object.keys(params).length,
});

describe('PAGINATION', () => {
  let mockRouter: ReturnType<typeof createMockRouter>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter = createMockRouter();
    vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  const getLogCalls = (): unknown[][] => {
    return (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls;
  };

  describe('SC-FEAT-007-006: Pagination скрыт когда hasMore: false', () => {
    it('should return null when hasMore: false and page: 1', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 10, page: 1, hasMore: false };
      const { container } = render(<Pagination meta={meta} />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when total is small enough for single page', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 5, page: 1, hasMore: false };
      const { container } = render(<Pagination meta={meta} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('SC-FEAT-007-007: Pagination виден когда hasMore: true', () => {
    it('should render pagination when hasMore: true', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 30, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 30, page: 2, hasMore: true };
      render(<Pagination meta={meta} />);
      expect(screen.getByRole('button', { name: /предыдущая/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /следующая/i })).toBeInTheDocument();
    });

    it('should render page 1 button', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 30, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    });
  });

  describe('SC-FEAT-007-008: Pagination обновляет URL при клике', () => {
    it('should navigate to page 2 when clicking page 2 button', async () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 50, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);

      const page2Button = screen.getByRole('button', { name: '2' });
      await userEvent.click(page2Button);

      expect(mockRouter.push).toHaveBeenCalledWith('/search?page=2');
    });

    it('should navigate to next page when clicking Next', async () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 50, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);

      const nextButton = screen.getByRole('button', { name: /следующая/i });
      await userEvent.click(nextButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/search?page=2');
    });

    it('should navigate to previous page when clicking Prev', async () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams({ page: '3' }));
      const meta = { total: 50, page: 3, hasMore: true };
      render(<Pagination meta={meta} />);

      const prevButton = screen.getByRole('button', { name: /предыдущая/i });
      await userEvent.click(prevButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/search?page=2');
    });
  });

  describe('SC-FEAT-007-011: Проверка лог-маркеров для PAGINATION', () => {
    it('should log ENTRY marker', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 30, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);

      const logCalls = getLogCalls();
      const hasEntryLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('[search][Pagination][PAGINATION][ENTRY]'),
      );
      expect(hasEntryLog).toBe(true);
    });

    it('should log EXIT marker', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 30, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);

      const logCalls = getLogCalls();
      const hasExitLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('[search][Pagination][PAGINATION][EXIT]'),
      );
      expect(hasExitLog).toBe(true);
    });

    it('should log DECISION marker for visible-check', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 30, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);

      const logCalls = getLogCalls();
      const hasDecisionLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('[search][Pagination][PAGINATION][DECISION][visible-check]'),
      );
      expect(hasDecisionLog).toBe(true);
    });

    it('should log DECISION marker for page-change', async () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 50, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);

      const page2Button = screen.getByRole('button', { name: '2' });
      await userEvent.click(page2Button);

      const logCalls = getLogCalls();
      const hasPageChangeLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('[search][Pagination][PAGINATION][DECISION][page-change]'),
      );
      expect(hasPageChangeLog).toBe(true);
    });
  });

  describe('Page button states', () => {
    it('should disable Prev button on first page', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 50, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);

      const prevButton = screen.getByRole('button', { name: /предыдущая/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable Next button when no more pages', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 10, page: 1, hasMore: false };
      const { container } = render(<Pagination meta={meta} />);
      expect(container.firstChild).toBeNull();
    });

    it('should highlight current page', () => {
      vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams());
      const meta = { total: 50, page: 2, hasMore: true };
      render(<Pagination meta={meta} />);

      const page2Button = screen.getByRole('button', { name: '2' });
      expect(page2Button).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('URL preservation', () => {
    it('should preserve existing search params when changing page', async () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams({ city: 'Москва', page: '1' }),
      );
      const meta = { total: 50, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);

      const page2Button = screen.getByRole('button', { name: '2' });
      await userEvent.click(page2Button);

      const pushedUrl = mockRouter.push.mock.calls[0][0];
      expect(pushedUrl).toContain('city=');
      expect(pushedUrl).toContain('page=2');
    });

    it('should preserve all search params including checkIn and checkOut', async () => {
      vi.mocked(useSearchParams).mockReturnValue(
        createMockSearchParams({ city: 'Сочи', checkIn: '2026-07-01', checkOut: '2026-07-08', guests: '3' }),
      );
      const meta = { total: 50, page: 1, hasMore: true };
      render(<Pagination meta={meta} />);

      const page2Button = screen.getByRole('button', { name: '2' });
      await userEvent.click(page2Button);

      const pushedUrl = mockRouter.push.mock.calls[0][0];
      expect(pushedUrl).toContain('city=');
      expect(pushedUrl).toContain('checkIn=2026-07-01');
      expect(pushedUrl).toContain('checkOut=2026-07-08');
      expect(pushedUrl).toContain('guests=3');
      expect(pushedUrl).toContain('page=2');
    });
  });
});