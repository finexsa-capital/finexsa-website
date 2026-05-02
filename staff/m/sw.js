/**
 * FINEXSA Staff Mobile — Service Worker
 * Network First مع Cache Fallback
 */

const CACHE_VERSION = 'finexsa-m-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const CORE_FILES = [
  './login.html',
  './index.html',
  './cash.html',
  './report.html',
  './tasks.html',
  './receipt.html',
  './m.css',
  './manifest.json',
  '../icons/icon-192.png',
  '../icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CORE_FILES).catch((err) => {
        console.warn('[SW-M] فشل التخزين:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.hostname.includes('firebaseio') || url.hostname.includes('googleapis')) return;
  if (url.hostname.includes('script.google.com')) return;
  if (url.hostname.includes('identitytoolkit')) return;

  if (url.origin === location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const clone = response.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, clone);
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.destination === 'document') {
      return caches.match('./login.html');
    }
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, response));
      }
    }).catch(() => {});
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const clone = response.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, clone);
    }
    return response;
  } catch (err) { throw err; }
}
