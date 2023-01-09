<template>
<div class="login-page">
   <div class="wallpaper"></div>

   <div class="container">
      <div v-if="!registerActive" class="card login" v-bind:class="{ error: emptyFields }">
         <h1>Sign In</h1>
         <form class="form-group" @submit.prevent="doLogin">
            <input v-model="emailLogin" type="email" class="form-control" placeholder="Email" required>
            <input v-model="passwordLogin" type="password" class="form-control" placeholder="Password" required>
            <input type="submit" class="btn btn-primary">
            <p>Don't have an account? <a href="#" @click="registerActive = !registerActive, emptyFields = false">Sign up here</a>
            </p>
         </form>
      </div>

      <div v-else class="card register" v-bind:class="{ error: emptyFields }">
         <h1>Sign Up</h1>
         <form class="form-group" @submit.prevent="doRegister">
            <input v-model="emailReg" type="email" class="form-control" placeholder="Email" required>
            <input v-model="passwordReg" type="password" class="form-control" placeholder="Password" required>
            <input v-model="confirmReg" type="password" class="form-control" placeholder="Confirm Password" required>
            <input type="submit" class="btn btn-primary">
            <p>Already have an account? <a href="#" @click="registerActive = !registerActive, emptyFields = false">Sign in here</a>
            </p>
         </form>
      </div>
   </div>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const emailReg = ref('');
const passwordReg = ref('');
const confirmReg = ref('');

const emailLogin = ref('');
const passwordLogin = ref('');

const registerActive = ref(false);
const emptyFields = ref(false);

const doRegister = () => {
   if (emailReg.value == '' || passwordReg.value == '' || confirmReg.value == '') {
      emptyFields.value = true;
   } else {
      emptyFields.value = false;
      if (passwordReg.value != confirmReg.value) {
         alert('Passwords do not match');
         return;
      }
      // Register using firebase auth
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, emailReg.value, passwordReg.value)
         .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`${errorCode}: ${errorMessage}}`)
         });
   }
}

const doLogin = () => {
   if (emailLogin.value == '' || passwordLogin.value == '') {
      emptyFields.value = true;
   } else {
      emptyFields.value = false;
      // Login using firebase auth
      const auth = getAuth();
      signInWithEmailAndPassword(auth, emailLogin.value, passwordLogin.value)
         .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`${errorCode}: ${errorMessage}}`)
         });
   }
}
</script>

<style scoped>
p {
   line-height: 2rem;
}

.card {
   padding: 30px;
   background-color: rgb(37, 37, 37);
}

.login-page {
  align-items: center;
  display: flex;
  height: 85vh;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

h1 {
  margin-bottom: 1.5rem;
}


.wallpaper {
  background: rgb(10, 96, 50);
  height: 100%;
  position: absolute;
  width: 100%;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.error {
   animation-name: errorShake;
   animation-duration: 0.3s;
}

@keyframes errorShake {
   0% {
      transform: translateX(-25px);
   }
   25% {
      transform: translateX(25px);
   }
   50% {
      transform: translateX(-25px);
   }
   75% {
      transform: translateX(25px);
   }
   100% {
      transform: translateX(0);
   }
}
</style>