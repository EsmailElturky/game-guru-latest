/* eslint-disable no-undef */
/** Firebase Cloud Messaging service worker (must be served from site root). */
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyC2Zr7fXgCcNj6eYLe6VoRL90feMzzXJ2w',
  authDomain: 'goodgame-579c5.firebaseapp.com',
  projectId: 'goodgame-579c5',
  storageBucket: 'goodgame-579c5.firebasestorage.app',
  messagingSenderId: '491625263177',
  appId: '1:491625263177:web:0ff5926cc2b83e83660f98',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data ?? {};

  // Notify open tabs (e.g. login payment screen) when the app is in the background.
  const pushPayload = {
    notification: payload.notification,
    data,
  };

  self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: 'FCM_PUSH', payload: pushPayload });
        client.postMessage({ type: 'FCM_PAYMENT_PUSH', data });
      }
    });

  const title = payload.notification?.title ?? 'Game Guru';
  const options = {
    body: payload.notification?.body,
    data,
  };
  self.registration.showNotification(title, options);
});
