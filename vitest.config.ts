import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts'],
    coverage: {
      /** v8: statement/line/branch % in the text table; "Uncovered" = lines no test ran (often yellow/red in the terminal for low %). */
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportOnFailure: true,
      exclude: ['**/*.test.ts', '**/*.config.*', '**/*.d.ts', '**/node_modules/**'],
    },
  },
  resolve: {
    alias: { '@': root },
  },
});
