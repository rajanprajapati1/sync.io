// Service Worker for Sync Music Player PWA
const CACHE_NAME = 'sync-music-player-v1';
const OFFLINE_URL = '/offline';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/auth',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Ensure the new service worker takes control immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Firebase and external API requests
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    handleFetch(event.request)
  );
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // For navigation requests (page loads)
    if (request.mode === 'navigate') {
      return await handleNavigationRequest(request);
    }
    
    // For static assets (CSS, JS, images)
    if (isStaticAsset(url.pathname)) {
      return await handleStaticAssetRequest(request);
    }
    
    // For API requests - network first
    return await handleApiRequest(request);
    
  } catch (error) {
    console.error('Fetch handler error:', error);
    
    // Fallback for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(OFFLINE_URL) || new Response('Offline');
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Handle navigation requests (page loads)
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Show offline page
    return await cache.match(OFFLINE_URL) || new Response('Offline');
  }
}

// Handle static asset requests (cache first)
async function handleStaticAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Return cached version and update in background
    updateCacheInBackground(request, cache);
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle API requests (network first with cache fallback)
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache for GET requests
    if (request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

// Update cache in background
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // Ignore background update errors
    console.log('Background cache update failed:', error);
  }
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) || pathname.startsWith('/_next/');
}

// Background sync for room state updates (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'room-state-sync') {
    event.waitUntil(syncRoomState());
  }
});

async function syncRoomState() {
  // This would sync pending room state changes when back online
  // Implementation would depend on the specific sync requirements
  console.log('Background sync: room state');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'sync-music-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'join',
          title: 'Join Room'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'join') {
    // Open the app and navigate to room
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});