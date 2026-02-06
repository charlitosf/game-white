import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import "./assets/main.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { connectAuthEmulator, getAuth } from "@firebase/auth";
import { firebaseConfig } from "./firebaseConfig.prod";

const config = firebaseConfig;

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Initialize Firebase
const fApp = initializeApp(config);
if (import.meta.env.PROD) {
  initializeAppCheck(fApp, {
    // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
    // key is the counterpart to the secret key you set in the Firebase console.
    provider: new ReCaptchaV3Provider(
      import.meta.env.VITE_FIREBASE_CAPTCHA_KEY,
    ),

    // Optional argument. If true, the SDK automatically refreshes App Check
    // tokens as needed.
    isTokenAutoRefreshEnabled: true,
  });
} else if (import.meta.env.DEV) {
  const db = getDatabase(fApp);
  connectDatabaseEmulator(db, "localhost", 9000);

  const auth = getAuth(fApp);
  connectAuthEmulator(auth, "http://localhost:9099");
}

library.add(faEnvelope, faLinkedin, faGithub, faSpinner);

app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
