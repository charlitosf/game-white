<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const onStartGame = () => {
  router.push('/lobby');
};

const onJoinGame = () => {
  router.push('/lobby');
};
</script>

<template>
  <h1>Welcome to the game "White"!</h1>
  <button @click="onStartGame">Start new game</button>
  <button @click="onJoinGame">Join game</button>
  <h2>
    My currently started games:
  </h2>
  <div>
    Game1
  </div>
</template>
