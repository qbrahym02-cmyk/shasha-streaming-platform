/* عامل خدمة شاشة — تخزين مؤقت ذكي للأصول الثابتة فقط */
const VERSION = 'shasha-v1';
const STATIC_CACHE = `${VERSION}-static`;
const IMG_CACHE = `${VERSION}-img`;

const PRECACHE = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // الفيديو والصور الخارجية لا تُخزن

  // التنقل: الشبكة أولاً
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match('/offline.html').then((r) => r || caches.match('/'))
      )
    );
    return;
  }

  // ملصقات وأيقونات وصور محسّنة: ذاكرة أولاً
  const isImage =
    url.pathname.startsWith('/posters/') ||
    url.pathname.startsWith('/backdrops/') ||
    url.pathname.startsWith('/icons/') ||
    (url.pathname.startsWith('/_next/image') && (url.searchParams.get('url') || '').startsWith('/'));

  if (isImage) {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return hit || Response.error();
        }
      })
    );
    return;
  }

  // أصول Next الثابتة (موقعة): ذاكرة أولاً
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
  }

  // API وبقية الطلبات: شبكة فقط (لا تعترض)
});
