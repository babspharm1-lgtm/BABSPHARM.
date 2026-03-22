// BABSPHARM Cloud — Service Worker v2.5.0
const CACHE_VERSION = 'babspharm-v2.5.0';
const CACHE_NAME = CACHE_VERSION;

// Skip waiting immediately on install
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Delete ALL old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Network First — always try network, cache only for offline
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Never intercept Firebase, Groq, or external APIs
  if(url.hostname.includes('firebase') || url.hostname.includes('firestore') ||
     url.hostname.includes('googleapis') || url.hostname.includes('groq.com') ||
     url.hostname.includes('gstatic.com') || url.hostname.includes('jsdelivr')) return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        if(res && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// Handle skip waiting message
self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
