/**
 * WebOS Service Worker
 * Provides offline caching and functionality
 */

const CACHE_NAME = 'webos-v1';
const DYNAMIC_CACHE = 'webos-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/core/storage.js',
  '/core/gestures.js',
  '/core/widgets.js',
  '/core/apps.js',
  '/core/launcher.js'
];

// Install event
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.log('[SW] Cache failed:', err))
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
            .map(key => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome_extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Skip API calls
  if (url.hostname === 'wttr.in' || url.hostname === 'api.github.com') {
    event.respondWith(
      fetch(request)
        .catch(() => new Response(JSON.stringify({}), {
          headers: { 'Content-Type': 'application/json' }
        }))
    );
    return;
  }

  // For navigation requests (HTML), try network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(response => response || caches.match('/index.html'));
        })
    );
    return;
  }

  // For static assets, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then(response => {
        return response || fetch(request).then(fetchResponse => {
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
  );
});

// Handle messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});