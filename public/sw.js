const CACHE_NAME = 'neuroscan-cache-v1';
const assets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {
        // Offline HTML page fallback for standard page navigations
        if (e.request.mode === 'navigate') {
          return new Response(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <title>NeuroScan AI - Offline Cache Mode</title>
                <style>
                  body {
                    background: #090D1A;
                    color: #F8FAFC;
                    font-family: system-ui, -apple-system, sans-serif;
                    text-align: center;
                    padding: 80px 20px;
                  }
                  h1 { color: #818CF8; font-size: 2rem; margin-bottom: 12px; }
                  p { color: #94A3B8; font-size: 1rem; max-width: 440px; margin: 0 auto; line-height: 1.6; }
                </style>
              </head>
              <body>
                <h1>Connection Interrupted</h1>
                <p>The NeuroScan AI clinic database portal is currently offline. Active Roboflow workflow inference nodes require an online connection to run segmentations.</p>
              </body>
            </html>
          `, { headers: { 'Content-Type': 'text/html' } });
        }
      });
    })
  );
});
