// vitest.config.ts — Phase 1 Complete Testing
// Coverage thresholds per Sprint 6 requirements:
//   - Domain (packages/) ≥ 90%
//   - Application (src/) ≥ 85%
//   - Components (src/components, src/shared/components) ≥ 80%

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.test.tsx',
      'tests/integration/**/*.test.ts',
      'tests/integration/**/*.test.tsx',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ],
    exclude: ['node_modules/', '.next/', 'examples/', 'skills/', 'mini-services/', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/generated/',
        '.next/',
        'examples/',
        'skills/',
        'mini-services/',
        'scripts/',
        '**/*.config.{ts,js,mjs}',
        '**/types.ts',
        'tests/**',
        'src/app/api/**',
        'coverage/**',
      ],
      thresholds: {
        // Per Sprint 6 Phase 1 requirements
        'src/packages/**': { lines: 90, functions: 90, branches: 85, statements: 90 },
        'src/shared/lib/**': { lines: 85, functions: 85, branches: 80, statements: 85 },
        'src/shared/components/**': { lines: 80, functions: 80, branches: 75, statements: 80 },
        'src/components/**': { lines: 80, functions: 80, branches: 75, statements: 80 },
        'src/tools/**/_shared/**': { lines: 90, functions: 90, branches: 85, statements: 90 },
      },
    },
    reporters: ['default', 'junit'],
    outputFile: 'test-results.xml',
    pool: 'forks',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@packages': resolve(__dirname, 'packages'),
    },
  },
});
