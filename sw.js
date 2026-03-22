// BABSPHARM Cloud — Service Worker (Auto-versioning)
// This SW checks a version.json file on every load.
// To force all students to get latest files: just push version.json with a new timestamp.
// version.json is auto-updated by the admin panel deploy button.

const STATIC_CACHE = 'babspharm-static-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== STATIC_CACHE).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never intercept external services
  const external = ['firebase','firestore','googleapis','groq.com',
                    'gstatic.com','jsdelivr','fonts.google','cdnjs'];
  if(external.some(h => url.hostname.includes(h))) return;

  // HTML files and version.json — ALWAYS network, never cache
  const alwaysFresh = ['.html', 'version.json', 'sw.js'];
  if(alwaysFresh.some(ext => url.pathname.includes(ext)) ||
     url.pathname === '/' || url.pathname.endsWith('/')){
    event.respondWith(
      fetch(event.request, {cache: 'no-store'})
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else: network first, cache as fallback
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if(res && res.status === 200){
          caches.open(STATIC_CACHE).then(c => c.put(event.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
