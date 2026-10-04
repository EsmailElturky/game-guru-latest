export const environment = {
  api: 'https://gameguru-api.alternativesolutionstech.com/api/',
  imageApi: 'https://gameguru-api.alternativesolutionstech.com',
  tokenPropertyName: 'game_guru_token',
  userDataPropertyName: 'game_guru_user',
  defaultLanguage: 'ar',
  tapPayment: {
    chargesApiUrl: 'https://api.tap.company/v2/charges',
    publicKey: 'pk_test_6aRwNc8XeLE3YVo5xgrQBO1n',
    merchantId: '68038557',
    cardSdkScriptUrl: 'https://tap-sdks.b-cdn.net/card/1.0.2/index.js',
    cardSdkContainerId: 'tap-card-sdk-id',
    applePay: {
      scriptUrl: 'https://tap-sdks.b-cdn.net/apple-pay/build-1.2.0/main.js',
      cssUrl: 'https://tap-sdks.b-cdn.net/apple-pay/build-1.2.0/main.css',
      containerId: 'tap-apple-pay-button',

      environment: 'development' as 'development' | 'beta' | 'production',
    },
  },
  firebaseConfig: {
    apiKey: 'AIzaSyC2Zr7fXgCcNj6eYLe6VoRL90feMzzXJ2w',
    authDomain: 'goodgame-579c5.firebaseapp.com',
    projectId: 'goodgame-579c5',
    storageBucket: 'goodgame-579c5.firebasestorage.app',
    messagingSenderId: '491625263177',
    appId: '1:491625263177:web:0ff5926cc2b83e83660f98',
    measurementId: 'G-CLHX6KSPLY',
    /** Web Push key pair — Firebase Console → Project settings → Cloud Messaging → Web Push certificates */
    vapidKey: 'BCQ5bXTgll1KiCIhuvySFPiBkhpJlrytlPE1n9ykqD8WyVA2L9dHPgZM4zOCsyBBbBos7BZLQgodAEgUgoxo2vA',
  },
};
