// open indexedDB
var dbPromise = idb.open('posts-store', 1, function (db) {
  //membuat object store tabel
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {
      keyPath: 'id'
    });
  }
  if (!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', {
      keyPath: 'id'
    });
  }
});

// memasukkan data ke dalam indexed db
function writeData(st, data) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.put(data);
      return tx.done;
    });
}

// membaca data dari indexed db
function readAllData(st) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readonly');
      var store = tx.objectStore(st);
      return store.getAll();
    });
}
// menghapus data yang telah terhapus d server agar tidak menumpuk
function clearAllData(st) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.clear();
      return tx.done;
    })
}
// menghapus data per item berdasarkan id
function deletedItem(st, id) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.delete(id);
      return tx.done;
    })
}

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}