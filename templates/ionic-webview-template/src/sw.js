// Enhanced Service Worker for Fast Loading Website
// This service worker provides aggressive caching for 2-second loading performance

const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `timeless-cache-${CACHE_VERSION}`;
const WEBSITE_URL = 'http://timeless.ezassist.me';

// Resources to pre-cache for instant loading
const PRECACHE_URLS = [
  WEBSITE_URL,
  `${WEBSITE_URL}/`,
  `${WEBSITE_URL}/favicon.ico`
];

console.log('🚀 Enhanced Service Worker loading...');

// Install event - aggressively cache resources
self.addEventListener('install', (event) => {
  console.log('⚡ Service Worker: Installing with enhanced caching...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Pre-caching essential resources...');
        // Pre-cache critical resources for instant loading
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Pre-caching complete!');
      })
      .catch((error) => {
        console.error('❌ Service Worker: Pre-caching failed:', error);
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating...');
  
  // Take control immediately
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys();
    }).then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete!');
    })
  );
});

// Fetch event - Cache First strategy for maximum speed
self.addEventListener('fetch', (event) => {
  // Only handle requests to our website or same origin
  if (event.request.url.includes('timeless.ezassist.me') || 
      event.request.url.startsWith(self.location.origin)) {
    
    event.respondWith(
      cacheFirst(event.request)
    );
  }
});

// Cache First strategy - Prioritize speed over freshness
async function cacheFirst(request) {
  try {
    // Try cache first for maximum speed
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('⚡ Cache HIT (Fast loading):', request.url);
      
      // Background update for next time (stale-while-revalidate)
      backgroundUpdate(request);
      
      return cachedResponse;
    }
    
    // Cache miss - fetch from network
    console.log('🌐 Cache MISS - Fetching:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      // Clone response before caching (response can only be consumed once)
      cache.put(request, networkResponse.clone());
      console.log('💾 Cached new resource:', request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('❌ Service Worker fetch error:', error);
    
    // Try to return cached version as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('🔄 Fallback to cache:', request.url);
      return cachedResponse;
    }
    
    // If no cache, return error
    throw error;
  }
}

// Background update function for stale-while-revalidate
async function backgroundUpdate(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      console.log('🔄 Background update completed:', request.url);
    }
  } catch (error) {
    console.warn('⚠️ Background update failed:', request.url, error);
  }
}
