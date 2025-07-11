const CACHE_NAME = 'workout-tracker-v3';
const WORKOUT_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/app.css',
  '/styles/mobile.css',
  '/styles/desktop.css',
  '/scripts/app.js',
  '/scripts/navigation.js',
  '/scripts/day-view.js',
  '/scripts/week-view.js',
  '/scripts/calendar-view.js',
  '/scripts/data-manager.js',
  '/scripts/csv-handler.js',
  '/scripts/service-worker-register.js',
  '/assets/icons/app_icon.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/data/workout_program.json'
];

// Install event - cache essential workout app assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing workout tracker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching workout app assets');
        return cache.addAll(WORKOUT_ASSETS.map(url => {
          // Add cache-busting parameter for development
          return new Request(url, { cache: 'reload' });
        }));
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
  console.log('Service Worker: Activating workout tracker...');
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
  
  // Skip caching for API calls or external resources
  if (event.request.url.includes('api') || !event.request.url.includes(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
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
                console.log('Service Worker: Caching new resource', event.request.url);
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            console.log('Service Worker: Network failed, serving offline fallback');
            
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
            
            // For CSS/JS files, return empty response to prevent errors
            if (event.request.destination === 'style' || event.request.destination === 'script') {
              return new Response('', {
                status: 200,
                statusText: 'Offline - Asset not available'
              });
            }
          });
      })
  );
});

// Background sync for workout data
self.addEventListener('sync', (event) => {
  if (event.tag === 'workout-data-sync') {
    event.waitUntil(
      syncWorkoutData()
    );
  }
});

// Push notifications for workout reminders (optional)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Time for your workout!',
      icon: '/assets/icons/app_icon.png',
      badge: '/assets/icons/app_icon.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      },
      actions: [
        {
          action: 'open-app',
          title: 'Open Workout'
        },
        {
          action: 'dismiss',
          title: 'Later'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || '6-Week Workout Reminder',
        options
      )
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open-app' || !event.action) {
    event.waitUntil(
      clients.matchAll().then((clients) => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          const url = event.notification.data?.url || '/';
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_WORKOUT_DATA') {
    // Cache workout data when updated
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.put('/workout-data', new Response(JSON.stringify(event.data.data)));
      })
    );
  }
});

// Helper function for syncing workout data
async function syncWorkoutData() {
  try {
    console.log('Service Worker: Syncing workout data...');
    
    // In a real app, this would sync with a server
    // For this offline-first app, we just ensure local data is backed up
    
    const cache = await caches.open(CACHE_NAME);
    const workoutData = await cache.match('/workout-data');
    
    if (workoutData) {
      const data = await workoutData.json();
      console.log('Service Worker: Workout data available offline', data);
    }
    
    console.log('Service Worker: Workout data sync complete');
  } catch (error) {
    console.error('Service Worker: Workout data sync failed', error);
    throw error;
  }
}

// Periodic background sync for workout reminders
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'workout-reminder') {
    event.waitUntil(
      checkWorkoutReminders()
    );
  }
});

// Helper function to check for workout reminders
async function checkWorkoutReminders() {
  try {
    const now = new Date();
    const today = now.toDateString();
    
    // Check if user has completed today's workout
    const cache = await caches.open(CACHE_NAME);
    const workoutData = await cache.match('/workout-data');
    
    if (workoutData) {
      const data = await workoutData.json();
      const todayComplete = data.completedDays && data.completedDays.includes(today);
      
      if (!todayComplete && now.getHours() === 18) { // 6 PM reminder
        self.registration.showNotification('Workout Reminder', {
          body: 'Don\'t forget to complete today\'s workout!',
          icon: '/assets/icons/app_icon.png',
          badge: '/assets/icons/app_icon.png',
          data: { url: '/' }
        });
      }
    }
  } catch (error) {
    console.error('Service Worker: Workout reminder check failed', error);
  }
}