const CACHE_NAME = 'kitten-game-cache-v2';
const PRECACHE_URLS = [
  'https://cdn.jsdelivr.net/gh/KRISLAWW435/Cat-assets-@main/cat/cat2.webp',
  'https://cdn.jsdelivr.net/gh/KRISLAWW435/Cat-assets-@main/bg/bgst.webp',
  'https://cdn.jsdelivr.net/gh/KRISLAWW435/Cat-assets-@main/bg/bg1.webp',
  'https://cdn.jsdelivr.net/gh/KRISLAWW435/Cat-assets-@main/cat/cat.webp',
  'https://cdn.jsdelivr.net/gh/KRISLAWW435/Cat-assets-@main/cat/%D0%BC%D1%83%D1%80%D1%87%D0%B0%D0%BD%D0%B8%D0%B5.webp',
  'https://cdn.jsdelivr.net/gh/KRISLAWW435/Cat-assets-@main/cat/%D0%BB%D0%B0%D0%BF%D0%BA%D0%B0/paw2.webp',
  'https://cdn.jsdelivr.net/gh/KRISLAWW435/Cat-assets-@main/cat/%D0%BB%D0%B0%D0%BF%D0%BA%D0%B0/paw1.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching files');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Мы кешируем только GET-запросы
  if (event.request.method !== 'GET') return;

  // Не трогаем запросы к API с расширениями браузера
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Ищем в кеше
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Иначе идем в сеть и сохраняем ответ в кеш
      return fetch(event.request).then((networkResponse) => {
        // Кешируем только успешные ответы
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }
        
        // Клонируем ответ, т.к. streams можно прочитать только один раз
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch((error) => {
        console.error('[Service Worker] Fetch failed:', error);
        // Тут можно отдавать fallback контент, если сети нет и ресурса нет в кеше
        throw error;
      });
    })
  );
});
