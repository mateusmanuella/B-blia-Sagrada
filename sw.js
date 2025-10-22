// sw.js - Service Worker otimizado para mobile
const STATIC_CACHE = 'biblia-mobile-v4';
const DYNAMIC_CACHE = 'biblia-dynamic-v2';
const OFFLINE_PAGE = './offline.html';

// Recursos críticos para mobile
const STATIC_ASSETS = [
  './',
  './index.html',
  './versiculos.html',
  './livros-da-biblia.html',
  './feedback.html',
  './feedback-admin.html',
  './resources.html',
  './fe.html',
  './css/estilo.css',
  './js/core.js',
  './js/search.js',
  './js/gallery.js',
  './js/feedback.js',
  './manifest.json',
  './favicon.svg',
  './offline.html',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// Estratégia: Cache First para recursos estáticos, Network First para conteúdo dinâmico
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Cache instalado para recursos móveis');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Falha na instalação do cache:', error);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker ativado para mobile');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  // Pular requisições não-GET e de diferentes origens
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    // Para recursos externos (Bootstrap), permitir mesmo sendo de origem diferente
    if (!event.request.url.includes('cdn.jsdelivr.net') && 
        !event.request.url.includes('fonts.googleapis.com') &&
        !event.request.url.includes('fonts.gstatic.com')) {
      return;
    }
  }
  
  // Estratégias diferentes por tipo de recurso
  const url = new URL(event.request.url);
  
  // Recursos estáticos - Cache First
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.href.includes('bootstrap') ||
      url.href.includes('googleapis')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(networkResponse => {
              // Verificar se a resposta é válida
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              
              // Cache da resposta para próximo uso
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(event.request, responseClone));
              return networkResponse;
            })
            .catch(() => {
              // Fallback para páginas HTML
              if (event.request.destination === 'document') {
                return caches.match(OFFLINE_PAGE);
              }
              return new Response('Recurso offline', { 
                status: 408,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        })
    );
    return;
  }
  
  // Imagens - Cache com stale-while-revalidate
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              // Verificar se a resposta é válida
              if (networkResponse && networkResponse.status === 200) {
                // Atualizar cache em background
                caches.open(DYNAMIC_CACHE)
                  .then(cache => cache.put(event.request, networkResponse.clone()));
              }
              return networkResponse;
            })
            .catch(() => {
              // Silenciosamente falha se não conseguir buscar
              return cachedResponse;
            });
            
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }
  
  // Padrão: Network First
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Cache de respostas bem-sucedidas
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback para cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Fallback genérico para páginas
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_PAGE);
            }
            
            return new Response('Recurso offline', { 
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background Sync para enviar feedback quando online
self.addEventListener('sync', event => {
  if (event.tag === 'background-feedback-sync') {
    event.waitUntil(
      // Implementar sync de feedback offline
      console.log('Sincronizando feedback em background...')
    );
  }
});