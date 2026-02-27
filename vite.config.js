import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        // Target modern browsers for smaller bundles
        target: 'es2020',
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Smaller chunk size warnings
        chunkSizeWarningLimit: 150,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                'ctv-dashboard': resolve(__dirname, 'ctv-dashboard.html'),
                admin: resolve(__dirname, 'admin.html'),
                'cau-chuyen': resolve(__dirname, 'cau-chuyen.html'),
                'chia-se': resolve(__dirname, 'chia-se.html'),
                'ban-do-suc-khoe': resolve(__dirname, 'ban-do-suc-khoe.html'),
                'tuyen-dai-ly': resolve(__dirname, 'tuyen-dai-ly.html'),
                '404': resolve(__dirname, '404.html'),
                'chinh-sach-doi-tra': resolve(__dirname, 'chinh-sach-doi-tra.html'),
                'chinh-sach-bao-mat': resolve(__dirname, 'chinh-sach-bao-mat.html'),
                'dieu-khoan-su-dung': resolve(__dirname, 'dieu-khoan-su-dung.html'),
            },
            output: {
                // Manual chunks for better caching
                manualChunks: {
                    // Supabase client — rarely changes, cache well
                    supabase: ['@supabase/supabase-js'],
                    // Swiper — large lib, separate chunk
                    swiper: ['swiper'],
                    // Vercel analytics
                    analytics: ['@vercel/analytics'],
                },
            },
        },
        // Minification — esbuild (Vite built-in, no extra install)
        minify: 'esbuild',
    },
    // Optimize dev server
    server: {
        warmup: {
            clientFiles: ['./src/main.js'],
        },
    },
});
