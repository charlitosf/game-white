<script lang="ts" setup>
import { useGameStore } from '@/stores/game';
import { useUserStore } from '@/stores/user';
import { computed } from 'vue';

const gameStore = useGameStore();
const userStore = useUserStore();

const amIWhite = computed(() => gameStore.whitePlayers != null && gameStore.whitePlayers[userStore.user?.uid!]);

const onEndGame = () => {
  gameStore.endGame();
};
</script>

<template>
  <button v-if="gameStore.amIAdmin" @click="onEndGame" class="btn btn-danger">End Game</button>
  <div class="container-fullscreen centered">
    <span v-if="amIWhite">White :)</span>
    <span v-else>{{ gameStore.word }}</span>
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
</style>