var deferredPrompt;
var enableNotif = document.querySelectorAll(".enable-notifications");

if (!window.Promise) {
  window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function () {
      console.log("Service worker registered!");
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener("beforeinstallprompt", function (event) {
  console.log("beforeinstallprompt fired");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});
// menampilkan pesan notification
function displayConfirmNotification() {
  if ("serviceWorker" in navigator) {
    var option = {
      body: "Successfull notification",
      icon: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/sf-boat.jpg",
      vibrate: [100, 50, 200], //mengatur jeda dan getaran
      badge: "/src/images/icons/app-icon-96x96.png",
      tag: "confirmation-notification", // memberikan beberapa notifikasi sekaligus
      renotify: true,
      actions: [{
          action: "confirm",
          title: "okay",
          icon: "/src/images/icons/app-icon-96x96.png"
        },
        {
          action: "cancel",
          title: "cancel",
          icon: "/src/images/icons/app-icon-96x96.png"
        }
      ]
    };
    navigator.serviceWorker.ready.then(function (swReg) {
      swReg.showNotification("Success from [sw]", option);
    });
  }
}
// konfigurasi subscription push notification
function configurPushSub() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  var reg;
  navigator.serviceWorker.ready
    .then(function (swReg) {
      reg = swReg;
      return swReg.pushManager.getSubscription();
    })
    .then(function (sb) {
      if (sb === null) {
        //create a new subscription
        var vapidPublicKey =
          "BHcjzp85fEWV75AJUao7hFtaM63uqGClIdrUVJn2OO9KExiyo6K8j8J5A4PwlKj0oKUBHHGWSl-PIPtTT5jEeJk";
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey
        });
      } else {
        //memiliki subscription
      }
    }) // mengirim subscription ke server
    .then(function (newSub) {
      return fetch('https://webdevwildan.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(function (res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

// permission notification
function askPermissionNotification() {
  Notification.requestPermission(function (result) {
    console.log(result);
    if (result !== "granted") {
      console.log("No notification permission granted");
    } else {
      configurPushSub();
      // displayConfirmNotification();
    }
  });
}
// cek browser support notification
if ("Notification" in window && "serviceWorker" in navigator) {
  for (var i = 0; i < enableNotif.length; i++) {
    enableNotif[i].style.display = "inline-block";
    enableNotif[i].addEventListener("click", askPermissionNotification);
  }
}

// http get with vanilla js
// var xhr = new XMLHttpRequest();
// xhr.open('GET', 'https://httpbin.org/ip');
// xhr.responseType = 'json';

// xhr.onload = function() {
//   console.log(xhr.response);
// };

// xhr.onerror = function() {
//   console.log('Error!');
// };

// xhr.send();

// http get with fetch promise
// fetch('https://httpbin.org/ip')
//   .then(function(response) {
//     console.log(response);
//     return response.json();
//   })
//   .then(function(data) {
//     console.log(data);
//   })
//   .catch(function(err) {
//     console.log(err);
//   });
// http post with fethc promise
// fetch('https://httpbin.org/post', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   },
//   mode: 'cors',
//   body: JSON.stringify({message: 'Does this work?'})
// })
//   .then(function(response) {
//     console.log(response);
//     return response.json();
//   })
//   .then(function(data) {
//     console.log(data);
//   })
//   .catch(function(err) {
//     console.log(err);
//   });

// promise
// var promise = new Promise(function(resolve, reject) {
//   setTimeout(function() {
//     resolve('This is executed once the timer is done!');
//     reject({code: 500, message: 'An error occurred!'});
//     console.log('This is executed once the timer is done!');
//   }, 3000);
// });

// promise.then(function(text) {
//   return text;
// }).then(function(newText) {
//   console.log(newText);
// }).catch(function(err) {
//   console.log(err.code, err.message);
// });

// console.log('This is executed right after setTimeout()');