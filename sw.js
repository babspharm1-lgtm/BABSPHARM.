// BABSPHARM Cloud — Service Worker (Auto-versioning + Push Notifications)
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
  const external = ['firebase','firestore','googleapis','groq.com','gstatic.com','jsdelivr','fonts.google','cdnjs'];
  if(external.some(h => url.hostname.includes(h))) return;

  const alwaysFresh = ['.html', 'version.json', 'sw.js'];
  if(alwaysFresh.some(ext => url.pathname.includes(ext)) || url.pathname === '/' || url.pathname.endsWith('/')){
    event.respondWith(
      fetch(event.request, {cache: 'no-store'})
        .catch(() => caches.match(event.request))
    );
    return;
  }

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

// ── PUSH NOTIFICATIONS ──
self.addEventListener('push', event => {
  let data = {title: 'BABSPHARM Cloud', body: 'You have a new notification', icon: '/icon.png', badge: '/icon.png', url: '/'};
  try{
    if(event.data) data = {...data, ...event.data.json()};
  }catch(e){}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon.png',
      badge: data.badge || '/icon.png',
      tag: data.tag || 'babspharm',
      renotify: true,
      data: {url: data.url || '/'},
      actions: data.actions || [],
      vibrate: [200, 100, 200]
    })
  );
});

// Open app when notification is tapped
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(clients => {
      // Focus existing tab if open
      for(const client of clients){
        if(client.url.includes(self.location.origin) && 'focus' in client){
          return client.focus();
        }
      }
      // Open new tab
      if(self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
