var admin = require('firebase-admin');
var functions = require('firebase-functions');
var cors = require('cors')({
  origin: true
});

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
        response
          .status(201)
          .json({
            message: "Data Send",
            id: request.body.id
          });
      })
      .catch(err => {
        response.status(500).json({
          error: err
        });
      });
  });
});