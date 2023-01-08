import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

import App from './App.vue'
import router from './router'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// https://firebase.google.com/docs/web/setup#available-libraries

import './assets/main.css'
import { getAuth, onAuthStateChanged } from 'firebase/auth';


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

app.mount('#app')

