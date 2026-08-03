const CACHE_PREFIX = 'atm10-guide-';
const CACHE = `${CACHE_PREFIX}v28`;
const APP_SHELL = [
  './',
  './index.html',
  './chapter-guides.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './updates.json',
  './CLOUD_AND_UPDATES.md',
];

async function cacheSuccessfulResponse(request, response) {
  if (response.ok && response.type === 'basic') {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function fetchUpdate(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    return cacheSuccessfulResponse(request, response);
  } catch {
    return caches.match(request);
  }
}

async function fetchAppResource(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    return cacheSuccessfulResponse(request, response);
  } catch {
    if (request.mode === 'navigate') {
      return caches.match('./index.html');
    }
    return undefined;
  }
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE)
          .map(key => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/updates.json')) {
    event.respondWith(fetchUpdate(request));
    return;
  }

  event.respondWith(fetchAppResource(request));
});
