<template>
  <div class="card" v-bind:class="{ error: emptyFields }">
    <h1>Sign Up</h1>
    <form class="form-group" @submit.prevent="doLogin">
      <input
        v-model="name"
        type="text"
        class="form-control"
        placeholder="Name"
        required
      />
      <input type="submit" class="btn btn-primary" />
      <p>
        Already have an account?
        <router-link
          :to="{ name: 'login-normal', query: router.currentRoute.value.query }"
          >Sign in here</router-link
        >
      </p>
      <p>
        Want to create an account?
        <router-link
          :to="{ name: 'register', query: router.currentRoute.value.query }"
          >Register here</router-link
        >
      </p>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { RouterLink, useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

const name = ref("");

const emptyFields = ref(false);

const doLogin = async () => {
  if (name.value == "") {
    emptyFields.value = true;
  } else {
    emptyFields.value = false;
    // Anonymous login using firebase auth
    const result = await userStore.anonymousSignIn(name.value);
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
