// Master Image Editor Service Worker
// Professional offline functionality with intelligent caching

const CACHE_NAME = 'master-image-editor-v1.0.0';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const ASSETS_CACHE = 'assets-v1';

// Critical resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Asset patterns to cache dynamically
const CACHEABLE_PATTERNS = [
  /\.(js|css|woff2?|ttf|eot)$/,
  /\/assets\//,
  /\/fonts\//,
  /\/images\//
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /\/sync\//
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS.filter(url => {
          // Only cache if the resource exists
          return fetch(url, { method: 'HEAD' })
            .then(() => true)
            .catch(() => false);
        }));
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && 
                     cacheName !== ASSETS_CACHE;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Validate origin for security
  if (url.origin !== self.location.origin && !isAllowedOrigin(url.origin)) {
    return;
  }

  event.respondWith(handleFetch(request));
});

// Intelligent fetch handling
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Network-first strategy for API calls
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirst(request);
    }
    
    // Cache-first strategy for static assets
    if (CACHEABLE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await cacheFirst(request);
    }
    
    // Stale-while-revalidate for HTML pages
    if (request.destination === 'document') {
      return await staleWhileRevalidate(request);
    }
    
    // Default: network with cache fallback
    return await networkWithCacheFallback(request);
    
  } catch (error) {
    console.error('[SW] Fetch error:', sanitizeError(error));
    return await getCacheResponse(request) || createErrorResponse();
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    // Validate request before fetching
    if (!isValidRequest(request)) {
      throw new Error('Invalid request');
    }
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cacheResponse = await getCacheResponse(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cacheResponse = await getCacheResponse(request);
  
  if (cacheResponse) {
    return cacheResponse;
  }
  
  // Validate request before fetching
  if (!isValidRequest(request)) {
    throw new Error('Invalid request');
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(ASSETS_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cacheResponse = await getCacheResponse(request);
  
  // Always try to update cache in background
  const networkPromise = isValidRequest(request) ? fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(STATIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => null) : Promise.resolve(null);
  
  // Return cache immediately if available
  if (cacheResponse) {
    return cacheResponse;
  }
  
  // Otherwise wait for network
  return await networkPromise || createErrorResponse();
}

// Network with cache fallback
async function networkWithCacheFallback(request) {
  try {
    // Validate request before fetching
    if (!isValidRequest(request)) {
      throw new Error('Invalid request');
    }
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cacheResponse = await getCacheResponse(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    throw error;
  }
}

// Get response from any cache
async function getCacheResponse(request) {
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, ASSETS_CACHE];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    if (response) {
      return response;
    }
  }
  
  return null;
}

// Create error response for offline scenarios
function createErrorResponse() {
  return new Response(
    JSON.stringify({
      error: 'Network unavailable',
      message: 'This feature requires an internet connection',
      offline: true
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  // Validate message origin
  if (!isValidOrigin(event.origin)) {
    console.warn('[SW] Invalid message origin:', sanitizeError(event.origin));
    return;
  }
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'CACHE_ASSET':
      cacheAsset(payload.url, payload.cacheName || ASSETS_CACHE);
      break;
      
    case 'CLEAR_CACHE':
      clearCache(payload.cacheName);
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
      
    default:
      console.log('[SW] Unknown message type:', sanitizeError(type));
  }
});

// Cache specific asset
async function cacheAsset(url, cacheName = ASSETS_CACHE) {
  try {
    const cache = await caches.open(cacheName);
    await cache.add(url);
    console.log('[SW] Cached asset:', url);
  } catch (error) {
    console.error('[SW] Failed to cache asset:', sanitizeError(url), sanitizeError(error));
  }
}

// Clear specific cache
async function clearCache(cacheName) {
  try {
    const deleted = await caches.delete(cacheName);
    console.log('[SW] Cache cleared:', cacheName, deleted);
  } catch (error) {
    console.error('[SW] Failed to clear cache:', sanitizeError(cacheName), sanitizeError(error));
  }
}

// Get total cache size
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('[SW] Failed to calculate cache size:', sanitizeError(error));
    return 0;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'project-sync') {
    event.waitUntil(syncOfflineProjects());
  }
});

// Sync offline projects when connection is restored
async function syncOfflineProjects() {
  try {
    // Get offline projects from IndexedDB or localStorage
    const projects = await getOfflineProjects();
    
    for (const project of projects) {
      if (project.syncStatus === 'pending') {
        // Attempt to sync with server
        await syncProject(project);
      }
    }
    
    console.log('[SW] Offline projects synced');
  } catch (error) {
    console.error('[SW] Failed to sync offline projects:', sanitizeError(error));
  }
}

// Get offline projects (placeholder - implement based on storage strategy)
async function getOfflineProjects() {
  // This would integrate with your actual storage implementation
  return [];
}

// Sync individual project (placeholder)
async function syncProject(project) {
  // This would integrate with your actual sync API
  console.log('[SW] Syncing project:', sanitizeError(project.id));
}

// Security helper functions
function isValidOrigin(origin) {
  return origin === self.location.origin || isAllowedOrigin(origin);
}

function isAllowedOrigin(origin) {
  // Define allowed origins for your application
  const allowedOrigins = [
    // Add your allowed origins here
  ];
  return allowedOrigins.includes(origin);
}

function isValidRequest(request) {
  try {
    const url = new URL(request.url);
    // Only allow same-origin or explicitly allowed origins
    return url.origin === self.location.origin || isAllowedOrigin(url.origin);
  } catch {
    return false;
  }
}

function sanitizeError(error) {
  if (!error) return '';
  const str = typeof error === 'string' ? error : String(error);
  return str.replace(/[\r\n]/g, ' ').replace(/[\x00-\x1f\x7f-\x9f]/g, '').substring(0, 200);
}