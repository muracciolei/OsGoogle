/**
 * Joey Google Service Worker
 * Provides offline caching and functionality
 */

const CACHE_NAME = 'joeygoogle-v1';
const DYNAMIC_CACHE = 'joeygoogle-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/js/app.js',
  '/js/services/storage.js',
  '/js/services/rss.js',
  '/js/services/weather.js',
  '/js/services/quotes.js',
  '/js/components/search.js',
  '/js/components/shortcuts.js',
  '/icons/icon.svg'
];

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

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (!url.protocol.startsWith('http')) return;

  if (url.hostname === 'wttr.in' || 
      url.hostname === 'zenquotes.io' || 
      url.hostname === 'api.rss2json.com') {
    event.respondWith(
      fetch(request)
        .catch(() => new Response(JSON.stringify({}), {
          headers: { 'Content-Type': 'application/json' }
        }))
    );
    return;
  }

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

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});