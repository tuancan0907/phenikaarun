// Service Worker: xử lý bấm nút trên thông báo (Tạm dừng / Đặt lại)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (event) => {
  const action = event.action; // 'pause' | 'reset' | '' (bấm vào thân thông báo)
  event.notification.close();

  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (action === 'pause' || action === 'reset') {
      list.forEach((c) => c.postMessage({ type: 'timer-action', action }));
      return;
    }
    // Bấm vào thân thông báo: mở lại app
    if (list.length) return list[0].focus();
    return self.clients.openWindow('./');
  })());
});

// Cache nhẹ để app mở được cả khi mạng yếu (các file cùng thư mục)
const CACHE = 'phenikaa-run-v1';
const ASSETS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
