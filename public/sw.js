// ===================================
// SERVICE WORKER — ĐTHT Maldalla Duy Đức
// Strategy: Network-first cho HTML, Cache-first cho assets
// ===================================

const CACHE_NAME = 'mdd-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/images/icon-192.png',
    '/images/icon-512.png',
];

// Install — pre-cache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch — network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests, Supabase API, analytics
    if (
        request.method !== 'GET' ||
        url.hostname.includes('supabase') ||
        url.hostname.includes('vercel-analytics') ||
        url.pathname.startsWith('/api/')
    ) {
        return;
    }

    // HTML pages — network-first (always fresh content)
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request) || caches.match('/index.html'))
        );
        return;
    }

    // Static assets (JS, CSS, images, fonts) — cache-first
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ttf|ico)$/)
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // Everything else — network with cache fallback
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});
