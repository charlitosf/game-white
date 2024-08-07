<template>
  <div class="login-page">
    <div class="wallpaper"></div>

    <div v-if="userStore.authSettled" class="container">
      <div
        v-if="!registerActive"
        class="card"
        v-bind:class="{ error: emptyFields }"
      >
        <h1>Sign In</h1>
        <form
          v-if="userStore.authSettled"
          class="form-group"
          @submit.prevent="doLogin"
        >
          <input
            v-model="emailLogin"
            type="email"
            class="form-control"
            placeholder="Email"
            required
          />
          <input
            v-model="passwordLogin"
            type="password"
            class="form-control"
            placeholder="Password"
            required
          />
          <input type="submit" class="btn btn-primary" />
          <p>
            Don't have an account?
            <a
              href="#"
              @click="(registerActive = !registerActive), (emptyFields = false)"
              >Sign up here</a
            >
          </p>
        </form>
      </div>

      <div v-else class="card" v-bind:class="{ error: emptyFields }">
        <h1>Sign Up</h1>
        <form class="form-group" @submit.prevent="doRegister">
          <input
            v-model="nameReg"
            type="text"
            class="form-control"
            placeholder="Name"
            required
          />
          <input
            v-model="emailReg"
            type="email"
            class="form-control"
            placeholder="Email"
            required
          />
          <input
            v-model="passwordReg"
            type="password"
            class="form-control"
            placeholder="Password"
            required
          />
          <input
            v-model="confirmReg"
            type="password"
            class="form-control"
            placeholder="Confirm Password"
            required
          />
          <input type="submit" class="btn btn-primary" />
          <p>
            Already have an account?
            <a
              href="#"
              @click="(registerActive = !registerActive), (emptyFields = false)"
              >Sign in here</a
            >
          </p>
        </form>
      </div>
    </div>
    <font-awesome-icon class="icon" v-else :icon="['fas', 'spinner']" spin />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const userStore = useUserStore();

const nameReg = ref("");
const emailReg = ref("");
const passwordReg = ref("");
const confirmReg = ref("");

const emailLogin = ref("");
const passwordLogin = ref("");

const registerActive = ref(false);
const emptyFields = ref(false);

const doRegister = async () => {
  if (
    nameReg.value == "" ||
    emailReg.value == "" ||
    passwordReg.value == "" ||
    confirmReg.value == ""
  ) {
    emptyFields.value = true;
  } else {
    emptyFields.value = false;
    if (passwordReg.value != confirmReg.value) {
      alert("Passwords do not match");
      return;
    }
    // Register using firebase auth
    const result = await userStore.signUp(
      nameReg.value,
      emailReg.value,
      passwordReg.value
    );
    if (result !== null) {
      alert(`${result.code}: ${result.message}`);
    }
  }
};

const doLogin = async () => {
  if (emailLogin.value == "" || passwordLogin.value == "") {
    emptyFields.value = true;
  } else {
    emptyFields.value = false;
    // Login using firebase auth
    const result = await userStore.signIn(
      emailLogin.value,
      passwordLogin.value
    );
    if (result !== null) {
      alert(`${result.code}: ${result.message}`);
    }
  }
};
</script>

<style scoped>
.icon {
  font-size: 50px;
}
p {
  line-height: 2rem;
}

.card {
  padding: 30px;
  background-color: rgb(37, 37, 37);
}

.login-page {
  align-items: center;
  justify-content: center;
  display: flex;
  height: 85vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
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

.fade-enter,
.fade-leave-to {
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
