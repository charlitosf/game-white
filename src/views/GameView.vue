<script lang="ts" setup>
import Game from '@/components/Game.vue';
import Lobby from '@/components/Lobby.vue';
import { useGameStore } from '@/stores/game';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();
gameStore.attachGame(route.params.id.toString());

const onLeaveGame = () => {
  gameStore.leaveGame();

  router.push({ name: 'home' });
}

gameStore.$subscribe((_, state) => {
  if (!state.gameId) {
    router.push({ name: 'home' });
  }
})

</script>

<template>
  <button v-if="!gameStore.amIAdmin" @click="onLeaveGame" class="btn btn-danger mb-1">Leave game</button>
  <Lobby v-if="!gameStore.gameStarted" :id="route.params.id" />
  <Game v-else :id="route.params.id" />
</template>