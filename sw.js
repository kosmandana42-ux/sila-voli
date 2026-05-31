// Сила Воли — service worker для офлайн-режима
// Положи этот файл рядом с index.html (recovery-timer.html) на хостинге.
var CACHE = 'sila-voli-v1';

// Кэшируем саму страницу при установке
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(['./', './index.html']).catch(function(){ /* имена файлов могут отличаться — закэшируем по факту запросов */ });
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Стратегия: сеть с откатом в кэш; успешные ответы кладём в кэш
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(resp) {
      var copy = resp.clone();
      caches.open(CACHE).then(function(cache) { cache.put(e.request, copy); }).catch(function(){});
      return resp;
    }).catch(function() {
      return caches.match(e.request).then(function(hit) {
        return hit || caches.match('./') || caches.match('./index.html');
      });
    })
  );
});
