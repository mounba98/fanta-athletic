const CACHE_NAME = 'fanta-athletic-v2026092501';
// Precaricati all'installazione: le librerie Firebase (le più pesanti, ~550 KB,
// identiche finché non si cambia versione) e le pagine principali.
const urlsToCache = [
  '/',
  '/index.html',
  '/auth.html',
  '/resources/logo.png',
  '/resources/firebase-app-compat.js',
  '/resources/firebase-auth-compat.js',
  '/resources/firebase-firestore-compat.js',
  '/resources/firebase-storage-compat.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  // Forza skipWaiting per aggiornare immediatamente il Service Worker
  self.skipWaiting();
  
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
});

// Fetch event (D099)
// - File con etichetta di versione (?v=...) e librerie Firebase locali:
//   PRIMA IL MAGAZZINO. Non possono essere vecchi: quando un file cambia
//   gli si cambia l'etichetta, quindi l'indirizzo è nuovo e si riscarica.
// - HTML e JS/CSS senza etichetta: PRIMA LA RETE (sempre freschi), con
//   copia di riserva per quando si è offline.
// - Immagini e altro: prima il magazzino (come prima).
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Solo file del sito: Firebase/Google e altri domini fanno da sé
  if (url.origin !== self.location.origin) return;

  const isCode = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');
  const isVersioned = url.searchParams.has('v');
  const isFirebaseLib = /\/resources\/firebase-[a-z-]+-compat\.js$/.test(url.pathname);

  if (isCode && (isVersioned || isFirebaseLib)) {
    event.respondWith(cacheFirst(event.request, url));
    return;
  }

  if (isCode || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
      if (response && response.status === 200 && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});

async function cacheFirst(request, url) {
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(request);
  if (hit) return hit;
  // Prima copia: la chiede al server (non a una copia del browser magari vecchia)
  const response = await fetch(request, { cache: 'no-cache' });
  if (response && response.status === 200 && response.type === 'basic') {
    await cache.put(request, response.clone());
    // Toglie le versioni vecchie dello stesso file (stesso percorso, etichetta diversa)
    const keys = await cache.keys();
    keys.forEach(k => {
      const ku = new URL(k.url);
      if (ku.pathname === url.pathname && ku.search !== url.search) cache.delete(k);
    });
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  } catch (e) {
    const match = await caches.match(request);
    return match || offlineResponse();
  }
}

function offlineResponse() {
  return new Response('Offline', {
    status: 503,
    statusText: 'Offline'
  });
}

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
