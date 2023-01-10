<script lang="ts" setup>
import Game from '@/components/Game.vue';
import Lobby from '@/components/Lobby.vue';
import { useGameStore } from '@/stores/game';
import { useUserStore } from '@/stores/user';
import { getDatabase, ref as fRef, update } from '@firebase/database';
import { onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const gameStore = useGameStore();
gameStore.startGame(route.params.id.toString());

const db = getDatabase();
const gameRef = fRef(db, route.params.id.toString());

const onLeaveGame = () => {
  const updates: {[path: string]: any} = {};
  updates[`participants/${userStore.user?.uid}`] = null;
  updates[`whitePlayers/${userStore.user?.uid}`] = null;
  update(gameRef, updates);

  gameStore.stopGame();
  
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