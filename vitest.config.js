import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
        setupFiles: ['./tests/setup.js'],
        exclude: ['tests/e2e/**', 'node_modules/**'],
    },
});
