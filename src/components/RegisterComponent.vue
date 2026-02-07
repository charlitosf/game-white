<template>
  <div class="card" v-bind:class="{ error: emptyFields }">
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
        Don't want an account?
        <router-link :to="{ name: 'login-anonymous' }"
          >Just enter your name here</router-link
        >
      </p>
      <p>
        Already have an account?
        <router-link :to="{ name: 'login-normal' }">Sign in here</router-link>
      </p>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const nameReg = ref("");
const emailReg = ref("");
const passwordReg = ref("");
const confirmReg = ref("");

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
      passwordReg.value,
    );
    if (result !== null) {
      alert(`${result.code}: ${result.message}`);
    }
  }
};
</script>

<style scoped>
p {
  line-height: 2rem;
}

.card {
  padding: 30px;
  background-color: rgb(37, 37, 37);
}

h1 {
  margin-bottom: 1.5rem;
}
</style>
