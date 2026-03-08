const CACHE_NAME = 'babspharm-v1';
const STATIC_ASSETS = [
  '/BABSPHARM./',
  '/BABSPHARM./index.html',
  '/BABSPHARM./manifest.json',
  '/BABSPHARM./icon-192x192.png',
  '/BABSPHARM./icon-512x512.png',
  '/BABSPHARM./icon-maskable-512x512.png'
];

// Install: cache static assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  // For API calls (Groq, Firebase etc), always use network
  if (
    event.request.url.includes('groq.com') ||
    event.request.url.includes('firebase') ||
    event.request.url.includes('firebaseio') ||
    event.request.url.includes('googleapis.com/identitytoolkit') ||
    event.request.url.includes('googleapis.com/storage')
  ) {
    return; // Let browser handle it normally
  }

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Return cached version and update cache in background
        fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(function() {});
        return cachedResponse;
      }
      // Not in cache, fetch from network
      return fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(function() {
        // Offline fallback for HTML pages
        if (event.request.destination === 'document') {
          return caches.match('/BABSPHARM./index.html');
        }
      });
    })
  );
});
