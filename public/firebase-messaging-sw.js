importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyDoXbeRwWuAM2OeSYM2KpEQ08N9-VZvV-c",
  authDomain: "swapride-intrastate-72729.firebaseapp.com",
  projectId: "swapride-intrastate-72729",
  storageBucket: "swapride-intrastate-72729.firebasestorage.app",
  messagingSenderId: "32487957135",
  appId: "1:32487957135:web:ecd8f1072a3ded888486fa",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png", // Verify if logo exists or remove
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
