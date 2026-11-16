import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/site/setup.ts'],
    fileParallelism: false,
    testTimeout: 180_000,
    hookTimeout: 300_000,
  },
});
