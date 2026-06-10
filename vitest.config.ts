import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/': resolve(__dirname, 'src') + '/',
    },
  },
  test: {
    // Include only unit test files and exclude e2e Playwright tests
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
  },
});
