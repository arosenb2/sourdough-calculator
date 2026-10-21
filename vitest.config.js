import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The tests are pure functions, so no DOM is needed
    environment: 'node',
    globals: true,
  },
});
