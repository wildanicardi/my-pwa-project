var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var titleInput = document.querySelector("#title");
var locationInput = document.querySelector("#location");

function openCreatePostModal() {
  createPostArea.style.display = "block";
  setTimeout(function () {
    createPostArea.style.transform = "translateY(0)";
  }, 1);
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.transform = "translateY(100vh)";
  // createPostArea.style.display = 'none';
}

// function onSaveButtonClicked(event) {
//   console.log("clicked");
// }
shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = "url(" + data.image + ")";
  cardTitle.style.backgroundSize = "cover";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

// mengupdate data card
function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}
var url = "https://webdevwildan.firebaseio.com/posts.json";
var networkDataReceived = false;

// menampilkan data id halaman dashboard dari url
fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log("From web", data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

// mengecek url di dalam cache
if ("indexedDB" in window) {
  // menampilkan data ketika offline dari indexed db
  readAllData("posts").then(function (data) {
    if (!networkDataReceived) {
      console.log("from cache: ", data);
      updateUI(data);
    }
  });
}
// mengirim data ke server jika tidak memiliki service worker dan sync
function senData() {
  fetch("https://us-central1-webdevwildan.cloudfunctions.net/storePostData", {
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
        Accept: "Application/json"
      },
      body: JSON.stringify({
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        image: "https://firebasestorage.googleapis.com/v0/b/learnpwa-dc87b.appspot.com/o/sf-boat.jpg?alt=media&token=a1c5ab2a-9c67-4091-ae3d-b583e0d8113b"
      })
    })
    .then(function (res) {
      console.log('send data sync', res);
      updateUI();
    })
}
// tambah data ke indexed db
form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (titleInput.value.trim() === "" || locationInput.value.trim() === "") {
    alert("Masukkan data");
    return;
  }
  closeCreatePostModal();
  //sinkronisasi dengan service worker
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then(function (sw) {
      var post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value
      };
      //menambah data ke dalam indexed db
      writeData("sync-posts", post)
        .then(function () {
          sw.sync.register("sync-new-post");
        })
        .then(function () {
          var snackBarContainer = document.querySelector(
            "#confirmation-toast"
          );
          var data = {
            message: "Post telah disimpan secara synch"
          };
          snackBarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  } else {
    senData();
  }
});