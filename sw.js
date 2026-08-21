// Service worker: cachea la app para que abra sin conexión y recibe los PDF
// que llegan por el botón "Compartir" del celular (Web Share Target).

const CACHE_VERSION = 'firma-cc-v3';
const SHARED_FILES_CACHE = 'firma-cc-shared-files';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/@cantoo/pdf-lib@2.9.1/dist/pdf-lib.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((err) => console.warn('Precache falló (seguirá funcionando online):', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION && key !== SHARED_FILES_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Punto de entrada del "Compartir" del sistema operativo.
  if (event.request.method === 'POST' && url.pathname.endsWith('/share-target/')) {
    event.respondWith(handleSharedFile(event.request));
    return;
  }

  // Todo lo demás: cache primero, red como respaldo.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});

async function handleSharedFile(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (file) {
      const cache = await caches.open(SHARED_FILES_CACHE);
      await cache.put('/shared-file', new Response(file, {
        headers: { 'Content-Type': file.type || 'application/pdf' }
      }));
    }
  } catch (err) {
    console.warn('No se pudo leer el archivo compartido:', err);
  }
  return Response.redirect('./index.html?compartido=1', 303);
}
