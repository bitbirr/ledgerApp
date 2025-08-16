import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Keep project root at repository root (not client)
  test: {
    include: ['server/**/*.test.ts'],
    environment: 'node',
    reporters: ['dot'],
    watch: false,
  },
});