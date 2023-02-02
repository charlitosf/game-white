<script lang="ts" setup>
import { useGameStore } from '@/stores/game';

const gameStore = useGameStore();

const onEndGame = () => {
  gameStore.endGame();
};
</script>

<template>
  <div class="flex justify-end">
    <button v-if="gameStore.amIAdmin" @click="onEndGame" class="btn btn-danger">End Game</button>
  </div>
  <div class="container-fullscreen centered">
    <span>{{ gameStore.word }}</span>
  </div>
</template>

<style>
.container-fullscreen {
  display: flex;
  height: 75vh;
  font-size: 5rem;
}

.centered {
  align-items: center;
  justify-content: center;
  margin: auto;
}

.justify-end {
  justify-content: end;
}
</style>