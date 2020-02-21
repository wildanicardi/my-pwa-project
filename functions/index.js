var admin = require('firebase-admin');
var functions = require('firebase-functions');
var cors = require('cors')({
  origin: true
});
var webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
// insialisasi sdk firebase
var serviceAccount = require("./webdevwildan-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://webdevwildan.firebaseio.com"
});
// tambah data ke fungsional firebase cloud
exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin
      .database()
      .ref("posts")
      .push({
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image
      })
      .then(() => {
        var publicKey = "BHcjzp85fEWV75AJUao7hFtaM63uqGClIdrUVJn2OO9KExiyo6K8j8J5A4PwlKj0oKUBHHGWSl-PIPtTT5jEeJk";
        var privateKey = "WD6UiGLW3ZCqwcueo4nXKACdKDOencw5L99R6IZbZYU";
        webpush.setVapidDetails("mailto:aliwildan12@gmail.com", publicKey, privateKey);
        return admin.database().ref('subscriptions').once('value');
      })
      .then(subscriptions => {
        subscriptions.forEach(sub => {
          var push = {
            endpoint: sub.val().endpoint,
            keys: {
              auth: sub.val().keys.auth,
              p256dh: sub.val().keys.p256dh
            }
          };
          webpush.sendNotification(push, JSON.stringify({
              title: 'New Post',
              content: "New Post Added",
              openUrl: '/help'
            }))
            .catch(err => console.log(err));
        });
        response.status(201).json({
          Message: "Data Stored",
          id: request.body.id
        })
      })
      .catch(err => {
        response.status(500).json({
          error: err
        });
      });
  });
});