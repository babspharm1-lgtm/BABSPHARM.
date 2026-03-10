const CACHE = 'babspharm-v2';
const PRECACHE = [
  '/BABSPHARM./index-2.html',
  '/BABSPHARM./manifest.json',
  '/BABSPHARM./icon-192x192.png',
  '/BABSPHARM./icon-512x512.png',
  '/BABSPHARM./icon-maskable-512x512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('firestore.googleapis.com') ||
      e.request.url.includes('anthropic.com') ||
      e.request.url.includes('groq.com')) {
    return e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      var networkFetch = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => null);
      return cached || networkFetch;
    })
  );
});

self.addEventListener('push', e => {
  var data = e.data ? e.data.json() : { title: 'BABSPHARM Cloud', body: 'New update!' };
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || '/BABSPHARM./icon-192x192.png',
    badge: '/BABSPHARM./icon-96x96.png',
    tag: data.tag || 'babspharm'
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/BABSPHARM./index-2.html'));
});
