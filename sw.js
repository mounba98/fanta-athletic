const CACHE_NAME = 'fanta-athletic-v2025110520';
const urlsToCache = [
  '/',
  '/index.html',
  '/squadre.html',
  '/matchday.html',
  '/standings.html',
  '/statistiche.html',
  '/allenatori.html',
  '/giocatori.html',
  '/auth.html',
  '/resources/sheet.css',
  '/resources/logo.png',
  '/resources/firebase-cdn-loader.js',
  '/resources/firebase-app-compat.js',
  '/resources/firebase-auth-compat.js',
  '/resources/firebase-firestore-compat.js',
  '/resources/firebase-storage-compat.js',
  '/notifications.html'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Cache files one by one to avoid failures
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
      .then(results => {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        console.log(`Cache install: ${successful} successful, ${failed} failed`);
      })
  );
  self.skipWaiting();
});

// Fetch event - NETWORK FIRST (no cache for HTML/JS/CSS)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip Firestore and Firebase completely - let them handle their own requests
  if (url.hostname.includes('firestore.googleapis.com') || 
      url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis.com')) {
    return; // Don't intercept Firebase requests at all
  }
  
  // Skip cache for HTML, JS, CSS - always fetch fresh
  if (url.pathname.endsWith('.html') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') ||
      url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
        .catch(() => {
          console.warn('Fetch failed, returning offline response');
          return new Response('Offline', { status: 503 });
        })
    );
    return;
  }
  
  // For images and other assets, use cache first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Push notification event
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nuova notifica da Fanta Athletic',
    icon: '/resources/logo.png',
    badge: '/resources/logo.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {action: 'explore', title: 'Vai al sito', icon: '/resources/logo.png'},
      {action: 'close', title: 'Chiudi', icon: '/resources/logo.png'}
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Fanta Athletic', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
