const CACHE_VERSION = 'finexsa-staff-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const CORE_FILES = [
  './login.html', './dashboard.html', './cash.html',
  './cash-report.html', './tasks.html', './admin-users.html',
  './companies.html', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(CORE_FILES).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => !k.startsWith(CACHE_VERSION)).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.hostname.includes('firebaseio') || url.hostname.includes('googleapis')) return;
  if (url.hostname.includes('script.google.com')) return;
  if (url.hostname.includes('identitytoolkit')) return;

  if (url.origin === location.origin) {
    e.respondWith((async () => {
      try {
        const res = await fetch(request);
        if (res && res.status === 200) {
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(request, res.clone());
        }
        return res;
      } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.destination === 'document') return caches.match('./login.html');
        throw err;
      }
    })());
  }
});
