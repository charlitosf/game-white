<template>
  <div class="card" v-bind:class="{ error: emptyFields }">
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
        Don't want an account?
        <router-link
          :to="{
            name: 'login-anonymous',
            query: router.currentRoute.value.query,
          }"
          >Just enter your name here</router-link
        >
      </p>
      <p>
        Want an account?
        <router-link
          :to="{ name: 'register', query: router.currentRoute.value.query }"
          >Sign up here</router-link
        >
      </p>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();

const emailLogin = ref("");
const passwordLogin = ref("");

const emptyFields = ref(false);

const doLogin = async () => {
  if (emailLogin.value == "" || passwordLogin.value == "") {
    emptyFields.value = true;
  } else {
    emptyFields.value = false;
    // Login using firebase auth
    const result = await userStore.signIn(
      emailLogin.value,
      passwordLogin.value,
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
