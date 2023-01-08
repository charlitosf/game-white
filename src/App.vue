<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="navbar">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/login">Login</RouterLink>
    <RouterLink class="about" to="/about">About</RouterLink>
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
