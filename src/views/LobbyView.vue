<script lang="ts" setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const onStartGame = () => {
  router.push('/game');
};
</script>

<template>
  <h1>
    Lobby
  </h1>
  <button @click="onStartGame">Start Game</button>
  <h2>
    Participants
  </h2>
</template>