const CACHE_NAME = 'ultrapromax-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// Helper to check if a request should be bypassed from cache (e.g. API requests or video streams)
const shouldBypassCache = (url) => {
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/socket.io') ||
    url.pathname.includes('hot-update') ||
    url.searchParams.has('nocache')
  );
};

// Install Event - Pre-cache minimal essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event - Clean up stale cache configurations
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Purging obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event - Stale-While-Revalidate strategy for static resources with API bypass
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Exclude third-party APIs or server api endpoints from being cached
  if (shouldBypassCache(requestUrl) || event.request.method !== 'GET') {
    return; // Let the network handle it directly
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Cache a clone of the success response for future offline usages
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn('[Service Worker] Network request failed; serving fallback from cache if available.', err);
            return cachedResponse;
          });

        // Return from cache immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Listening for app notifications or update instructions
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
