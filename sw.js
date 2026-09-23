/* Prinz Rudolf - service worker: sempre l'ultima versione quando c'e' internet,
   e funziona anche offline con l'ultima copia scaricata. */
const CACHE='prinz-app';

self.addEventListener('install', function(e){ self.skipWaiting(); });

self.addEventListener('activate', function(e){
  e.waitUntil(self.clients.claim());
});

self.addEventListener('message', function(e){
  if(e.data==='skipWaiting'){ self.skipWaiting(); }
});

self.addEventListener('fetch', function(e){
  var req=e.request;
  if(req.method!=='GET') return;                 // POST/PUT ecc. passano diretti (Supabase)
  var url;
  try{ url=new URL(req.url); }catch(err){ return; }
  if(url.origin!==self.location.origin) return;  // solo file del sito (no Supabase/CDN esterni)
  // NETWORK-FIRST: prova sempre la rete (ultima versione), altrimenti la cache
  e.respondWith(
    fetch(req).then(function(res){
      try{ var copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }catch(err){}
      return res;
    }).catch(function(){
      return caches.match(req).then(function(m){ return m || caches.match('martina.html'); });
    })
  );
});
