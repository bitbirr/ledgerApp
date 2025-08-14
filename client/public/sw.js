const CACHE_NAME = 'credit-debit-v1.0.0';
const STATIC_CACHE_NAME = 'credit-debit-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'credit-debit-dynamic-v1.0.0';

// Assets to precache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json',
  // Google Fonts will be cached dynamically
];

// Runtime cache URLs
const RUNTIME_CACHE_URLS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets precached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with network first strategy
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for caching
          const responseClone = response.clone();
          
          // Cache successful responses
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Handle Google Fonts and other runtime cache URLs
  if (RUNTIME_CACHE_URLS.some(url => request.url.includes(url))) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => cache.put(request, responseClone));
              
              return response;
            });
        })
    );
    return;
  }

  // Handle navigation requests (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/')
        .then((cachedResponse) => {
          return cachedResponse || fetch('/');
        })
    );
    return;
  }

  // Handle static assets with cache first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseClone = response.clone();
            
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
            
            return response;
          });
      })
  );
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
  
  if (event.tag === 'sync-backup') {
    event.waitUntil(syncBackup());
  }
});

// Handle periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'backup-data') {
    event.waitUntil(performPeriodicBackup());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have pending transactions to review',
    icon: '/manifest-icon-192.png',
    badge: '/badge-icon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'view-transactions',
        title: 'View Transactions',
        icon: '/action-icon-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/action-icon-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Credit Debit', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();

  if (event.action === 'view-transactions') {
    event.waitUntil(
      clients.openWindow('/?view=transactions')
    );
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

// Helper function to sync transactions (placeholder for actual implementation)
async function syncTransactions() {
  console.log('[SW] Syncing transactions...');
  
  try {
    // This would integrate with IndexedDB to get pending transactions
    // and attempt to sync them with a backend service if available
    
    // For now, just resolve as this is an offline-first app
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Transaction sync failed:', error);
    throw error;
  }
}

// Helper function to sync backup (placeholder for Google Drive integration)
async function syncBackup() {
  console.log('[SW] Syncing backup...');
  
  try {
    // This would integrate with Google Drive API for backup
    // For now, just resolve
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Backup sync failed:', error);
    throw error;
  }
}

// Helper function for periodic backup
async function performPeriodicBackup() {
  console.log('[SW] Performing periodic backup...');
  
  try {
    // Implement periodic backup logic here
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Periodic backup failed:', error);
    throw error;
  }
}

// Error handler
self.addEventListener('error', (event) => {
  console.error('[SW] Service worker error:', event.error);
});

// Unhandled promise rejection handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service worker script loaded');
