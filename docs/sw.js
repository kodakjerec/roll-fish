var staticRollFish = "roll-fish-0.3.0";

var assets = ["./asset-manifest.json","./db/inami.db.sqlite","./db/sql-wasm.js","./db/sql-wasm.wasm","./favicon.ico","./index.html","./logo192.png","./logo512.png","./manifest.json","./robots.txt","./static/css/main.4d28a720.css","./static/css/main.4d28a720.css.map","./static/js/main.1c7fe984.js","./static/js/main.1c7fe984.js.LICENSE.txt","./static/js/main.1c7fe984.js.map","./static/media/logo.dee4c97e2a1b4c976356.png","./static/media/roboto-all-300-normal.168d6383e73339293ac3.woff","./static/media/roboto-all-400-normal.c5d001fa922fa66a147f.woff","./static/media/roboto-all-500-normal.0ab669b7a0d19b178f57.woff","./static/media/roboto-all-700-normal.a457fde362a540fcadff.woff","./static/media/roboto-cyrillic-300-normal.1431d1cef06ad04f5458.woff2","./static/media/roboto-cyrillic-400-normal.71a33b6b50457b2c903a.woff2","./static/media/roboto-cyrillic-500-normal.cad7d3d9cb265e334e58.woff2","./static/media/roboto-cyrillic-700-normal.d010f1f324e111a22e53.woff2","./static/media/roboto-cyrillic-ext-300-normal.4777461b144e55145268.woff2","./static/media/roboto-cyrillic-ext-400-normal.804378952da8a10faae2.woff2","./static/media/roboto-cyrillic-ext-500-normal.62ced72e5832f02c2796.woff2","./static/media/roboto-cyrillic-ext-700-normal.be4d02458ce53887dc37.woff2","./static/media/roboto-greek-300-normal.db2632771401f61463fe.woff2","./static/media/roboto-greek-400-normal.c35e4c3958e209d17b31.woff2","./static/media/roboto-greek-500-normal.9ac81fefbe6c319ea40b.woff2","./static/media/roboto-greek-700-normal.50e795c1345353b0e996.woff2","./static/media/roboto-greek-ext-300-normal.35b9d6be04b95f0f0530.woff2","./static/media/roboto-greek-ext-400-normal.169619821ea93019d1bb.woff2","./static/media/roboto-greek-ext-500-normal.6fb9cffb1d3e72bf9293.woff2","./static/media/roboto-greek-ext-700-normal.bd9854c751441ccc1a70.woff2","./static/media/roboto-latin-300-normal.c48fb6765a9fcb00b330.woff2","./static/media/roboto-latin-400-normal.b009a76ad6afe4ebd301.woff2","./static/media/roboto-latin-500-normal.f25d774ecfe0996f8eb5.woff2","./static/media/roboto-latin-700-normal.227c93190fe7f82de3f8.woff2","./static/media/roboto-latin-ext-300-normal.dc7dcec8e3f654e0ed63.woff2","./static/media/roboto-latin-ext-400-normal.861b791f9de857a6e7bc.woff2","./static/media/roboto-latin-ext-500-normal.9165081d10e1ba601384.woff2","./static/media/roboto-latin-ext-700-normal.ed67ad54b1a8f5d21150.woff2","./static/media/roboto-vietnamese-300-normal.32fc45a3d1e8ea11fabc.woff2","./static/media/roboto-vietnamese-400-normal.3230f9b040f3c630e0c3.woff2","./static/media/roboto-vietnamese-500-normal.d8642a3d1d4ef6179644.woff2","./static/media/roboto-vietnamese-700-normal.3425a701027d0699e369.woff2"];

self.addEventListener("install", installEvent => {
  self.skipWaiting();
  
  installEvent.waitUntil(
    caches.open(staticRollFish).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [staticRollFish];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {

          console.log('remove cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (fetchEvent) => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(function(resp) {
      if (resp) {
        console.log('hit cache', resp.url);
      } else {
        console.log('miss cache', fetchEvent.request.url);
      }
      return resp || fetch(fetchEvent.request).then(function(response) {
        return caches.open(staticRollFish).then(function(cache) {
          if (fetchEvent.request.url.indexOf('http') === 0) {
            cache.put(fetchEvent.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});