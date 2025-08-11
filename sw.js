// Define o nome e a versão do cache
const CACHE_NAME = 'todo-zen-cache-v3';

// Lista de arquivos para armazenar em cache na instalação
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/script.js',
  './manifest.json',
  './assets/icon.svg'
];

// Evento de instalação: abre o cache e adiciona os arquivos da lista
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch: responde com o arquivo do cache se disponível (Cache First)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o recurso estiver no cache, retorna ele
        if (response) {
          return response;
        }
        // Caso contrário, busca na rede
        return fetch(event.request);
      })
  );
});

// Evento de ativação: limpa caches antigos para manter tudo atualizado
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
});
