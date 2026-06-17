/**
 * Integration tests for SearchPage layout (SEARCH_PAGE_LAYOUT)
 * SC-003: SearchPage renders 2-column grid on desktop
 * SC-004: SearchPage renders vertical stack on mobile
 * SC-006: MobileFilters visible on mobile
 * SC-020: US-1: View filters while scrolling results
 * SC-021: US-2: Mobile experience unchanged
 * SC-022: US-3: Filters persist across screen sizes
 * SC-023: Resize from mobile to desktop: layout switches correctly
 */

import { test, expect } from '@playwright/test';

test.describe('SEARCH_PAGE_LAYOUT', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search?city=Moscow');
  });

  test.describe('SC-003: 2-column grid on desktop (lg+)', () => {
    test('should render grid with sidebar and results', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      const grid = page.locator('.grid.grid-cols-1\\/lg\\:grid-cols-\\[280px_1fr\\]');
      await expect(grid).toBeVisible();
    });

    test('should show DesktopFilters sidebar on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      const sidebar = page.locator('aside.hidden\\:lg\\.block');
      await expect(sidebar).toBeVisible();
    });

    test('should have results section next to sidebar', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      const main = page.locator('main');
      await expect(main).toBeVisible();
      await expect(page.getByText('Найдено')).toBeVisible();
    });
  });

  test.describe('SC-004: Vertical stack on mobile (<lg)', () => {
    test('should hide sidebar on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const sidebar = page.locator('aside.hidden\\:lg\\.block');
      await expect(sidebar).not.toBeVisible();
    });

    test('should show single column layout on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const grid = page.locator('.grid.grid-cols-1');
      await expect(grid).toBeVisible();
    });
  });

  test.describe('SC-006: MobileFilters visible on mobile', () => {
    test('should show MobileFilters button on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const mobileFiltersButton = page.getByRole('button', { name: /Фильтры/i });
      await expect(mobileFiltersButton).toBeVisible();
    });

    test('should hide MobileFilters button on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      const mobileFiltersButton = page.getByRole('button', { name: /Фильтры/i });
      await expect(mobileFiltersButton).not.toBeVisible();
    });
  });

  test.describe('SC-020: US-1 - View filters while scrolling results', () => {
    test('should keep sidebar sticky during scroll', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      const sidebar = page.locator('aside.sticky');
      await expect(sidebar).toBeAttached();

      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);

      const sidebarAfterScroll = page.locator('aside.sticky');
      await expect(sidebarAfterScroll).toBeVisible();
    });

    test('should display filters in sidebar without scrolling', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      const filtersInSidebar = page.locator('aside').filter({ hasText: 'Цена' });
      await expect(filtersInSidebar).toBeVisible();
    });
  });

  test.describe('SC-021: US-2 - Mobile experience unchanged', () => {
    test('should open filter drawer on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const filterButton = page.getByRole('button', { name: /Фильтры/i });
      await filterButton.click();

      await expect(page.getByRole('heading', { name: 'Фильтры' })).toBeVisible();
    });

    test('should show price slider in drawer', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.getByRole('button', { name: /Фильтры/i }).click();
      await expect(page.getByText('Цена')).toBeVisible();
    });
  });

  test.describe('SC-022: US-3 - Filters persist across screen sizes', () => {
    test('should preserve URL params when switching viewport', async ({ page }) => {
      await page.goto('/search?city=Moscow&priceMax=5000000');

      await page.setViewportSize({ width: 1280, height: 800 });
      expect(page.url()).toContain('priceMax=5000000');

      await page.setViewportSize({ width: 375, height: 667 });
      expect(page.url()).toContain('priceMax=5000000');
    });

    test('should show active filter in sidebar on desktop', async ({ page }) => {
      await page.goto('/search?city=Moscow&priceMax=5000000');
      await page.setViewportSize({ width: 1280, height: 800 });

      const sidebar = page.locator('aside').filter({ hasText: 'Цена' });
      await expect(sidebar).toBeVisible();
    });
  });

  test.describe('SC-023: Resize from mobile to desktop', () => {
    test('should switch layout when crossing lg breakpoint', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const mobileFilters = page.getByRole('button', { name: /Фильтры/i });
      await expect(mobileFilters).toBeVisible();

      await page.setViewportSize({ width: 1024, height: 768 });

      const sidebar = page.locator('aside.hidden\\:lg\\.block');
      await expect(sidebar).toBeVisible();
    });

    test('should restore 2-column layout after resize', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.getByRole('button', { name: /Фильтры/i }).click();

      await page.setViewportSize({ width: 1280, height: 800 });

      const sidebar = page.locator('aside.hidden\\:lg\\.block');
      await expect(sidebar).toBeVisible();

      const main = page.locator('main');
      await expect(main).toBeVisible();
    });
  });
});