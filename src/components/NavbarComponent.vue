<template>
  <div class="navbar">
    <RouterLink v-if="userStore.user" :to="{ name: 'home' }">Home</RouterLink>
    <RouterLink v-else :to="{ name: 'login-anonymous' }">Login</RouterLink>
    <span v-if="userStore.user?.displayName">
      Hello, {{ userStore.user.displayName }}
    </span>
    <span>
      <RouterLink to="/about">About</RouterLink>
      <a v-if="userStore.user" href="#" @click="onLogout">Logout</a>
    </span>
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
  align-items: center;
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
