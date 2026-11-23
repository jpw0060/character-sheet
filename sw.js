// Offline app shell. Hand-written; the build plugin (scripts/vite-sw-plugin.ts)
// fills in the two placeholders below and emits the result as dist/sw.js.
//
// - Install precaches every built file (URLs are relative to the SW scope, so
//   this works under /<repo>/ on GitHub Pages).
// - No early activation: an updated worker waits until the old one's tabs close,
//   so a session never mixes files from two builds.
// - Only same-origin GET requests are handled; everything else is left alone.
// - Nothing is written to any cache after install (no runtime caching).

const PRECACHE = ["./","./assets/BuilderPage-DpQS-AW7.js","./assets/PackImport-B-4xFrFL.js","./assets/Viewer-BTwb8l5a.js","./assets/index-1capq9XV.js","./assets/index-DgDrd1XI.css","./favicon.svg","./icons/apple-touch-icon-180.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/icon.svg","./index.html","./manifest.webmanifest"];
const CACHE = "shell-5aff2c0c6f";

const toUrl = (path) => new URL(path, self.registration.scope).href;
const INDEX = toUrl('./index.html');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // cache: 'reload' bypasses the HTTP cache so a fresh build is never
      // mixed with stale files held by the host's CDN/browser cache.
      .then((cache) => cache.addAll(PRECACHE.map((path) => new Request(toUrl(path), { cache: 'reload' })))),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => n.startsWith('shell-') && n !== CACHE).map((n) => caches.delete(n))),
      ),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Any URL variant of the app (directory URL, ?query, #hash) opens the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches
        .open(CACHE)
        .then((cache) => cache.match(INDEX))
        .then((hit) => hit || fetch(request)),
    );
    return;
  }

  event.respondWith(
    caches
      .open(CACHE)
      .then((cache) => cache.match(request))
      .then((hit) => hit || fetch(request)),
  );
});
