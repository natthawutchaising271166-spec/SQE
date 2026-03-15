const CACHE_NAME = 'sqe-support-v4-v1';
const ASSETS = [
  './', // หน้าแรก
  './index.html',
  './manifest.json',
  // ใส่ URL ของ Library ที่ใช้ เพื่อให้ใช้งานได้ Offline
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@300;400;500&family=Sora:wght@400;600;700;800&display=swap'
];

// 1. Install Event - เก็บไฟล์เข้า Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell...');
      return cache.addAll(ASSETS);
    }).catch(err => console.log('Cache failed', err))
  );
  self.skipWaiting(); // บังคับให้ใช้ Service Worker ใหม่ทันที
});

// 2. Activate Event - ล้าง Cache เก่า
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// 3. Fetch Event - ให้บริการไฟล์จาก Cache (Offline Strategy)
self.addEventListener('fetch', (event) => {
  // Strategy: Cache First, falling back to Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Optional: Add new requests to cache dynamically
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request.url, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Fallback ถ้าไม่มีเน็ตและไม่มีใน Cache
      console.log('Offline mode: Serving fallback');
    })
  );
});