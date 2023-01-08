<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getAuth } from '@firebase/auth';

const userStore = useUserStore();

const onLogout = () => {
  const auth = getAuth();
  auth.signOut();
  userStore.user = null;
}
</script>

<template>
  <div class="navbar">
    <RouterLink v-if="userStore.user" to="/">Home</RouterLink>
    <RouterLink v-if="!userStore.user" to="/login">Login</RouterLink>
    <RouterLink class="about" to="/about">About</RouterLink>
    <a v-if="userStore.user" href="#" @click="onLogout">Logout</a>
  </div>
  <RouterView />
</template>

<style scoped>
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

.about {
  margin-left: auto;
}

</style>
