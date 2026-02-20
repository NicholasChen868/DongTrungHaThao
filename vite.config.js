import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                'ctv-dashboard': resolve(__dirname, 'ctv-dashboard.html'),
                admin: resolve(__dirname, 'admin.html'),
                'thanh-vien': resolve(__dirname, 'thanh-vien.html'),
                'cau-chuyen': resolve(__dirname, 'cau-chuyen.html'),
                'chia-se': resolve(__dirname, 'chia-se.html'),
                'tra-cuu': resolve(__dirname, 'tra-cuu.html'),
                'ban-do-suc-khoe': resolve(__dirname, 'ban-do-suc-khoe.html'),
                'tuyen-ctv': resolve(__dirname, 'tuyen-ctv.html'),
                '404': resolve(__dirname, '404.html'),
            },
        },
    },
});
