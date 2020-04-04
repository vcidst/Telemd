/* eslint-env node */


var CACHE_NAME = 'tele-md-cache-v1';
//new
var urlsToCache = ['/css/main.css'];

self.addEventListener('install', function (event) {
  console.log('installing');
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).then(function () {
          console.log('All resources have been fetched and cached.');
        });
      })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);

    })
  );

});
