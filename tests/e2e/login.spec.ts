// E2E tests for the login page using Playwright
import { test, expect } from '@playwright/test';

// Credentials from prisma seed
const TEST_EMAIL = 'dev1@example.com';
const TEST_PASSWORD = 'password1';

test.describe('Login flow', () => {
  test('User can log in and is redirected to home', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in email and password
    await page.fill('input#email', TEST_EMAIL);
    await page.fill('input#password', TEST_PASSWORD);

    // Submit the form
    await page.click('button[type="submit"]');

    // Expect navigation to home (or callbackUrl)
    await expect(page).toHaveURL('/');
  });
});
