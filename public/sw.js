importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

// file yang akan disimpan dalam pre caching statis
var urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  '/src/css/app.css',
  '/src/css/feed.css',
];
// variable cache static dan dynamic
var CACHE_STATIC_NAME = "static-v22";
var CACHE_DYNAMIC_NAME = "dinamyc-v2";


//memangkas cache
// function trimCache(cacheName, maxItem) {
//   caches.open(cacheName)
//     .then(function (cache) {
//       return cache.keys()
//         .then(function (keys) {
//           if (keys.length > maxItem) {
//             cache.delete(keys[0])
//               .then(trimCache(cacheName, maxItem))
//           }
//         });
//     });
// }

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // permintaan target domain di mana kita melayani halaman dari (yaitu tidak CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // mengambil bagian dari URL setelah domain (misalnya setelah localhost: 8080)
  } else {
    cachePath = string; // menyimpan permintaan penuh (untuk CDNs)
  }
  return array.indexOf(cachePath) > -1;
}
self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    //melakukan precaching secara statis
    caches.open(CACHE_STATIC_NAME)
    .then(function (cache) {
      console.log('[Service Worker] Precaching App Shell');
      cache.addAll(urlsToCache);
    })
  )
});

self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
    .then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          console.log('[Service Worker] Removing old cache.', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var url = 'https://learnpwa-dc87b.firebaseio.com/posts';
  // mengembalikan request dari cache secara dinamyc sesuai dengan request
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(fetch(event.request)
      .then(function (res) {
        var clonedRes = res.clone();
        clearAllData('posts')
          .then(function () {
            return clonedRes.json();
          }).then(function (data) {
            // memasukkan data ke dalam indexed db
            for (var key in data) {
              writeData('posts', data[key]);
            }
          });
        return res;
      })
    );
    // mengecek apakah request terdapat di dalam cache static
  } else if (isInArray(event.request.url, urlsToCache)) {
    event.respondWith(
      caches.match(event.request)
    );
  } else {
    event.respondWith(
      caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          // mengembalikan request dari cache secara dinamyc sesuai dengan request
          return fetch(event.request)
            .then(function (res) {
              // mengembalikan request secara dynamic cache,
              //menunjukan halaman2 yang pernah di akses dan terismpan dalam cache
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function (cache) {
                  // trimCache(CACHE_DYNAMIC_NAME, 5);
                  cache.put(event.request.url, res.clone());
                  return res;
                });
            })
            // menampilkan halaman offline.html jika kondisi request offline,
            // dan belum pernah di akses tersimpan dalam cache
            .catch(function (err) {
              return caches.open(CACHE_STATIC_NAME)
                .then(function (cache) {
                  if (event.request.headers.get('accept').includes('text/html')) {
                    return cache.match('/offline.html');
                  }
                });
            });
        }
      })
    );
  }
});