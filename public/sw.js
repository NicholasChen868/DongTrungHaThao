// ===================================
// SERVICE WORKER — ĐTHT Maldalla Duy Đức
// Strategy: Network-first cho HTML, Cache-first cho assets
// Version-based invalidation + Offline fallback page
// ===================================

// 🔑 Bump APP_VERSION khi deploy bản mới → tự xóa cache cũ
const APP_VERSION = '2';
const CACHE_PREFIX = 'mdd';
const CACHE_NAME = `${CACHE_PREFIX}-v${APP_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    OFFLINE_PAGE,
    '/manifest.json',
    '/images/icon-192.png',
    '/images/icon-512.png',
];

// Install — pre-cache critical assets + offline page
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — xóa TẤT CẢ cache cũ không match version hiện tại
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        ).then(() => {
            // Thông báo tất cả client reload khi có version mới
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: APP_VERSION,
                    });
                });
            });
        })
    );
    self.clients.claim();
});

// Fetch — network-first for HTML, cache-first for assets, offline fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET, Supabase API, analytics, extensions
    if (
        request.method !== 'GET' ||
        url.hostname.includes('supabase') ||
        url.hostname.includes('vercel-analytics') ||
        url.hostname.includes('va.vercel-scripts') ||
        url.pathname.startsWith('/api/') ||
        url.protocol === 'chrome-extension:'
    ) {
        return;
    }

    // HTML pages — network-first, fallback → cache → offline page
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Chỉ cache response hợp lệ
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(request)
                        .then((cached) => cached || caches.match(OFFLINE_PAGE))
                )
        );
        return;
    }

    // Static assets (JS, CSS, images, fonts) — cache-first + stale-while-revalidate
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ttf|ico|avif)$/)
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                // Trả cached ngay, đồng thời fetch bản mới để update cache
                const fetchPromise = fetch(request)
                    .then((response) => {
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                        }
                        return response;
                    })
                    .catch(() => cached);

                return cached || fetchPromise;
            })
        );
        return;
    }

    // Everything else — network with offline fallback
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});

// Message handler — cho phép client yêu cầu skip waiting
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
