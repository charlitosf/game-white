<template>
  <div class="navbar">
    <RouterLink v-if="userStore.user" :to="{ name: 'home' }">Home</RouterLink>
    <RouterLink v-if="!userStore.user" :to="{ name: 'login-anonymous' }"
      >Login</RouterLink
    >
    <RouterLink to="/about">About</RouterLink>
    <a v-if="userStore.user" href="#" @click="onLogout">Logout</a>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const onLogout = () => {
  userStore.logout();
};
</script>

<style lang="css" scoped>
.navbar {
  display: flex;
  width: 100%;
  justify-content: space-between;
  background-color: rgb(64, 64, 64);
}

.navbar a {
  padding: 1rem;
}

div a.router-link-exact-active {
  color: var(--color-text);
}

div a.router-link-exact-active:hover {
  background-color: transparent;
}
</style>
