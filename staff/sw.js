/**
 * FINEXSA Staff — Service Worker
 * استراتيجية: Network First مع Cache Fallback
 * - يحاول جلب أحدث نسخة من الإنترنت دائماً
 * - عند الفشل، يستخدم النسخة المحفوظة محلياً
 */

const CACHE_VERSION = 'finexsa-staff-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// الملفات الأساسية التي نخزّنها فوراً عند التثبيت
const CORE_FILES = [
  './login.html',
  './dashboard.html',
  './cash.html',
  './cash-report.html',
  './tasks.html',
  './admin-users.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ─────── التثبيت ───────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CORE_FILES).catch((err) => {
        console.warn('[SW] فشل تخزين بعض الملفات:', err);
      });
    })
  );
  self.skipWaiting();
});

// ─────── التفعيل وتنظيف Cache القديم ───────
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

// ─────── استراتيجية الاستجابة ───────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // لا تتدخّل في طلبات Firebase/Apps Script أو غير-GET
  if (request.method !== 'GET') return;
  if (url.hostname.includes('firebaseio') || url.hostname.includes('googleapis')) return;
  if (url.hostname.includes('script.google.com')) return;
  if (url.hostname.includes('identitytoolkit')) return;

  // للملفات داخل النطاق: Network First
  if (url.origin === location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  // للموارد الخارجية (خطوط، CDN): Cache First
  event.respondWith(cacheFirst(request));
});

/**
 * Network First: حاول الإنترنت أولاً، عند الفشل ارجع للـ Cache
 */
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
    // لو ما وُجد في cache ولا في إنترنت، أرجع للوجن كنسخة احتياطية
    if (request.destination === 'document') {
      return caches.match('./login.html');
    }
    throw err;
  }
}

/**
 * Cache First: استخدم الـ Cache مباشرة، حدّثه في الخلفية
 */
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
  } catch (err) {
    throw err;
  }
}
