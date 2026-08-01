// FYP minimal offline service worker (stale-while-revalidate)
const CACHE = "fyp-v1";
const ASSETS = ["/", "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Next.js runtime chunks change frequently in dev/builds. Never cache them,
  // otherwise the app shell can point to deleted chunks and throw ChunkLoadError.
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(req));
    return;
  }

  // Network-first for API routes
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || new Response(JSON.stringify({ offline: true }), { status: 200 })))
    );
    return;
  }

  // Stale-while-revalidate for pages/assets
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (!res || !res.ok) return res;
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
