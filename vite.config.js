import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                'ctv-dashboard': resolve(__dirname, 'ctv-dashboard.html'),
                admin: resolve(__dirname, 'admin.html'),
            },
        },
    },
});
