/**
 * ANCHOR: search
 * PURPOSE: E2E тесты для DateRangePicker в SearchBar.
 * Dependencies: Playwright, @/modules/search/components/DateRangePicker.
 */

import { test, expect } from '@playwright/test';

test.describe('FEAT-008: DateRangePicker в SearchBar', () => {

  test('SC-FEAT008-020: E2E: Выбор дат через календарь в SearchBar', async ({ page }) => {
    await page.goto('/');

    const searchBar = page.locator('form');
    await expect(searchBar).toBeVisible();

    const dateTrigger = page.getByLabel('Выберите даты');
    await dateTrigger.click();

    const popoverContent = page.locator('[data-testid="popover-content"]');
    await expect(popoverContent).toBeVisible();

    const calendar = page.locator('[data-testid="calendar"]');
    await expect(calendar).toBeVisible();
  });

  test('SC-FEAT008-021: E2E: Preset "Завтра" в SearchBar', async ({ page }) => {
    await page.goto('/');

    const tomorrowBtn = page.getByText('Завтра');
    await expect(tomorrowBtn).toBeVisible();
    await tomorrowBtn.click();

    const searchBtn = page.getByRole('button', { name: 'Найти' });
    await searchBtn.click();

    await expect(page).toHaveURL(/\/search\?checkIn=.*/);
  });

  test('SC-FEAT008-022: E2E: Ручной ввод даты в формате ДД.ММ.ГГГГ', async ({ page }) => {
    await page.goto('/');

    const dateTrigger = page.getByLabel('Выберите даты');
    await dateTrigger.click();

    const input = page.getByPlaceholder('ДД.ММ.ГГГГ');
    await expect(input).toBeVisible();

    await input.fill('25.06.2026');
    await page.keyboard.press('Tab');

    await expect(input).toHaveValue('25.06.2026');
  });

  test('SC-FEAT008-023: E2E: Валидация невалидной даты', async ({ page }) => {
    await page.goto('/');

    const dateTrigger = page.getByLabel('Выберите даты');
    await dateTrigger.click();

    const input = page.getByPlaceholder('ДД.ММ.ГГГГ');
    await input.fill('32.13.2026');
    await page.keyboard.press('Tab');

    const errorMsg = page.getByText('Неверный формат даты');
    await expect(errorMsg).toBeVisible();
  });

});