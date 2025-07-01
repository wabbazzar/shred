const CACHE_NAME = 'game-template-v1';
const GAME_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/mobile.css',
  '/styles/desktop.css',
  '/scripts/game.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
  // Add more game assets as needed:
  // '/assets/sprites/player.png',
  // '/assets/audio/background.mp3',
  // '/assets/fonts/game-font.woff2'
];

// Install event - cache essential game assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching game assets');
        return cache.addAll(GAME_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
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
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip caching for test files
  if (event.request.url.includes('/tests/')) {
    return;
  }
  
  // Skip caching for non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response for caching
            const responseToCache = response.clone();
            
            // Cache the new response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Offline fallback for HTML pages
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // For other assets, try to return a generic offline response
            if (event.request.destination === 'image') {
              return new Response('', {
                status: 200,
                statusText: 'Offline - Image not available'
              });
            }
          });
      })
  );
});

// Background sync for game data (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'game-data-sync') {
    event.waitUntil(
      // Sync game progress, high scores, etc.
      syncGameData()
    );
  }
});

// Push notifications for game events (optional)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/icon-192.png',
      badge: '/assets/icon-192.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Helper function for syncing game data
async function syncGameData() {
  try {
    // Implement game data synchronization logic here
    console.log('Service Worker: Syncing game data...');
    
    // Example: sync high scores, game progress, etc.
    // const gameData = await getGameDataFromIndexedDB();
    // await sendGameDataToServer(gameData);
    
    console.log('Service Worker: Game data sync complete');
  } catch (error) {
    console.error('Service Worker: Game data sync failed', error);
    throw error;
  }
} 