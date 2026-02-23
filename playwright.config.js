import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30000,
    retries: 1,
    use: {
        baseURL: 'http://localhost:4173',
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npx vite preview --port 4173',
        port: 4173,
        reuseExistingServer: !process.env.CI,
        timeout: 15000,
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
});
