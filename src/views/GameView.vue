<script lang="ts" setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const onEndGame = () => {
  router.push('/');
};

const onRestartGame = () => {
  
};
</script>

<template>
  <h1>
    Game
  </h1>
  <button @click="onEndGame">End Game</button>
  <button @click="onRestartGame">Restart Game</button>
</template>