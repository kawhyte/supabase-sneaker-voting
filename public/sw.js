// Service Worker for SoleTracker Push Notifications
const CACHE_NAME = 'soletracker-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event (basic caching strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('Failed to parse push notification data:', e);
  }

  const title = data.title || 'SoleTracker Price Alert';
  const options = {
    body: data.body || 'A monitored item has reached your target price!',
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    image: data.image,
    tag: data.tag || 'price-alert',
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Product',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ],
    data: {
      url: data.url || '/dashboard',
      productId: data.productId,
      monitorId: data.monitorId,
      price: data.price,
      storeName: data.storeName,
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Open the product or dashboard page
    const urlToOpen = event.notification.data?.url || '/dashboard';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if we already have a window open
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }

          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification (already closed above)
    console.log('Notification dismissed');
  } else {
    // Default action (no action button clicked)
    const urlToOpen = event.notification.data?.url || '/dashboard';

    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Background sync event (for future use)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background tasks like updating price data
      console.log('Performing background sync...')
    );
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});