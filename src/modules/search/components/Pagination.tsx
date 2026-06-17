/**
 * ANCHOR: PAGINATION
 * PURPOSE: Навигация между страницами результатов.
 *
 * @PreConditions:
 * - meta: { total, page, hasMore }
 * - useRouter imported from 'next/navigation'
 * - buildSearchUrl imported from '@/shared/utils/buildSearchUrl'
 * - useSearchParams from 'next/navigation' for current params
 *
 * @PostConditions:
 * - Shows: [< Prev] [1] [2] [3] ... [N] [Next >]
 * - Current page highlighted
 * - Updates URL ?page=N on click
 * - Hidden when hasMore: false
 *
 * @SideEffects: router.push on page change
 *
 * Dependencies: @/shared/utils/buildSearchUrl.
 * CRITICAL: Preserves all current search params when changing page.
 *
 * DO:
 * - Show 5 page buttons max with ellipsis
 * - Disable Prev on page 1, Next when !hasMore
 * DONT:
 * - Hardcode page numbers
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { buildSearchUrl } from '@/shared/utils/buildSearchUrl';

type PaginationMeta = {
  total: number;
  page: number;
  hasMore: boolean;
};

type PaginationProps = {
  meta: PaginationMeta;
};

// [START PAGINATION]
export function Pagination({ meta }: PaginationProps) {
  console.log('[search][Pagination][PAGINATION][ENTRY]', {
    meta,
  });

  console.log('[search][Pagination][PAGINATION][DECISION][visible-check]', {
    has_more: meta.hasMore,
    page: meta.page,
  });

  if (!meta.hasMore && meta.page === 1) {
    console.log('[search][Pagination][PAGINATION][EXIT]', {
      result: 'hidden',
      reason: 'single_page',
    });
    return null;
  }

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentParams = Object.fromEntries(searchParams.entries());

  const goToPage = useCallback(
    (page: number) => {
      console.log('[search][Pagination][PAGINATION][DECISION][page-change]', {
        from_page: meta.page,
        to_page: page,
      });

      const newUrl = buildSearchUrl({ ...currentParams, page }, '/search');
      router.push(newUrl);
    },
    [router, meta.page, currentParams],
  );

  const totalPages = Math.ceil(meta.total / 20);
  const currentPage = meta.page;

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  console.log('[search][Pagination][PAGINATION][EXIT]', {
    result: 'visible',
    current_page: currentPage,
    total_pages: totalPages,
  });

  return (
    <nav
      data-testid="pagination"
      className="mt-8 flex items-center justify-center gap-2"
      aria-label="Навигация по страницам"
    >
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Предыдущая страница"
      >
        ← Prev
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border hover:bg-muted'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={!meta.hasMore}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Следующая страница"
      >
        Next →
      </button>
    </nav>
  );
}
// [END PAGINATION]
