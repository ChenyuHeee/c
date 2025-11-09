/*
  Service Worker for Online C Compiler v1.3.19
  - Precache core assets for offline edit/view
  - Runtime cache for GET requests (cache-first with network fallback)
  Note: bump VERSION when index.html or core assets change to refresh cache.
*/
const VERSION = 'v1.3.19';
const CACHE_NAME = `c-compiler-${VERSION}`;
const CORE_ASSETS = [
  './',
  './index.html',
  './about.html',
  './manifest.webmanifest',
  './img/icon.svg',
  './img/WeChat.jpeg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // only cache GET

  // Prefer cache-first for same-origin and CDN static resources
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          // Clone and store in cache if ok
          const respClone = resp.clone();
          if (
            resp.status === 200 &&
            (req.url.startsWith(self.location.origin) || /cdnjs|cdn.jsdelivr|unpkg|fonts\.googleapis|gstatic/.test(req.url))
          ) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone)).catch(() => {});
          }
          return resp;
        })
        .catch(() => {
          // Offline fallback: try cache again or return a simple Response
          return caches.match(req).then((hit) =>
            hit ||
            new Response('离线模式：资源不可用。请连接网络后重试。', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
          );
        });
    })
  );
});
