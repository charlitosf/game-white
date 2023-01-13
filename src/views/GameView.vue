<script lang="ts" setup>
import Game from '@/components/Game.vue';
import Lobby from '@/components/Lobby.vue';
import { useGameStore } from '@/stores/game';
import { useRouter } from 'vue-router';

const router = useRouter();
const gameStore = useGameStore();

const onLeaveGame = () => {
  gameStore.leaveGame();

  router.push({ name: 'home' });
}

gameStore.$subscribe((_, state) => {
  if (!state.admin) {
    gameStore.gameId = null;
    router.push({ name: 'home' });
  }
})

</script>

<template>
  <button v-if="!gameStore.amIAdmin" @click="onLeaveGame" class="btn btn-danger mb-1">Leave game</button>

  <Lobby v-if="!gameStore.gameStarted" />
  <Game v-else />
</template>