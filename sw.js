// sw.js - Service Worker profissional para cache offline
const STATIC_CACHE = 'biblia-static-v3';
const DYNAMIC_CACHE = 'biblia-dynamic-v1';
const OFFLINE_PAGE = './offline.html';

const STATIC_ASSETS = [
  './',
  './index.html',
  './versiculos.html',
  './livros-da-biblia.html',
  './feedback.html',
  './feedback-admin.html',
  './resources.html',
  './fe.html',
  './coragem.html',
  './sabedoria.html',
  './esperanca.html',
  './reflexao.html',
  './css/estilo.css',
  './js/core.js',
  './js/gallery.js',
  './js/feedback.js',
  './manifest.json',
  './favicon.svg',
  './offline.html'
];

// Instalação - cache dos assets essenciais
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Cache estático aberto, adicionando assets...');
        return cache.addAll(STATIC_ASSETS).catch(error => {
          console.warn('[SW] Erro ao adicionar alguns assets:', error);
        });
      })
      .then(() => {
        console.log('[SW] Todos os assets em cache!');
        return self.skipWaiting();
      })
  );
});

// Ativação - limpar caches antigos
self.addEventListener('activate', event => {
  console.log('[SW] Service Worker ativado!');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Pronto para controlar clientes!');
      return self.clients.claim();
    })
  );
});

// Estratégia: Cache First com fallback para Network
self.addEventListener('fetch', event => {
  // Ignorar requisições não-GET e de terceiros
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Para APIs e HTML, usar estratégia Network First
  if (event.request.url.includes('/api/') || event.request.destination === 'document') {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Para outros recursos, usar Cache First
  event.respondWith(cacheFirstStrategy(event.request));
});

// Estratégia: Cache First
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Servindo do cache:', request.url);
      return cachedResponse;
    }

    console.log('[SW] Buscando na rede:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Erro na rede:', error);
    
    // Fallbacks específicos
    if (request.destination === 'document') {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      if (offlinePage) return offlinePage;
    }
    
    if (request.destination === 'image') {
      const placeholder = await caches.match('./images/placeholder.jpg');
      if (placeholder) return placeholder;
    }
    
    return new Response('Recurso offline', {
      status: 408,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// Estratégia: Network First
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network First falhou, usando cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    if (request.destination === 'document') {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      if (offlinePage) return offlinePage;
    }
    
    return new Response('Página offline', {
      status: 408,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

// Mensagens do Service Worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: 'v3' });
  }
});

// Sincronização em background
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Sincronização em background');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementar sincronização de dados offline
  console.log('[SW] Executando sincronização...');
  return Promise.resolve();
}