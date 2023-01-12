import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

import App from './App.vue'
import router from './router'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

import './assets/main.css'
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "game-white.firebaseapp.com",
  databaseURL: "https://game-white-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "game-white",
  storageBucket: "game-white.appspot.com",
  messagingSenderId: "114422395612",
  appId: "1:114422395612:web:a2733118068c7e1dbf3a19",
  measurementId: "G-23Y46F2N9X"
};


const app = createApp(App)

app.use(createPinia())
app.use(router)
// Initialize Firebase
const fApp = initializeApp(firebaseConfig);
// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
if (import.meta.env.DEV) {
  initializeAppCheck(fApp, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_CAPTCHA_KEY),

    // Optional argument. If true, the SDK automatically refreshes App Check
    // tokens as needed.
    isTokenAutoRefreshEnabled: true
  });
}
const auth = getAuth(fApp);
onAuthStateChanged(auth, (user) => {
  const userStore = useUserStore();
  userStore.user = user;
  if (user) {
    router.push('/')
  } else {
    router.push('/login')
  }
});
if (import.meta.env.DEV) { 
  const db = getDatabase(fApp);
  connectDatabaseEmulator(db, 'localhost', 9000);
}

library.add(faEnvelope, faLinkedin, faGithub);

app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')

