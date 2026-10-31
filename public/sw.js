// Talanta Stadium Progressive Web App (PWA) Service Worker
// ST-Tech ICT Consultants - Senior Mobile Web Architecture
// Version: v1.0.4

const CACHE_NAME = 'talanta-pwa-v1.0.4';
const OFFLINE_FALLBACK_URL = '/offline';

// Core static assets for offline shell
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-maskable.svg',
];

// Sensitive paths that must NEVER be cached (Requirement 7: Mobile Security)
const SENSITIVE_URL_PATTERNS = [
  /^\/api\//,
  /^\/account\//,
  /^\/portal\//,
  /^\/staff(?:\/|$)/,
  /^\/gate(?:\/|$)/,
  /^\/checkout(?:\/|$)/,
  /^\/admin(?:\/|$)/,
];

// Install event - pre-cache offline shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-caching partial failure:', err);
      });
    })
  );
  // Do not automatically skip waiting; wait for user confirmation or activation
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Removing outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Check if request is sensitive
function isSensitiveRequest(url, method) {
  if (method !== 'GET') return true;
  return SENSITIVE_URL_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

// Fetch event - strategic caching & offline fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Only handle requests from our own origin
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Strict Security: Bypass cache for sensitive API, payment, and admin paths
  if (isSensitiveRequest(url, request.method)) {
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request).catch(async () => {
          const fallback = await caches.match(OFFLINE_FALLBACK_URL);
          return fallback || new Response(
            '<html><body><h1>Talanta Stadium Offline</h1><p>This private page is not available offline.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
      );
    }
    return; // Pass directly to network
  }

  // 3. Static Assets & Icons: Cache-First with Network Fallback
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. HTML Navigation Requests: Network-First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If valid response, cache the HTML page
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network failed, check cache for requested page
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }
          // Fall back to dedicated offline fallback page
          const fallback = await caches.match(OFFLINE_FALLBACK_URL);
          if (fallback) {
            return fallback;
          }
          return new Response(
            '<html><body><h1>Talanta Stadium Offline</h1><p>You are currently offline. Please check your internet connection.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 5. General Scripts and Styles: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Update event listener (Requirement 2: Update Notifications)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
