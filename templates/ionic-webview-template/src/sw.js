// Service Worker for caching website content
const CACHE_NAME = 'timeless-cache-v1';
const WEBSITE_URL = 'http://timeless.ezassist.me';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching website...');
        // Pre-cache the main website
        return cache.add(WEBSITE_URL);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Only handle requests to our website
  if (event.request.url.includes('timeless.ezassist.me')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version if available
          if (response) {
            console.log('Service Worker: Serving from cache:', event.request.url);
            return response;
          }
          
          // Otherwise fetch from network and cache it
          console.log('Service Worker: Fetching from network:', event.request.url);
          return fetch(event.request)
            .then((response) => {
              // Don't cache if not a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              // Add to cache
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            });
        })
    );
  }
});
