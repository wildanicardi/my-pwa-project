importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

// file yang akan disimpan dalam pre caching statis
var urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image-lg.jpg",
  "/src/images/main-image-sm.jpg",
  "/src/images/main-image.jpg",
];
// variable cache static dan dynamic
var CACHE_STATIC_NAME = "static-v31";
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
  if (string.indexOf(self.origin) === 0) {
    // permintaan target domain di mana kita melayani halaman dari (yaitu tidak CDN)
    // console.log("matched ", string);
    cachePath = string.substring(self.origin.length); // mengambil bagian dari URL setelah domain (misalnya setelah localhost: 8080)
  } else {
    cachePath = string; // menyimpan permintaan penuh (untuk CDNs)
  }
  return array.indexOf(cachePath) > -1;
}
self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installing Service Worker ...", event);
  event.waitUntil(
    //melakukan precaching secara statis
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      console.log("[Service Worker] Precaching App Shell");
      cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activating Service Worker ....", event);
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] Removing old cache.", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var url = "https://webdevwildan.firebaseio.com/posts";
  // mengembalikan request dari cache secara dinamyc sesuai dengan request
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then(function (res) {
        var clonedRes = res.clone();
        clearAllData("posts")
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            // memasukkan data ke dalam indexed db
            for (var key in data) {
              writeData("posts", data[key]);
            }
          });
        return res;
      })
    );
    // mengecek apakah request terdapat di dalam cache static
  } else if (isInArray(event.request.url, urlsToCache)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else {
          // mengembalikan request dari cache secara dinamyc sesuai dengan request
          return (
            fetch(event.request)
            .then(function (res) {
              // mengembalikan request secara dynamic cache,
              //menunjukan halaman2 yang pernah di akses dan terismpan dalam cache
              return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
                // trimCache(CACHE_DYNAMIC_NAME, 5);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            // menampilkan halaman offline.html jika kondisi request offline,
            // dan belum pernah di akses tersimpan dalam cache
            .catch(function (err) {
              return caches.open(CACHE_STATIC_NAME).then(function (cache) {
                if (
                  event.request.headers.get("accept").includes("text/html")
                ) {
                  return cache.match("/offline.html");
                }
              });
            })
          );
        }
      })
    );
  }
});
// berfungsi untuk mengecek service worker apakah memiliki konektifitas dan tugas sinkronisasi
self.addEventListener("sync", function (event) {
  console.log("Background syncing", event);
  if (event.tag === "sync-new-post") {
    console.log("Syncing new Post");
    event.waitUntil(
      // menampilkan data dari indexed db
      readAllData("sync-posts")
      .then(function (data) {
        for (var dt of data) {
          // post data indexed db ke server
          fetch("https://us-central1-webdevwildan.cloudfunctions.net/storePostData", {
              method: "POST",
              headers: {
                "Content-Type": "Application/json",
                Accept: "Application/json"
              },
              body: JSON.stringify({
                id: dt.id,
                title: dt.title,
                location: dt.location,
                image: "https://firebasestorage.googleapis.com/v0/b/webdevwildan.appspot.com/o/sf-boat.jpg?alt=media&token=9219fb9d-34b1-47ea-b8dc-a403a7eb7281"
              })
            })
            .then(function (res) {
              console.log("send data to server", res);
              // menghapus data dari indexed db ketika berhasil d kirim ke serve
              if (res.ok) {
                res.json()
                  .then(function (resData) {
                    deletedItem("sync-posts", resData.id);
                  })
              }
            })
            .catch(function (err) {
              console.log("gagal mengirim data", err);
            });
        }
      })
    );
  }
});

// event notification click

self.addEventListener("notificationclick", function (event) {
  var notification = event.notification;
  var action = event.action;
  if (action === "confirm") {
    console.log("confirm was chooosen");
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll()
      .then(function (cls) {
        var client = cls.find(function (c) {
          return c.visibility === 'visible';
        });
        if (client !== undefined) {
          client.navigate(notification.data.url);
          client.focus();
        } else {
          clients.openWindow(notification.data.url);
        }
        notification.close();
      })
    )

  }
});
// event notification close
self.addEventListener("notificationclose", function (event) {
  console.log("notification close");
});

// event menerima push jika pada perangkat memiliki subscription yang mengirimkan pesan push

self.addEventListener('push', function (event) {
  console.log("Push Notification Received", event);
  var data = {
    title: "New!",
    content: "something new happend",
    openUrl: '/'
  };
  if (event.data) {
    data = JSON.parse(event.data.text());
  };
  // data yang akan ditampilkan dalam notification
  var options = {
    body: data.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
    data: {
      url: '/'
    }
  };
  // menampilkan event notification
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});